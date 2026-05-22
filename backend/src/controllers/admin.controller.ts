import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { NotFoundError } from '../utils/errors';
import { uploadImage } from '../config/cloudinary';

export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Total revenue
    const salesPaid = await prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true }
    });

    const totalRevenue = salesPaid._sum.totalAmount || 0;

    // 2. Count of paid orders
    const totalOrders = await prisma.order.count({
      where: { paymentStatus: 'PAID' }
    });

    // 3. Count of users
    const totalCustomers = await prisma.user.count({
      where: { role: 'USER' }
    });

    // 4. Products count
    const totalProducts = await prisma.product.count();

    // 5. Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 6. Category sales breakdown (Simulated logic using SQL or prisma queries)
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            id: true,
            orderItems: {
              where: {
                order: { paymentStatus: 'PAID' }
              },
              select: {
                quantity: true,
                price: true
              }
            }
          }
        }
      }
    });

    const salesByCategory = categories.map(cat => {
      let revenue = 0;
      cat.products.forEach(p => {
        p.orderItems.forEach(item => {
          revenue += item.price * item.quantity;
        });
      });
      return {
        categoryName: cat.name,
        value: revenue
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        metrics: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts
        },
        recentOrders,
        salesByCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      stock,
      images,
      isBestSeller,
      isSameDayDelivery,
      flowerType,
      occasion,
      deliveryType,
      categoryId
    } = req.body;

    // Make slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        salePrice,
        stock,
        images,
        isBestSeller: !!isBestSeller,
        isSameDayDelivery: !!isSameDayDelivery,
        flowerType,
        occasion,
        deliveryType,
        categoryId
      }
    });

    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data
    });

    res.status(200).json({
      status: 'success',
      data: { product: updatedProduct }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    // Delete related reviews and order items first if cascade is not enabled
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.wishlist.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.status(200).json({
      status: 'success',
      message: `Order status updated to ${status}`,
      data: { order: updatedOrder }
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiresAt } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Coupon already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minOrderValue: minOrderValue || 0,
        maxDiscount,
        expiresAt: new Date(expiresAt)
      }
    });

    res.status(201).json({
      status: 'success',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};
