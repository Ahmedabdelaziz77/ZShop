import { Prisma } from "@prisma/client";
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
      discountCodes = [],
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
              productsId: undefined,
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

export const getShopEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req?.seller?.shop?.id;
    if (!shopId)
      return next(new AuthError("Only seller can view shop events."));

    const events = await prisma.products.findMany({
      where: {
        shopId,
        isDeleted: { not: true },
        OR: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
      },
      include: { images: true },
      orderBy: [{ starting_date: "asc" }, { updatedAt: "desc" }],
    });

    return res.status(200).json({ success: true, events });
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

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    const baseFilter: Prisma.productsWhereInput = {
      isDeleted: { not: true },
      NOT: {
        AND: [
          { starting_date: { not: undefined } },
          { ending_date: { not: undefined } },
        ],
      },
    };
    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { totalSales: "desc" as Prisma.SortOrder };

    const [products, total, top10products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        where: baseFilter,
        orderBy: {
          totalSales: "desc",
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy,
      }),
    ]);

    res.status(200).json({
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
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

    const baseFilter: Prisma.productsWhereInput = {
      isDeleted: { not: true },
      NOT: { starting_date: null },
    };
    const [events, total, top10BySales] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        where: baseFilter,
        orderBy: {
          totalSales: "desc",
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        where: baseFilter,
        take: 10,
        orderBy: {
          totalSales: "desc",
        },
      }),
    ]);

    res.status(200).json({
      events,
      top10BySales,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.products.findUnique({
      where: { slug: req.params?.slug },
      include: {
        images: true,
        shop: true,
      },
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    return next(err);
  }
};

export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      starting_date: { equals: undefined },
    };

    if (categories && (categories as string[]).length > 0)
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };

    if (colors && (colors as string[]).length > 0)
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };

    if (sizes && (sizes as string[]).length > 0)
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(201).json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: { starting_date: null },
    };

    if (categories && (categories as string[]).length > 0)
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };

    if (colors && (colors as string[]).length > 0)
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };

    if (sizes && (sizes as string[]).length > 0)
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(201).json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (countries && String(countries).length > 0)
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(","),
      };

    if (categories && (categories as string[]).length > 0)
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          followers: true,
          products: true,
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.status(201).json({
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length < 2)
      return res.status(400).json({
        message:
          "Search query is required. Please provide at least 2 characters for search.",
      });

    const normalizedQuery = query.toLowerCase();

    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: { contains: normalizedQuery, mode: "insensitive" },
          },
          {
            short_description: {
              contains: normalizedQuery,
              mode: "insensitive",
            },
          },
          {
            detailed_description: {
              contains: normalizedQuery,
              mode: "insensitive",
            },
          },
          {
            tags: {
              hasSome: normalizedQuery.split(" ").map((t) => t.toLowerCase()),
            },
          },
          {
            category: { contains: normalizedQuery, mode: "insensitive" },
          },
          {
            subCategory: { contains: normalizedQuery, mode: "insensitive" },
          },
          {
            brand: { contains: normalizedQuery, mode: "insensitive" },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: false,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    let finalResults = products;
    if (finalResults.length === 0 && normalizedQuery.length > 3) {
      finalResults = await prisma.products.findMany({
        where: {
          title: {
            startsWith: normalizedQuery.slice(0, 3),
            mode: "insensitive",
          },
        },
        take: 10,
      });
    }

    return res.status(200).json({
      success: true,
      count: finalResults.length,
      query,
      products: finalResults,
    });
  } catch (err) {
    return next(err);
  }
};

export const getTopShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topShopsData = await prisma.orders.groupBy({
      by: ["shopId"],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 10,
    });

    const shopIds = topShopsData.map((item) => item?.shopId);
    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        address: true,
        ratings: true,
        followers: true,
        category: true,
      },
    });

    const encrichedShops = shops.map((shop) => {
      const salesData = topShopsData.find((ss) => ss.shopId === shop.id);
      return {
        ...shop,
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    const top10Shops = encrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({ shops: top10Shops });
  } catch (err) {
    return next(err);
  }
};

export const createEvent = async (
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
      discountCodes = [],
      stock,
      sale_price,
      regular_price,
      subCategory,
      custom_properties = {},
      images = [],
      starting_date,
      ending_date,
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
      images.length === 0 ||
      !starting_date ||
      !ending_date
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

    const parseIsoOrNull = (v: any) => (v ? new Date(v) : null);

    const startAt = parseIsoOrNull(starting_date);
    const endAt = parseIsoOrNull(ending_date);

    if (startAt && isNaN(startAt.getTime())) {
      return next(
        new ValidationError("starting_date must be a valid ISO datetime.")
      );
    }
    if (endAt && isNaN(endAt.getTime())) {
      return next(
        new ValidationError("ending_date must be a valid ISO datetime.")
      );
    }
    if (startAt && endAt && endAt <= startAt) {
      return next(
        new ValidationError("ending_date must be after starting_date.")
      );
    }

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
        starting_date: startAt,
        ending_date: endAt,
        images: {
          create: images
            .filter((image: any) => image && image.fileId && image.file_url)
            .map((image: any) => ({
              file_id: image.fileId,
              url: image.file_url,
              productsId: undefined,
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
