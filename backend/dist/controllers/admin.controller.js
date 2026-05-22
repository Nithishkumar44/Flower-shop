"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.createCoupon = exports.updateOrderStatus = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getAnalytics = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const getAnalytics = async (req, res, next) => {
    try {
        // 1. Total revenue
        const salesPaid = await db_1.default.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { totalAmount: true }
        });
        const totalRevenue = salesPaid._sum.totalAmount || 0;
        // 2. Count of paid orders
        const totalOrders = await db_1.default.order.count({
            where: { paymentStatus: 'PAID' }
        });
        // 3. Count of users
        const totalCustomers = await db_1.default.user.count({
            where: { role: 'USER' }
        });
        // 4. Products count
        const totalProducts = await db_1.default.product.count();
        // 5. Recent orders
        const recentOrders = await db_1.default.order.findMany({
            take: 5,
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        // 6. Category sales breakdown (Simulated logic using SQL or prisma queries)
        const categories = await db_1.default.category.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalytics = getAnalytics;
const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, salePrice, stock, images, isBestSeller, isSameDayDelivery, flowerType, occasion, deliveryType, categoryId } = req.body;
        // Make slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);
        const product = await db_1.default.product.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const product = await db_1.default.product.findUnique({ where: { id } });
        if (!product) {
            return next(new errors_1.NotFoundError('Product not found'));
        }
        if (data.name) {
            data.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);
        }
        const updatedProduct = await db_1.default.product.update({
            where: { id },
            data
        });
        res.status(200).json({
            status: 'success',
            data: { product: updatedProduct }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await db_1.default.product.findUnique({ where: { id } });
        if (!product) {
            return next(new errors_1.NotFoundError('Product not found'));
        }
        // Delete related reviews and order items first if cascade is not enabled
        await db_1.default.review.deleteMany({ where: { productId: id } });
        await db_1.default.wishlist.deleteMany({ where: { productId: id } });
        await db_1.default.cartItem.deleteMany({ where: { productId: id } });
        await db_1.default.product.delete({ where: { id } });
        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
        const order = await db_1.default.order.findUnique({ where: { id } });
        if (!order) {
            return next(new errors_1.NotFoundError('Order not found'));
        }
        const updatedOrder = await db_1.default.order.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({
            status: 'success',
            message: `Order status updated to ${status}`,
            data: { order: updatedOrder }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const createCoupon = async (req, res, next) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxDiscount, expiresAt } = req.body;
        const existing = await db_1.default.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (existing) {
            return res.status(400).json({ status: 'fail', message: 'Coupon already exists' });
        }
        const coupon = await db_1.default.coupon.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createCoupon = createCoupon;
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await db_1.default.order.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllOrders = getAllOrders;
