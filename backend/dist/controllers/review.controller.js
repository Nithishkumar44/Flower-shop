"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const createReview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const product = await db_1.default.product.findUnique({ where: { id: productId } });
        if (!product) {
            return next(new errors_1.NotFoundError('Product not found'));
        }
        // Verify if user already reviewed this product
        const existingReview = await db_1.default.review.findFirst({
            where: { userId, productId }
        });
        if (existingReview) {
            return next(new errors_1.BadRequestError('You have already reviewed this product'));
        }
        // Create review
        const review = await db_1.default.review.create({
            data: {
                userId,
                productId,
                rating,
                comment
            }
        });
        // Recalculate average rating for product
        const productReviews = await db_1.default.review.findMany({
            where: { productId }
        });
        const averageRating = productReviews.reduce((sum, rev) => sum + rev.rating, 0) /
            productReviews.length;
        await db_1.default.product.update({
            where: { id: productId },
            data: { rating: parseFloat(averageRating.toFixed(1)) }
        });
        res.status(201).json({
            status: 'success',
            data: { review }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
