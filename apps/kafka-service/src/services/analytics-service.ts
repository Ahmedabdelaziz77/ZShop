import prisma from "packages/libs/prisma";

export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: { userId: event.userId },
      select: { actions: true },
    });

    let updatedActions: any = existingData?.actions || [];

    const actionExists = updatedActions.some(
      (entry: any) =>
        entry.productId === event.productId && event.action === entry.action
    );

    // For the recommendation system we will store product view
    if (event.action === "product_view")
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: "product_view",
        timestamp: new Date(),
      });
    else if (
      ["add_to_cart", "add_to_wishlist"].includes(event.action) &&
      !actionExists
    )
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: event?.action,
        timestamp: new Date(),
      });
    else if (event.action === "remove_from_cart")
      updatedActions = updatedActions.filter(
        (entry: any) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_cart"
          )
      );
    else if (event.action === "remove_from_wishlist")
      updatedActions = updatedActions.filter(
        (entry: any) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_wishlist"
          )
      );

    if (updatedActions.length > 100) updatedActions.shift();

    const extraFields: Record<string, any> = {};

    if (event.country) extraFields.country = event.country;

    if (event.city) extraFields.city = event.city;

    if (event.device) extraFields.device = event.device;

    await prisma.userAnalytics.upsert({
      where: {
        userId: event.userId,
      },
      update: {
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event.userId,
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });

    // Product analytics
    await updateProductAnalytics(event);

    if (event.action === "shop_visit") {
      await updateShopAnalytics(event);
    }
  } catch (err) {
    console.log("Error storing user analytics:", err);
  }
};

const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;
    const updateFields: any = {};

    if (event.action === "product_view") updateFields.views = { increment: 1 };

    if (event.action === "add_to_cart")
      updateFields.cartAdds = { increment: 1 };
    if (event.action === "remove_from_cart")
      updateFields.cartAdds = { decrement: 1 };

    if (event.action === "add_to_wishlist")
      updateFields.wishlistAdds = { increment: 1 };
    if (event.action === "remove_from_wishlist")
      updateFields.wishlistAdds = { decrement: 1 };

    if (event.action === "purchase") updateFields.purchases = { increment: 1 };

    await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: {
        lastViewedAt: new Date(),
        ...updateFields,
      },
      create: {
        productId: event.productId,
        shopId: event.shopId || null,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishlistAdds: event.action === "add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchases" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  } catch (err) {
    console.log("Error updating product analytics:", err);
  }
};

const updateShopAnalytics = async (event: any) => {
  try {
    if (!event.shopId) return;

    const safeCountry = event.country || "Unknown";
    const safeCity = event.city || "Unknown";
    const safeDevice = event.device || "Unknown";

    // Get existing analytics data
    const analytics = await prisma.shopAnalytics.findUnique({
      where: { shopId: event.shopId },
    });

    const incrementCount = (obj: any, key: string) => ({
      ...(obj || {}),
      [key]: (obj?.[key] || 0) + 1,
    });

    const updatedCountryStats = incrementCount(
      (analytics?.countryStats as any) || {},
      safeCountry
    );
    const updatedCityStats = incrementCount(
      (analytics?.cityStats as any) || {},
      safeCity
    );
    const updatedDeviceStats = incrementCount(
      (analytics?.deviceStats as any) || {},
      safeDevice
    );

    await prisma.shopAnalytics.upsert({
      where: { shopId: event.shopId },
      update: {
        totalVisitors: { increment: 1 },
        lastVisitedAt: new Date(),
        countryStats: updatedCountryStats,
        cityStats: updatedCityStats,
        deviceStats: updatedDeviceStats,
      },
      create: {
        shopId: event.shopId,
        totalVisitors: 1,
        lastVisitedAt: new Date(),
        countryStats: { [safeCountry]: 1 },
        cityStats: { [safeCity]: 1 },
        deviceStats: { [safeDevice]: 1 },
      },
    });

    // Record unique visit in `uniqueShopVisitors`
    if (event.userId) {
      await prisma.uniqueShopVisitors.upsert({
        where: {
          shopId_userId: { shopId: event.shopId, userId: event.userId },
        },
        update: { visitedAt: new Date() },
        create: { shopId: event.shopId, userId: event.userId },
      });
    }
  } catch (err) {
    console.error("Error updating shop analytics:", err);
  }
};
