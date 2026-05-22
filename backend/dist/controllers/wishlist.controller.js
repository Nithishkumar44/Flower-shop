"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlist = exports.getWishlist = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const getWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const wishlist = await db_1.default.wishlist.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getWishlist = getWishlist;
const toggleWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;
        const product = await db_1.default.product.findUnique({ where: { id: productId } });
        if (!product) {
            return next(new errors_1.NotFoundError('Product not found'));
        }
        const existingItem = await db_1.default.wishlist.findFirst({
            where: { userId, productId }
        });
        if (existingItem) {
            await db_1.default.wishlist.delete({ where: { id: existingItem.id } });
            return res.status(200).json({
                status: 'success',
                message: 'Product removed from wishlist',
                data: { inWishlist: false }
            });
        }
        else {
            await db_1.default.wishlist.create({
                data: { userId, productId }
            });
            return res.status(200).json({
                status: 'success',
                message: 'Product added to wishlist',
                data: { inWishlist: true }
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.toggleWishlist = toggleWishlist;
