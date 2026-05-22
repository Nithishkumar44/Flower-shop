import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { NotFoundError } from '../utils/errors';

export const getWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: { select: { name: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { wishlist }
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    const existingItem = await prisma.wishlist.findFirst({
      where: { userId, productId }
    });

    if (existingItem) {
      await prisma.wishlist.delete({ where: { id: existingItem.id } });
      return res.status(200).json({
        status: 'success',
        message: 'Product removed from wishlist',
        data: { inWishlist: false }
      });
    } else {
      await prisma.wishlist.create({
        data: { userId, productId }
      });
      return res.status(200).json({
        status: 'success',
        message: 'Product added to wishlist',
        data: { inWishlist: true }
      });
    }
  } catch (error) {
    next(error);
  }
};
