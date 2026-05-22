"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Name is required',
        }).min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string({
            required_error: 'Email is required',
        }).email('Invalid email address'),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }).min(6, 'Password must be at least 6 characters'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({
            required_error: 'Email is required',
        }).email('Invalid email address'),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({
            required_error: 'Email is required',
        }).email('Invalid email address'),
    }),
});
