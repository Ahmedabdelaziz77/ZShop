import { NextFunction, Request, Response } from "express";
import { NotFoundError, ValidationError } from "packages/error-handler";
import prisma from "packages/libs/prisma";
import redis from "packages/libs/redis";
import Stripe from "stripe";
import crypto from "crypto";
import { sendEmail } from "../utils/sendMail";
import { Prisma } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

async function getAccountCapabilities(accountId: string) {
  const acct = await stripe.accounts.retrieve(accountId);
  return {
    acct,
    transfersStatus: acct.capabilities?.transfers,
    cardPaymentsStatus: acct.capabilities?.card_payments,
  };
}

async function createPIWithFallback({
  amountInCents,
  sellerAccountId,
  platformFeeInCents,
  metadata,
}: {
  amountInCents: number;
  sellerAccountId: string;
  platformFeeInCents: number;
  metadata?: Record<string, string>;
}) {
  const { transfersStatus } = await getAccountCapabilities(sellerAccountId);
  if (transfersStatus === "active") {
    return await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      application_fee_amount: platformFeeInCents,
      transfer_data: { destination: sellerAccountId },
      on_behalf_of: sellerAccountId,
      metadata,
    });
  }
  return await stripe.paymentIntents.create(
    {
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      application_fee_amount: platformFeeInCents,
      metadata,
    },
    { stripeAccount: sellerAccountId }
  );
}

export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;
  const customerAmount = Math.round(amount * 100);
  const platformFee = Math.floor(customerAmount * 0.1);
  try {
    const pi = await createPIWithFallback({
      amountInCents: customerAmount,
      sellerAccountId: sellerStripeAccountId,
      platformFeeInCents: platformFee,
      metadata: { sessionId, userId: String(req.user.id) },
    });
    res.send({ clientSecret: pi.client_secret, scope: "connected" });
  } catch (err) {
    return next(err);
  }
};

export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user.id;

    if (!cart || !Array.isArray(cart) || cart.length === 0)
      return next(new ValidationError("Cart is empty or invalid!"));

    const normalizedCart = JSON.stringify(
      cart
        .map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          shopId: item.shopId,
          selectedOptions: item.selectedOptions || {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    const keys = await redis.keys("payment-session");
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a: any, b: any) => a.id.localeCompare(b.id))
          );
          if (existingCart === normalizedCart)
            return res.status(200).json({ sessionId: key.split(":")[1] });
          else redis.del(key);
        }
      }
    }

    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];
    const shops = await prisma.shops.findMany({
      where: { id: { in: uniqueShopIds } },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    const sellerData = shops.map((shop: any) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop?.sellers?.stripeId,
    }));

    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.quantity * item.sale_price;
    }, 0);

    const sessionId = crypto.randomUUID();
    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600,
      JSON.stringify(sessionData)
    );

    return res.status(201).json({ sessionId });
  } catch (err) {
    return next(err);
  }
};

export const verifyPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId;
    if (!sessionId)
      return res.status(400).json({ error: "Session ID is required!" });

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData)
      return res.status(404).json({ error: "Session not found or expired!" });

    const session = JSON.parse(sessionData);

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (err) {
    return next(err);
  }
};

// export const createOrder = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   console.log("im here");
//   try {
//     const stripeSignature = req.headers["stripe-signature"];
//     if (!stripeSignature) {
//       console.log("bad signature");
//       return res.status(400).send("Missing Stripe Signature");
//     }
//     console.log(
//       "🔍 Stripe signature header:",
//       stripeSignature ? "FOUND ✅" : "NOT FOUND ❌"
//     );

//     const rawBody = (req as any).rawBody;
//     console.log(
//       "📦 Raw body type:",
//       Buffer.isBuffer(rawBody) ? "Buffer ✅" : typeof rawBody
//     );
//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(
//         rawBody,
//         stripeSignature,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
//       console.log("✅ Stripe event verified successfully:", event.type);
//     } catch (err: any) {
//       console.error("❌ Stripe verification failed:", err.message);
//       return res.status(400).send(`Webhook Error : ${err.message}`);
//     }

//     if (event.type === "payment_intent.succeeded") {
//       const paymentIntent = event.data.object as Stripe.PaymentIntent;
//       const sessionId = paymentIntent.metadata.sessionId;
//       const userId = paymentIntent.metadata.userId;

//       const sessionKey = `payment-session:${sessionId}`;
//       const sessionData = await redis.get(sessionKey);

//       if (!sessionData) {
//         return res
//           .status(200)
//           .send("No session found, skipping order creation");
//       }

//       const { cart, totalAmount, shippingAddressId, coupon } =
//         JSON.parse(sessionData);

//       const user = await prisma.users.findUnique({ where: { id: userId } });
//       if (!user) {
//         return res.status(400).send("User not found!");
//       }
//       const { name, email } = user;

//       const shopGrouped = cart.reduce((acc: any, item: any) => {
//         if (!acc[item.shopId]) acc[item.shopId] = [];
//         acc[item.shopId].push(item);
//         return acc;
//       }, {});

//       for (const shopId in shopGrouped) {
//         const orderItems = shopGrouped[shopId];
//         let orderTotal = orderItems.reduce((sum: number, item: any) => {
//           return sum + item.quantity * item.sale_price;
//         }, 0);

//         if (
//           coupon &&
//           coupon.discountProductId &&
//           orderItems.some((item: any) => item.id === coupon.discountProductId)
//         ) {
//           const discountItem = orderItems.find(
//             (item: any) => item.id === coupon.discountProductId
//           );
//           if (discountItem) {
//             const discount =
//               coupon.discountPercent > 0
//                 ? (discountItem.sale_price *
//                     discountItem.quantity *
//                     coupon.discountPercent) /
//                   100
//                 : coupon.discountAmount;

//             orderTotal -= discount;
//           }
//         }

//         await prisma.orders.create({
//           data: {
//             userId,
//             shopId,
//             total: orderTotal,
//             status: "Paid",
//             shippingAddressId: shippingAddressId || null,
//             couponCode: coupon?.code || null,
//             discountAmount: coupon?.discountAmount || 0,
//             items: {
//               create: orderItems.map((item: any) => ({
//                 productId: item.id,
//                 quantity: item.quantity,
//                 price: item.sale_price,
//                 selectedOptions: item.selectedOptions,
//               })),
//             },
//           },
//         });

//         for (const item of orderItems) {
//           const { id: productId, quantity } = item;
//           await prisma.products.update({
//             where: { id: productId },
//             data: {
//               stock: { decrement: quantity },
//               totalSales: { increment: quantity },
//             },
//           });

//           await prisma.productAnalytics.upsert({
//             where: { productId },
//             create: {
//               productId,
//               shopId,
//               purchases: quantity,
//               lastViewedAt: new Date(),
//             },
//             update: {
//               purchases: { increment: quantity },
//             },
//           });

//           const existingAnalytics = await prisma.userAnalytics.findUnique({
//             where: { userId },
//           });
//           const newAction = {
//             productId,
//             shopId,
//             action: "purchase",
//             timeStamp: Date.now(),
//           };

//           const currentActions = Array.isArray(existingAnalytics?.actions)
//             ? (existingAnalytics.actions as Prisma.JsonArray)
//             : [];

//           if (existingAnalytics) {
//             await prisma.userAnalytics.update({
//               where: { userId },
//               data: {
//                 lastVisited: new Date(),
//                 actions: [...currentActions, newAction],
//               },
//             });
//           } else {
//             await prisma.userAnalytics.create({
//               data: {
//                 userId,
//                 lastVisited: new Date(),
//                 actions: [newAction],
//               },
//             });
//           }
//         }
//       }

//       await sendEmail(
//         email,
//         "Your Zshop Order Confirmation",
//         "order-confirmation",
//         {
//           name,
//           cart,
//           totalAmount: coupon?.discountAmount
//             ? totalAmount - coupon?.discountAmount
//             : totalAmount,
//           trackingUrl: `https://zshop.com/order/${sessionId}`,
//         }
//       );

//       const createdShopIds = Object.keys(shopGrouped);
//       const sellerShops = await prisma.shops.findMany({
//         where: { id: { in: createdShopIds } },
//         select: {
//           id: true,
//           sellerId: true,
//           name: true,
//         },
//       });

//       for (const shop of sellerShops) {
//         const firstProduct = (shopGrouped as any)[shop.id][0];
//         const productTitle = firstProduct?.title || "new item";

//         await prisma.notifications.create({
//           data: {
//             title: "New Order Received",
//             message: `A customer just ordered ${productTitle} from your shop.`,
//             creatorId: userId,
//             receiverId: shop.sellerId,
//             redirect_link: `https://zshop.com/order/${sessionId}`,
//           },
//         });

//         await prisma.notifications.create({
//           data: {
//             title: "Platform Order Alert",
//             message: `A new order was placed by ${name}.`,
//             creatorId: userId,
//             receiverId: "admin",
//             redirect_link: `https://zshop.com/order/${sessionId}`,
//           },
//         });
//       }
//       await redis.del(sessionKey);
//       return res
//         .status(200)
//         .json({ received: true, message: "Order placed successfully!" });
//     }
//     return res.status(200).json({ received: true });
//   } catch (err) {
//     return next(err);
//   }
// };

export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let userId: string;
    let sessionId: string;
    const isWebhook = !!req.headers["stripe-signature"];
    if (isWebhook) {
      const stripeSignature = req.headers["stripe-signature"];
      const rawBody = (req as any).rawBody;

      if (!stripeSignature || !rawBody) {
        throw new ValidationError("Missing Stripe signature or raw body");
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          stripeSignature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
        console.log("✅ Stripe event verified:", event.type);
      } catch (err: any) {
        throw new ValidationError(`Webhook Error: ${err.message}`);
      }

      if (event.type !== "payment_intent.succeeded") {
        return res.status(200).json({ received: true });
      }

      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      sessionId = paymentIntent.metadata?.sessionId;
      userId = paymentIntent.metadata?.userId;

      if (!sessionId || !userId) {
        throw new ValidationError("Missing sessionId or userId in metadata");
      }
    } else {
      userId = req.user?.id;
      sessionId = req.body.sessionId;

      if (!userId)
        throw new ValidationError("User ID missing in token context");
      if (!sessionId) throw new ValidationError("Session ID is required");
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);
    if (!sessionData)
      throw new ValidationError("Payment session not found or expired");

    const { cart, totalAmount, shippingAddressId, coupon } =
      JSON.parse(sessionData);
    if (!Array.isArray(cart) || cart.length === 0)
      throw new ValidationError("Cart data missing or invalid");

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new ValidationError("User not found");
    const { name, email } = user;
    const shopGrouped = cart.reduce((acc: any, item: any) => {
      if (!acc[item.shopId]) acc[item.shopId] = [];
      acc[item.shopId].push(item);
      return acc;
    }, {});
    for (const shopId in shopGrouped) {
      const orderItems = shopGrouped[shopId];
      let orderTotal = orderItems.reduce(
        (sum: number, item: any) =>
          sum + Number(item.quantity) * Number(item.sale_price),
        0
      );

      if (coupon && coupon.discountProductId) {
        const discountItem = orderItems.find(
          (i: any) => i.id === coupon.discountProductId
        );
        if (discountItem) {
          const discount =
            coupon.discountPercent && coupon.discountPercent > 0
              ? (discountItem.sale_price *
                  discountItem.quantity *
                  coupon.discountPercent) /
                100
              : coupon.discountAmount || 0;
          orderTotal -= discount;
        }
      }

      await prisma.orders.create({
        data: {
          userId,
          shopId,
          total: orderTotal,
          status: "Paid",
          shippingAddressId: shippingAddressId || null,
          couponCode: coupon?.code || null,
          discountAmount: coupon?.discountAmount || 0,
          items: {
            create: orderItems.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.sale_price,
              selectedOptions: item.selectedOptions,
            })),
          },
        },
      });
      for (const item of orderItems) {
        const { id: productId, quantity } = item;

        await prisma.products.update({
          where: { id: productId },
          data: {
            stock: { decrement: quantity },
            totalSales: { increment: quantity },
          },
        });

        await prisma.productAnalytics.upsert({
          where: { productId },
          create: {
            productId,
            shopId,
            purchases: quantity,
            lastViewedAt: new Date(),
          },
          update: {
            purchases: { increment: quantity },
          },
        });

        const existingAnalytics = await prisma.userAnalytics.findUnique({
          where: { userId },
        });

        const newAction = {
          productId,
          shopId,
          action: "purchase",
          timeStamp: Date.now(),
        };

        const currentActions = Array.isArray(existingAnalytics?.actions)
          ? (existingAnalytics.actions as Prisma.JsonArray)
          : [];

        if (existingAnalytics) {
          await prisma.userAnalytics.update({
            where: { userId },
            data: {
              lastVisited: new Date(),
              actions: [...currentActions, newAction],
            },
          });
        } else {
          await prisma.userAnalytics.create({
            data: {
              userId,
              lastVisited: new Date(),
              actions: [newAction],
            },
          });
        }
      }
    }

    await sendEmail(
      email,
      "Your Zshop Order Confirmation",
      "order-confirmation",
      {
        name,
        cart,
        totalAmount:
          coupon?.discountAmount && totalAmount > coupon.discountAmount
            ? totalAmount - coupon.discountAmount
            : totalAmount,
        trackingUrl: `https://zshop.com/order/${sessionId}`,
      }
    );
    const createdShopIds = Object.keys(shopGrouped);
    const sellerShops = await prisma.shops.findMany({
      where: { id: { in: createdShopIds } },
      select: { id: true, sellerId: true, name: true },
    });

    for (const shop of sellerShops) {
      const productTitle =
        (shopGrouped[shop.id]?.[0]?.title as string) || "new item";
      await prisma.notifications.createMany({
        data: [
          {
            title: "New Order Received",
            message: `A customer just ordered ${productTitle} from your shop.`,
            creatorId: userId,
            receiverId: shop.sellerId,
            redirect_link: `https://zshop.com/order/${sessionId}`,
          },
          {
            title: "Platform Order Alert",
            message: `A new order was placed by ${name}.`,
            creatorId: userId,
            receiverId: "admin",
            redirect_link: `https://zshop.com/order/${sessionId}`,
          },
        ],
      });
    }

    await redis.del(sessionKey);

    return res.status(200).json({
      received: true,
      message: `✅ Order placed successfully in ${
        isWebhook ? "webhook" : "manual"
      } mode!`,
    });
  } catch (err) {
    console.error("❌ Error in createOrder:", err);
    return next(err);
  }
};

export const getSellerOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: { sellerId: (req as any)?.seller?.id },
    });

    const orders = await prisma.orders.findMany({
      where: { shopId: shop?.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(201).json({ success: true, orders });
  } catch (err) {
    return next(err);
  }
};

export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return next(new NotFoundError("Order not found with the id!"));

    const shippingAddress = order.shippingAddressId
      ? await prisma.address.findUnique({
          where: { id: order?.shippingAddressId },
        })
      : null;

    const coupon = order.couponCode
      ? await prisma.discount_codes.findUnique({
          where: { discountCode: order?.couponCode },
        })
      : null;

    const productIds = order.items.map((item) => item.productId);
    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items: any = order.items.map((item) => ({
      ...item,
      selectedOptions: item.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress,
        couponCode: coupon,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!orderId || !deliveryStatus)
      return res
        .status(400)
        .json({ error: "Missin order ID or delivery status!" });

    const allowedStatuses = [
      "Ordered",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];

    if (!allowedStatuses.includes(deliveryStatus))
      return next(new ValidationError("Invalid delivery status!"));

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) return next(new NotFoundError("Order not found!"));

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        deliveryStatus,
        updatedAt: new Date(),
      },
    });
    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully!",
      order: updatedOrder,
    });
  } catch (err) {
    return next(err);
  }
};

export const verifyCouponCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cart } = req.body;
    if (!couponCode || !cart || cart.length === 0)
      return next(new ValidationError("Coupon code and cart are required!"));

    const discount = await prisma.discount_codes.findUnique({
      where: { discountCode: couponCode },
    });
    if (!discount) return next(new ValidationError("Coupon code isn't valid!"));

    const matchingProduct = cart.find((item: any) =>
      item?.discount_codes?.some((d: any) => d === discount.id)
    );

    if (!matchingProduct)
      return res.status(200).json({
        valid: false,
        discount: 0,
        discountAmoun: 0,
        message: "No matching product found in cart for this coupon",
      });

    let discountAmount = 0;
    const price = matchingProduct.sale_price * matchingProduct.quantity;

    if (discount.discountType === "percentage")
      discountAmount = (price * discount.discountValue) / 100;
    else if (discount.discountType === "flat")
      discountAmount = discount.discountValue;

    discountAmount = Math.min(discountAmount, price);

    res.status(200).json({
      valid: true,
      discount: discount.discountValue,
      discountAmount: discountAmount.toFixed(2),
      discountProductId: matchingProduct.id,
      discountType: discount.discountType,
      message: "Discount applied to 1 eligible product",
    });
  } catch (err) {
    return next(err);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { userId: (req as any).user.id },
      include: { items: true },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(201).json({
      success: true,
      orders,
    });
  } catch (err) {
    return next(err);
  }
};

export const getAdminOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      include: { user: true, shop: true },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    return next(err);
  }
};
