import { z } from 'zod';

export const productCreateSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Product name is required' }),
    description: z.string({ required_error: 'Description is required' }),
    price: z.number({ required_error: 'Price is required' }).positive(),
    salePrice: z.number().positive().optional().nullable(),
    stock: z.number().int().nonnegative().default(0),
    images: z.array(z.string()).nonempty('At least one product image is required'),
    isBestSeller: z.boolean().optional(),
    isSameDayDelivery: z.boolean().optional(),
    flowerType: z.string({ required_error: 'Flower type is required' }),
    occasion: z.string({ required_error: 'Occasion is required' }),
    deliveryType: z.enum(['SAME_DAY', 'HAND_DELIVERED', 'COURIER']),
    categoryId: z.string({ required_error: 'Category ID is required' }),
  }),
});

export const productUpdateSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    salePrice: z.number().positive().optional().nullable(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
    isBestSeller: z.boolean().optional(),
    isSameDayDelivery: z.boolean().optional(),
    flowerType: z.string().optional(),
    occasion: z.string().optional(),
    deliveryType: z.enum(['SAME_DAY', 'HAND_DELIVERED', 'COURIER']).optional(),
    categoryId: z.string().optional(),
  }),
});

export const reviewCreateSchema = z.object({
  body: z.object({
    rating: z.number({ required_error: 'Rating is required' }).int().min(1).max(5),
    comment: z.string({ required_error: 'Review content is required' }).min(3),
  }),
});
