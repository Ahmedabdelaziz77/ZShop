import { NextFunction, Request, Response } from "express";
import { AuthError, ValidationError } from "packages/error-handler";
import prisma from "packages/libs/prisma";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where: {
          isDeleted: { not: true },
          NOT: {
            AND: [
              { starting_date: { not: undefined } },
              { ending_date: { not: undefined } },
            ],
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          images: {
            select: { url: true },
            take: 1,
          },
          shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({
        where: {
          isDeleted: { not: true },
          NOT: {
            AND: [
              { starting_date: { not: undefined } },
              { ending_date: { not: undefined } },
            ],
          },
        },
      }),
    ]);
    const totalPages = Math.ceil(totalProducts / limit);
    res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where: {
          isDeleted: { not: true },
          NOT: { starting_date: null },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          starting_date: true,
          ending_date: true,
          images: {
            select: { url: true },
            take: 1,
          },
          shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({
        where: {
          isDeleted: { not: true },
          NOT: { starting_date: null },
        },
      }),
    ]);
    const totalPages = Math.ceil(totalProducts / limit);
    res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const addNewAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, role } = req.body;
    const isUser = await prisma.users.findUnique({
      where: { email },
    });

    if (!isUser) return next(new ValidationError("Something went wrong!"));

    const updateRole = await prisma.users.update({
      where: { email },
      data: {
        role,
      },
    });

    return res.status(201).json({
      success: true,
      updateRole,
    });
  } catch (err) {
    return next(err);
  }
};

export const getAllCustomizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_configs.findFirst();

    return res.status(200).json({
      categories: config?.categories || [],
      subCategories: config?.subCategories || {},
      logo: config?.logo || null,
      banner: config?.banner || null,
    });
  } catch (err) {
    return next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
          isBanned: true,
        },
      }),
      prisma.users.count(),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,
      data: users,
      meta: {
        totalUsers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getAllSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [sellers, totalSellers] = await Promise.all([
      prisma.sellers.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          shop: {
            select: { id: true, name: true, avatar: true, address: true },
          },
        },
      }),
      prisma.sellers.count(),
    ]);

    const totalPages = Math.ceil(totalSellers / limit);

    return res.status(200).json({
      success: true,
      data: sellers,
      meta: {
        totalSellers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const banUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!req.admin || req.admin.role !== "admin")
      return next(new AuthError("Forbidden: Admins only!"));

    const existingUser = await prisma.users.findUnique({ where: { id } });
    if (!existingUser) return next(new ValidationError("User not found!"));

    if (existingUser.isBanned)
      return next(new ValidationError("User is already banned!"));

    const user = await prisma.users.update({
      where: { id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason || "No reason provided",
      },
      select: {
        id: true,
        name: true,
        email: true,
        bannedAt: true,
        banReason: true,
      },
    });

    return res.status(200).json({
      message: `${user.name} has been banned.`,
      user,
    });
  } catch (err) {
    return next(err);
  }
};

export const unbanUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.admin || req.admin.role !== "admin")
      return next(new AuthError("Forbidden: Admins only!"));

    const existingUser = await prisma.users.findUnique({ where: { id } });
    if (!existingUser) return next(new ValidationError("User not found!"));

    if (!existingUser.isBanned)
      return next(new ValidationError("User is not banned."));

    const user = await prisma.users.update({
      where: { id },
      data: {
        isBanned: false,
        bannedAt: null,
        banReason: null,
      },
      select: { id: true, name: true, email: true },
    });

    return res.status(200).json({
      message: `${user.name} has been unbanned.`,
      user,
    });
  } catch (err) {
    return next(err);
  }
};
