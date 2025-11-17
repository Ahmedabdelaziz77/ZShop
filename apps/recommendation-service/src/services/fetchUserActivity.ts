// services/fetchUserActivity.ts
import prisma from "packages/libs/prisma";

export const getUserActivity = async (userId: string) => {
  try {
    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      select: { actions: true },
    });

    if (!analytics || !Array.isArray(analytics.actions)) return [];

    // Convert DB structure to ML structure
    return analytics.actions.map((a: any) => ({
      userId,
      productId: a.productId,
      actionType: a.action, // important: mapping action → actionType
    }));
  } catch (err) {
    console.error("❌ Error fetching user activity:", err);
    return [];
  }
};
