"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const validateCoupon = async (req, res, next) => {
    try {
        const { code, amount } = req.query;
        if (!code) {
            return next(new errors_1.BadRequestError('Coupon code is required'));
        }
        const coupon = await db_1.default.coupon.findUnique({
            where: { code: String(code).toUpperCase() }
        });
        if (!coupon) {
            return next(new errors_1.NotFoundError('Coupon code not found'));
        }
        if (!coupon.isActive) {
            return next(new errors_1.BadRequestError('Coupon code is inactive'));
        }
        if (coupon.expiresAt < new Date()) {
            return next(new errors_1.BadRequestError('Coupon code has expired'));
        }
        const minAmount = Number(amount || 0);
        if (minAmount < coupon.minOrderValue) {
            return next(new errors_1.BadRequestError(`Minimum order value of INR ${coupon.minOrderValue} required for this coupon`));
        }
        res.status(200).json({
            status: 'success',
            data: { coupon }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.validateCoupon = validateCoupon;
