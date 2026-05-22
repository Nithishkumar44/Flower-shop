import { z } from 'zod';

export const addressSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    street: z.string({ required_error: 'Street is required' }),
    city: z.string({ required_error: 'City is required' }),
    state: z.string({ required_error: 'State is required' }),
    postalCode: z.string({ required_error: 'Postal code is required' }),
    country: z.string({ required_error: 'Country is required' }),
    phone: z.string({ required_error: 'Phone number is required' }),
    isDefault: z.boolean().optional(),
  }),
});

export const checkoutSchema = z.object({
  body: z.object({
    addressId: z.string({ required_error: 'Delivery address is required' }),
    couponCode: z.string().optional(),
  }),
});

export const paymentVerificationSchema = z.object({
  body: z.object({
    orderId: z.string({ required_error: 'Order ID is required' }),
    razorpayOrderId: z.string({ required_error: 'Razorpay Order ID is required' }),
    razorpayPaymentId: z.string({ required_error: 'Razorpay Payment ID is required' }),
    razorpaySignature: z.string({ required_error: 'Razorpay Signature is required' }),
  }),
});
