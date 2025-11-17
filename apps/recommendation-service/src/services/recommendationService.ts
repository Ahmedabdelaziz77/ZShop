import * as tf from "@tensorflow/tfjs";
import prisma from "packages/libs/prisma";

// -------------------------------------------
// INTERNAL SAFE FUNCTIONS (no external files)
// -------------------------------------------

// fetch user actions and map it to ML-ready format
async function fetchUserActivity(userId: string) {
  try {
    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true },
    });

    if (!analytics || !Array.isArray(analytics.actions)) return [];

    // map DB structure → ML structure
    return analytics.actions.map((a: any) => ({
      userId,
      productId: a.productId,
      actionType: a.action,
    }));
  } catch (err) {
    console.error("❌ Error reading userAnalytics:", err);
    return [];
  }
}

// local pre-processing
function preProcessData(userActions: any[], products: any[]) {
  if (!Array.isArray(userActions)) return null;
  if (!Array.isArray(products)) return null;

  const cleaned = userActions.filter(
    (a) => a.productId && typeof a.actionType === "string"
  );

  if (cleaned.length === 0) return null;

  const interactions = cleaned.map((a) => ({
    userId: a.userId,
    productId: a.productId,
    actionType: a.actionType,
  }));

  return {
    interactions,
    products,
  };
}

// -------------------------------------------
// MAIN RECOMMENDATION SERVICE
// -------------------------------------------

const EMBEDDING_DIM = 50;

interface UserAction {
  userId: string;
  productId: string;
  actionType: "product_view" | "add_to_cart" | "add_to_wishlist" | "purchase";
}

interface Interaction {
  userId: string;
  productId: string;
  actionType: UserAction["actionType"];
}

interface RecommendedProduct {
  productId: string;
  score: number;
}

export const recommendProducts = async (
  userId: string,
  allProducts: any[]
): Promise<string[]> => {
  // 1) Load user actions
  const userActions: UserAction[] = await fetchUserActivity(userId);
  if (userActions.length === 0) return [];

  // 2) Preprocess
  const data = preProcessData(userActions, allProducts);
  if (!data || !data.interactions) return [];

  const { interactions } = data as { interactions: Interaction[] };

  if (interactions.length === 0) return [];

  // 3) Build mapping
  const userMap: Record<string, number> = {};
  const productMap: Record<string, number> = {};

  let userIndex = 0;
  let productIndex = 0;

  interactions.forEach(({ userId, productId }) => {
    if (!(userId in userMap)) userMap[userId] = userIndex++;
    if (!(productId in productMap)) productMap[productId] = productIndex++;
  });

  const userCount = Object.keys(userMap).length;
  const productCount = Object.keys(productMap).length;

  if (productCount < 2) return [];

  // ----------------------------------------------------
  // 4) Build TensorFlow model
  // ----------------------------------------------------
  const userInput = tf.input({ shape: [1], dtype: "int32" });
  const productInput = tf.input({ shape: [1], dtype: "int32" });

  const userEmbedding = tf.layers
    .embedding({ inputDim: userCount, outputDim: EMBEDDING_DIM })
    .apply(userInput) as tf.SymbolicTensor;

  const productEmbedding = tf.layers
    .embedding({ inputDim: productCount, outputDim: EMBEDDING_DIM })
    .apply(productInput) as tf.SymbolicTensor;

  const userVector = tf.layers
    .flatten()
    .apply(userEmbedding) as tf.SymbolicTensor;
  const productVector = tf.layers
    .flatten()
    .apply(productEmbedding) as tf.SymbolicTensor;

  const merged = tf.layers
    .dot({ axes: 1 })
    .apply([userVector, productVector]) as tf.SymbolicTensor;

  const output = tf.layers
    .dense({ units: 1, activation: "sigmoid" })
    .apply(merged) as tf.SymbolicTensor;

  const model = tf.model({
    inputs: [userInput, productInput],
    outputs: output,
  });

  model.compile({
    optimizer: tf.train.adam(),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  // ----------------------------------------------------
  // 5) Training data tensors
  // ----------------------------------------------------

  const userTensor = tf.tensor1d(
    interactions.map((i) => userMap[i.userId]),
    "int32"
  );

  const productTensor = tf.tensor1d(
    interactions.map((i) => productMap[i.productId]),
    "int32"
  );

  const labels = tf.tensor2d(
    interactions.map((i) => {
      switch (i.actionType) {
        case "purchase":
          return [1.0];
        case "add_to_cart":
          return [0.7];
        case "add_to_wishlist":
          return [0.5];
        case "product_view":
          return [0.1];
        default:
          return [0];
      }
    }),
    [interactions.length, 1]
  );

  await model.fit([userTensor, productTensor], labels, {
    epochs: 8,
    batchSize: 32,
  });

  // ----------------------------------------------------
  // 6) Inference (prediction)
  // ----------------------------------------------------

  // USER must match productCount in shape
  const fullUserVector = tf.tensor1d(
    Array(productCount).fill(userMap[userId]),
    "int32"
  );

  const fullProductVector = tf.tensor1d(Object.values(productMap), "int32");

  const predictionTensor = model.predict([
    fullUserVector,
    fullProductVector,
  ]) as tf.Tensor;

  const scores = (await predictionTensor.array()) as number[];

  // ----------------------------------------------------
  // 7) Ranking and selecting top 10
  // ----------------------------------------------------

  const recommendedProducts: RecommendedProduct[] = Object.keys(productMap)
    .map((productId, i) => ({
      productId,
      score: scores[i] ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return recommendedProducts.map((p) => p.productId);
};
