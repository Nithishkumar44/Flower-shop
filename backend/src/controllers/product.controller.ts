import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { NotFoundError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      category,
      minPrice,
      maxPrice,
      flowerType,
      occasion,
      deliveryType,
      sortBy = 'createdAt', // priceAsc, priceDesc, popularity, createdAt
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter query
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { flowerType: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { slug: String(category) };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (flowerType) {
      where.flowerType = { equals: String(flowerType), mode: 'insensitive' };
    }

    if (occasion) {
      where.occasion = { equals: String(occasion), mode: 'insensitive' };
    }

    if (deliveryType) {
      where.deliveryType = String(deliveryType);
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'priceAsc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'priceDesc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const [products, totalItems] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        include: {
          category: {
            select: { name: true, slug: true }
          }
        }
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNumber);

    res.status(200).json({
      status: 'success',
      metadata: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
      },
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const getBestsellers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      where: { isBestSeller: true },
      take: 4,
      include: {
        category: {
          select: { name: true, slug: true }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const getSameDayCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      where: { isSameDayDelivery: true },
      take: 4,
      include: {
        category: {
          select: { name: true, slug: true }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};
