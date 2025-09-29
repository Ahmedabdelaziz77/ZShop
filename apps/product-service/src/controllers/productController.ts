import { NextFunction, Request, Response } from "express";
import prisma from "packages/libs/prisma";
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_configs.findFirst();
    if (!config)
      return res.status(404).json({
        message: "Categories not found!",
      });

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (err) {
    return next(err);
  }
};
