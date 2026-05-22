"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCartItem = exports.updateCartItemQuantity = exports.addToCart = exports.getCart = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let cart = await db_1.default.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!cart) {
            cart = await db_1.default.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
        }
        // Calculate cart pricing aggregates
        let subtotal = 0;
        const cartItems = cart.items.map(item => {
            let itemPrice = item.product.price;
            // Calculate custom bouquet prices: base wrap + extra flowers
            let customConfig = item.customFlowerConfig;
            let addonCost = 0;
            if (customConfig && customConfig.flowers) {
                customConfig.flowers.forEach((flower) => {
                    addonCost += (flower.price || 0) * (flower.quantity || 0);
                });
                // Wrap base cost
                addonCost += 150; // default wrap cost
                itemPrice = addonCost;
            }
            const totalItemPrice = itemPrice * item.quantity;
            subtotal += totalItemPrice;
            return {
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                customFlowerConfig: item.customFlowerConfig,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    slug: item.product.slug,
                    price: itemPrice, // override price for custom bouquets
                    originalPrice: item.product.price,
                    images: item.product.images,
                    stock: item.product.stock,
                },
                totalPrice: totalItemPrice
            };
        });
        // Standard Shipping: 99 INR, Free over 1500 INR
        const deliveryFee = subtotal > 1500 || subtotal === 0 ? 0 : 99;
        const totalAmount = subtotal + deliveryFee;
        res.status(200).json({
            status: 'success',
            data: {
                cartId: cart.id,
                items: cartItems,
                summary: {
                    subtotal,
                    deliveryFee,
                    totalAmount
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1, customFlowerConfig } = req.body;
        const product = await db_1.default.product.findUnique({ where: { id: productId } });
        if (!product) {
            return next(new errors_1.NotFoundError('Product not found'));
        }
        let cart = await db_1.default.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await db_1.default.cart.create({ data: { userId } });
        }
        // Check if item already exists with matching customizations
        let existingItem = null;
        if (!customFlowerConfig) {
            // Find standard item
            existingItem = await db_1.default.cartItem.findFirst({
                where: {
                    cartId: cart.id,
                    productId,
                    customFlowerConfig: { equals: client_1.Prisma.DbNull }
                }
            });
        }
        if (existingItem) {
            await db_1.default.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + Number(quantity) }
            });
        }
        else {
            // Create new cart item (with or without custom bouquet config)
            await db_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity: Number(quantity),
                    customFlowerConfig: customFlowerConfig || undefined
                }
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Product added to cart successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
const updateCartItemQuantity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        if (quantity <= 0) {
            await db_1.default.cartItem.delete({ where: { id } });
            return res.status(200).json({
                status: 'success',
                message: 'Item removed from cart'
            });
        }
        const cartItem = await db_1.default.cartItem.findUnique({ where: { id } });
        if (!cartItem) {
            return next(new errors_1.NotFoundError('Cart item not found'));
        }
        await db_1.default.cartItem.update({
            where: { id },
            data: { quantity: Number(quantity) }
        });
        res.status(200).json({
            status: 'success',
            message: 'Cart updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCartItemQuantity = updateCartItemQuantity;
const removeCartItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cartItem = await db_1.default.cartItem.findUnique({ where: { id } });
        if (!cartItem) {
            return next(new errors_1.NotFoundError('Cart item not found'));
        }
        await db_1.default.cartItem.delete({ where: { id } });
        res.status(200).json({
            status: 'success',
            message: 'Item removed from cart successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeCartItem = removeCartItem;
