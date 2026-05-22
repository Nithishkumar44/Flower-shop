"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetails = exports.getOrderHistory = exports.verifyPayment = exports.checkout = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const razorpay_1 = require("../config/razorpay");
const checkout = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { addressId, couponCode } = req.body;
        // Fetch address
        const address = await db_1.default.address.findUnique({ where: { id: addressId } });
        if (!address || address.userId !== userId) {
            return next(new errors_1.BadRequestError('Invalid delivery address'));
        }
        // Fetch active cart
        const cart = await db_1.default.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        if (!cart || cart.items.length === 0) {
            return next(new errors_1.BadRequestError('Your cart is empty'));
        }
        // Calculate subtotal
        let subtotal = 0;
        const itemsData = cart.items.map(item => {
            let price = item.product.price;
            // Calculate custom bouquet prices: base wrap + extra flowers
            let customConfig = item.customFlowerConfig;
            if (customConfig && customConfig.flowers) {
                let addonCost = 0;
                customConfig.flowers.forEach((flower) => {
                    addonCost += (flower.price || 0) * (flower.quantity || 0);
                });
                addonCost += 150; // default wrap cost
                price = addonCost;
            }
            subtotal += price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price,
                customFlowerConfig: item.customFlowerConfig || undefined
            };
        });
        // Check Coupon code
        let discount = 0;
        if (couponCode) {
            const coupon = await db_1.default.coupon.findUnique({
                where: { code: couponCode }
            });
            if (coupon && coupon.isActive && coupon.expiresAt > new Date() && subtotal >= coupon.minOrderValue) {
                if (coupon.discountType === 'PERCENTAGE') {
                    discount = (subtotal * coupon.discountValue) / 100;
                    if (coupon.maxDiscount) {
                        discount = Math.min(discount, coupon.maxDiscount);
                    }
                }
                else {
                    discount = coupon.discountValue;
                }
            }
        }
        // Delivery fee
        const deliveryFee = subtotal > 1500 ? 0 : 99;
        const totalAmount = Math.max(0, subtotal - discount + deliveryFee);
        // Create database order in PENDING status
        const orderNumber = `LXB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const dbOrder = await db_1.default.order.create({
            data: {
                userId,
                orderNumber,
                totalAmount,
                couponCode,
                discountAmount: discount,
                deliveryFee,
                addressId,
                paymentStatus: 'PENDING',
                status: 'PLACED',
                items: {
                    create: itemsData.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        customFlowerConfig: item.customFlowerConfig
                    }))
                }
            }
        });
        // Trigger Razorpay payment creation
        const rzpOrder = await (0, razorpay_1.createPaymentOrder)(totalAmount, dbOrder.id);
        // Empty user cart
        await db_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
        res.status(201).json({
            status: 'success',
            data: {
                orderId: dbOrder.id,
                orderNumber: dbOrder.orderNumber,
                totalAmount: dbOrder.totalAmount,
                razorpayOrder: rzpOrder
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkout = checkout;
const verifyPayment = async (req, res, next) => {
    try {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const isVerified = (0, razorpay_1.verifyPaymentSignature)(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isVerified) {
            await db_1.default.order.update({
                where: { id: orderId },
                data: { paymentStatus: 'FAILED' }
            });
            return next(new errors_1.BadRequestError('Payment signature verification failed'));
        }
        // Confirm payment on DB order
        const order = await db_1.default.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: 'PAID',
                paymentId: razorpayPaymentId
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        // Deduct stocks
        for (const item of order.items) {
            if (item.product.stock >= item.quantity) {
                await db_1.default.product.update({
                    where: { id: item.productId },
                    data: { stock: item.product.stock - item.quantity }
                });
            }
        }
        res.status(200).json({
            status: 'success',
            message: 'Payment verified and order placed successfully',
            data: { order }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyPayment = verifyPayment;
const getOrderHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orders = await db_1.default.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, images: true }
                        }
                    }
                },
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
exports.getOrderHistory = getOrderHistory;
const getOrderDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const order = await db_1.default.order.findFirst({
            where: {
                id,
                // Admin can fetch any order, user only their own
                ...(req.user.role !== 'ADMIN' && { userId })
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                address: true
            }
        });
        if (!order) {
            return next(new errors_1.NotFoundError('Order not found'));
        }
        res.status(200).json({
            status: 'success',
            data: { order }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderDetails = getOrderDetails;
