import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, amount } = req.query;

    if (!code) {
      return next(new BadRequestError('Coupon code is required'));
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).toUpperCase() }
    });

    if (!coupon) {
      return next(new NotFoundError('Coupon code not found'));
    }

    if (!coupon.isActive) {
      return next(new BadRequestError('Coupon code is inactive'));
    }

    if (coupon.expiresAt < new Date()) {
      return next(new BadRequestError('Coupon code has expired'));
    }

    const minAmount = Number(amount || 0);
    if (minAmount < coupon.minOrderValue) {
      return next(new BadRequestError(`Minimum order value of INR ${coupon.minOrderValue} required for this coupon`));
    }

    res.status(200).json({
      status: 'success',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};
