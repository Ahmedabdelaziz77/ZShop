import { AuthError, ValidationError } from "packages/error-handler";
import prisma from "packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

export const getShopSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = (req as any)?.seller?.shop?.id;
    if (!shopId) return next(new AuthError("Unauthorized"));

    const defaults = {
      lowStockThreshold: 10,
      notifications: { email: true, web: true, app: false },
    };

    const settings = await prisma.shop_settings.findUnique({
      where: { shopId },
    });
    res.status(200).json({
      success: true,
      settings: settings ? { ...defaults, ...settings } : defaults,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateShopSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = (req as any)?.seller?.shop?.id;
    if (!shopId) return next(new AuthError("Unauthorized"));

    const { lowStockThreshold, notifications } = req.body;

    if (
      lowStockThreshold != null &&
      (!Number.isFinite(+lowStockThreshold) || +lowStockThreshold < 0)
    )
      return next(new ValidationError("Low Stock Threshold must be >= 0"));

    const payload: any = {};
    if (lowStockThreshold != null)
      payload.lowStockThreshold = +lowStockThreshold;
    if (notifications) payload.notifications = notifications;

    const settings = await prisma.shop_settings.upsert({
      where: { shopId },
      update: payload,
      create: {
        shopId,
        ...{
          lowStockThreshold: 10,
          notifications: { email: true, web: true, app: false },
        },
        ...payload,
      },
    });

    return res.status(200).json({ success: true, settings });
  } catch (err) {
    return next(err);
  }
};

export const deleteSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = (req as any)?.seller?.id;
    if (!sellerId) return next(new AuthError("Unauthorized access!"));

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: { id: true, isDeleted: true, deletedAt: true },
    });

    if (!seller) return next(new ValidationError("Seller not found!"));

    if (seller.isDeleted)
      return next(
        new ValidationError("Seller has already been marked for deletion!")
      );

    const deletedSeller = await prisma.sellers.update({
      where: { id: seller.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        "Seller marked for deletion. The account will be permanently removed after 28 days unless restored.",
      deletedAt: deletedSeller.deletedAt,
    });
  } catch (err) {
    return next(err);
  }
};

export const getShopDeletionState = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = (req as any)?.seller?.id;
    if (!sellerId) return next(new AuthError("Unauthorized access!"));

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: { isDeleted: true, deletedAt: true },
    });

    if (!seller) return next(new ValidationError("Seller not found!"));

    return res.status(200).json({
      isDeleted: !!seller.isDeleted,
      deletedAt: seller.deletedAt ?? null,
    });
  } catch (err) {
    return next(err);
  }
};

export const restoreSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = (req as any)?.seller?.id;
    if (!sellerId) return next(new AuthError("Unauthorized access!"));

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: { id: true, isDeleted: true, deletedAt: true },
    });

    if (!seller) return next(new ValidationError("Seller not found!"));

    if (!seller.isDeleted)
      return res
        .status(400)
        .json({ message: "Seller isn't in deleted state!" });

    if (!seller.deletedAt || new Date() >= seller.deletedAt)
      return res.status(400).json({
        message: "Deletion window elapsed. Account cannot be restored.",
      });

    await prisma.sellers.update({
      where: { id: seller.id },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: "Seller successfully restored!" });
  } catch (err) {
    return next(err);
  }
};

export const getStripeAccount = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;
    if (!sellerId) return next(new ValidationError("Seller ID is required!"));

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });

    if (!seller) return next(new ValidationError("Seller not found!"));

    if (!seller.stripeId) {
      return res.status(404).json({
        success: false,
        connected: false,
        message: "Seller not connected to Stripe",
      });
    }

    // Retrieve core Stripe data
    const [account, balance, payouts] = await Promise.all([
      stripe.accounts.retrieve(seller.stripeId),
      stripe.balance.retrieve({ stripeAccount: seller.stripeId }),
      stripe.payouts.list({ limit: 5 }, { stripeAccount: seller.stripeId }),
    ]);

    const last = payouts.data[0];
    const lastPayoutISO = last?.arrival_date
      ? new Date(last.arrival_date * 1000).toISOString()
      : null;

    // Normalize balances (available only)
    const availableBalances = (balance.available || []).map((b) => ({
      amount: b.amount,
      currency: b.currency,
    }));

    const pickBusinessName = (args: {
      account: Stripe.Account;
      shopName?: string | null;
      sellerName?: string | null;
    }) =>
      args.account.business_profile?.name ||
      args.account.settings?.dashboard?.display_name ||
      args.shopName ||
      args.sellerName ||
      undefined;
    return res.json({
      success: true,
      connected: true,
      email: account.email ?? seller.email ?? undefined,
      businessName: pickBusinessName({
        account,
        shopName: seller.shop?.name,
        sellerName: seller.name,
      }),
      country: account.country,
      payoutsEnabled: !!account.payouts_enabled,
      chargesEnabled: !!account.charges_enabled,
      lastPayout: lastPayoutISO,
      dashboardUrl: null,
      balances: availableBalances,
      recentPayouts: payouts.data.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        arrivalDate: p.arrival_date
          ? new Date(p.arrival_date * 1000).toISOString()
          : null,
      })),
    });
  } catch (err) {
    return next(err);
  }
};
