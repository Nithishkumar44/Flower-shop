"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewCreateSchema = exports.productUpdateSchema = exports.productCreateSchema = void 0;
const zod_1 = require("zod");
exports.productCreateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Product name is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
        price: zod_1.z.number({ required_error: 'Price is required' }).positive(),
        salePrice: zod_1.z.number().positive().optional().nullable(),
        stock: zod_1.z.number().int().nonnegative().default(0),
        images: zod_1.z.array(zod_1.z.string()).nonempty('At least one product image is required'),
        isBestSeller: zod_1.z.boolean().optional(),
        isSameDayDelivery: zod_1.z.boolean().optional(),
        flowerType: zod_1.z.string({ required_error: 'Flower type is required' }),
        occasion: zod_1.z.string({ required_error: 'Occasion is required' }),
        deliveryType: zod_1.z.enum(['SAME_DAY', 'HAND_DELIVERED', 'COURIER']),
        categoryId: zod_1.z.string({ required_error: 'Category ID is required' }),
    }),
});
exports.productUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().positive().optional(),
        salePrice: zod_1.z.number().positive().optional().nullable(),
        stock: zod_1.z.number().int().nonnegative().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        isBestSeller: zod_1.z.boolean().optional(),
        isSameDayDelivery: zod_1.z.boolean().optional(),
        flowerType: zod_1.z.string().optional(),
        occasion: zod_1.z.string().optional(),
        deliveryType: zod_1.z.enum(['SAME_DAY', 'HAND_DELIVERED', 'COURIER']).optional(),
        categoryId: zod_1.z.string().optional(),
    }),
});
exports.reviewCreateSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z.number({ required_error: 'Rating is required' }).int().min(1).max(5),
        comment: zod_1.z.string({ required_error: 'Review content is required' }).min(3),
    }),
});
