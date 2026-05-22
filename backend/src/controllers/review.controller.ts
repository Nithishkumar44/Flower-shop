import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    // Verify if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      return next(new BadRequestError('You have already reviewed this product'));
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      }
    });

    // Recalculate average rating for product
    const productReviews = await prisma.review.findMany({
      where: { productId }
    });

    const averageRating =
      productReviews.reduce((sum, rev) => sum + rev.rating, 0) /
      productReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: parseFloat(averageRating.toFixed(1)) }
    });

    res.status(201).json({
      status: 'success',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};
