import prisma from "packages/libs/prisma";
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
  const now = new Date();

  try {
    const sellers = await prisma.sellers.findMany({
      where: { isDeleted: true, deletedAt: { lte: now } },
      include: { shop: true },
    });

    for (const s of sellers) {
      try {
        const email = s.email.toLowerCase();

        await prisma.blocked_seller_emails.upsert({
          where: { email },
          update: {},
          create: { email, sellerId: s.id, reason: "Account deleted" },
        });

        if (s.shop?.id) {
          const shopId = s.shop.id;

          await prisma.products.deleteMany({ where: { shopId } });
          await prisma.orders.deleteMany({ where: { shopId } });
          await prisma.shopFollowers.deleteMany({ where: { shopId } });
          await prisma.shopAnalytics.deleteMany({ where: { shopId } });
          await prisma.uniqueShopVisitors.deleteMany({ where: { shopId } });
          await prisma.images.deleteMany({ where: { shopId } });
          await prisma.shop_settings.deleteMany({ where: { shopId } });

          await prisma.shops.delete({ where: { id: shopId } });
        }

        await prisma.sellers.delete({ where: { id: s.id } });
      } catch (e) {
        console.error("[seller purge] failed", s.id, e);
      }
    }
  } catch (err) {
    console.error("[seller purge] scan error", err);
  }
});
