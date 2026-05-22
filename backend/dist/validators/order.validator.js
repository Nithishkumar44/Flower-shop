"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentVerificationSchema = exports.checkoutSchema = exports.addressSchema = void 0;
const zod_1 = require("zod");
exports.addressSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        street: zod_1.z.string({ required_error: 'Street is required' }),
        city: zod_1.z.string({ required_error: 'City is required' }),
        state: zod_1.z.string({ required_error: 'State is required' }),
        postalCode: zod_1.z.string({ required_error: 'Postal code is required' }),
        country: zod_1.z.string({ required_error: 'Country is required' }),
        phone: zod_1.z.string({ required_error: 'Phone number is required' }),
        isDefault: zod_1.z.boolean().optional(),
    }),
});
exports.checkoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        addressId: zod_1.z.string({ required_error: 'Delivery address is required' }),
        couponCode: zod_1.z.string().optional(),
    }),
});
exports.paymentVerificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string({ required_error: 'Order ID is required' }),
        razorpayOrderId: zod_1.z.string({ required_error: 'Razorpay Order ID is required' }),
        razorpayPaymentId: zod_1.z.string({ required_error: 'Razorpay Payment ID is required' }),
        razorpaySignature: zod_1.z.string({ required_error: 'Razorpay Signature is required' }),
    }),
});
