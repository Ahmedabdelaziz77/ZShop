import prisma from "packages/libs/prisma";
import { recommendProducts } from "../services/recommendationService";
import { NextFunction, Response } from "express";

export const getRecommendedProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    // Load all products (used for fallback + ML)
    const products = await prisma.products.findMany({
      include: { images: true, shop: true },
    });

    // Load analytics for conditional training
    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true, recommendations: true, lastTrained: true },
    });

    const now = new Date();
    let recommendedProducts = [];

    // ---------------------------------------------
    // CASE 1: User has no analytics entry yet
    // ---------------------------------------------
    if (!analytics) {
      recommendedProducts = products.slice(-10);
      return res.status(200).json({
        success: true,
        recommendations: recommendedProducts,
      });
    }

    const actions = Array.isArray(analytics.actions) ? analytics.actions : [];

    const savedRecommendations = Array.isArray(analytics.recommendations)
      ? analytics.recommendations
      : [];

    const lastTrained = analytics.lastTrained
      ? new Date(analytics.lastTrained)
      : null;

    const hoursDiff = lastTrained
      ? (now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60)
      : Infinity;

    // ---------------------------------------------
    // CASE 2: User actions too small -> fallback
    // ---------------------------------------------
    if (actions.length < 50) {
      recommendedProducts = products.slice(-10);

      return res.status(200).json({
        success: true,
        recommendations: recommendedProducts,
      });
    }

    // ---------------------------------------------
    // CASE 3: Cached recommendations still valid (< 3 hours)
    // ---------------------------------------------
    if (hoursDiff < 3 && savedRecommendations.length > 0) {
      recommendedProducts = products.filter((p) =>
        savedRecommendations.includes(p.id)
      );

      return res.status(200).json({
        success: true,
        recommendations: recommendedProducts,
      });
    }

    // ---------------------------------------------
    // CASE 4: Train the model again
    // ---------------------------------------------
    const newRecommendedIds = await recommendProducts(userId, products);

    recommendedProducts = products.filter((p) =>
      newRecommendedIds.includes(p.id)
    );

    // save new recommendations
    await prisma.userAnalytics.update({
      where: { userId },
      data: {
        recommendations: newRecommendedIds,
        lastTrained: now,
      },
    });

    return res.status(200).json({
      success: true,
      recommendations: recommendedProducts,
    });
  } catch (err) {
    console.error("🔥 getRecommendedProducts ERROR:", err);
    return next(err);
  }
};
