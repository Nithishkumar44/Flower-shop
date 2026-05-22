import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { NotFoundError } from '../utils/errors';

export const getAddresses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { addresses }
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { title, street, city, state, postalCode, country, phone, isDefault } = req.body;

    if (isDefault) {
      // Set all other addresses for this user to isDefault = false
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    // Check if this is the first address, make it default automatically
    const existingCount = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = existingCount === 0 ? true : !!isDefault;

    const address = await prisma.address.create({
      data: {
        userId,
        title,
        street,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault: shouldBeDefault
      }
    });

    res.status(201).json({
      status: 'success',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, street, city, state, postalCode, country, phone, isDefault } = req.body;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      return next(new NotFoundError('Address not found'));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        title,
        street,
        city,
        state,
        postalCode,
        country,
        phone,
        isDefault: !!isDefault
      }
    });

    res.status(200).json({
      status: 'success',
      data: { address: updatedAddress }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      return next(new NotFoundError('Address not found'));
    }

    await prisma.address.delete({ where: { id } });

    // If we deleted the default address, make the most recent address default
    if (address.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true }
        });
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
