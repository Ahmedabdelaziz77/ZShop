import { NextFunction, Request, Response } from "express";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "packages/error-handler";
import imagekit from "packages/libs/imageKit";
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

export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;
    const isDiscountExist = await prisma.discount_codes.findUnique({
      where: { discountCode },
    });

    if (isDiscountExist)
      return next(
        new ValidationError(
          "Discount code already available please use a different code!"
        )
      );

    if (isNaN(parseFloat(discountValue)) || parseFloat(discountValue) <= 0) {
      return next(
        new ValidationError("Discount value must be a valid positive number.")
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (err) {
    next(err);
  }
};

export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({ success: true, discount_codes });
  } catch (err) {
    next(err);
  }
};

export const deleteDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode)
      return next(new NotFoundError("Discount code not found!"));

    if (discountCode.sellerId !== sellerId)
      return next(new ValidationError("Unauthorized access!"));

    await prisma.discount_codes.delete({ where: { id } });

    return res
      .status(200)
      .json({ message: "Discount code successfully deleted!" });
  } catch (err) {
    next(err);
  }
};

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;

    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });

    res.status(201).json({
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    res.status(201).json({
      success: true,
      response,
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      custom_properties = {},
      images = [],
    } = req.body;
    if (
      !title ||
      !short_description ||
      !detailed_description ||
      !warranty ||
      !slug ||
      !tags ||
      !cash_on_delivery ||
      !brand ||
      !category ||
      !stock ||
      !sale_price ||
      !regular_price ||
      !subCategory ||
      !images ||
      images.length === 0
    )
      return next(new ValidationError("Missing required fields!"));

    if (!req.seller.id)
      return next(new AuthError("Only seller can create products!"));

    const slugChecking = await prisma.products.findUnique({
      where: { slug },
    });

    if (slugChecking)
      return next(
        new ValidationError("Slug already exist! Please use a different slug!")
      );

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discountCodes.map((discount: string) => discount),
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: custom_properties || {},
        custom_specifications: custom_specifications || [],
        images: {
          create: images
            .filter((image: any) => image && image.fileId && image.file_url)
            .map((image: any) => ({
              file_id: image.fileId,
              url: image.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      newProduct,
    });
  } catch (err) {
    next(err);
  }
};

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: { shopId: req?.seller?.shop?.id },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerShopId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) return next(new ValidationError("Product not found!"));

    if (product.shopId !== sellerShopId)
      return next(
        new ValidationError(
          "Unauthorized access! You can only delete your own products."
        )
      );

    if (product.isDeleted)
      return next(
        new ValidationError("Product has already been marked for deletion!")
      );

    const deletedProduct = await prisma.products.update({
      where: { id: product.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        "Product marked for deletion. It will be permanently removed after 24 hours unless restored.",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (err) {
    next(err);
  }
};

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const sellerShopId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) return next(new ValidationError("Product not found!"));

    if (product.shopId !== sellerShopId)
      return next(
        new ValidationError(
          "Unauthorized access! You can only delete your own products."
        )
      );

    if (!product.isDeleted)
      return res.status(400).json({
        message: "Product isn't in deleted state!",
      });

    await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      message: "Product successfully restored!",
    });
  } catch (err) {
    next(err);
  }
};
