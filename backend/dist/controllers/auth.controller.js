"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.getMe = exports.googleLogin = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return next(new errors_1.BadRequestError('Email already registered'));
        }
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        const user = await db_1.default.user.create({
            data: {
                name,
                email,
                passwordHash,
                cart: {
                    create: {}
                }
            },
        });
        const token = (0, jwt_1.signToken)({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return next(new errors_1.UnauthorizedError('Incorrect email or password'));
        }
        const isPasswordCorrect = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordCorrect) {
            return next(new errors_1.UnauthorizedError('Incorrect email or password'));
        }
        const token = (0, jwt_1.signToken)({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const googleLogin = async (req, res, next) => {
    try {
        const { credential, email, name, googleId } = req.body;
        // In production, we'd verify the token with Google API. 
        // Here we'll trust the payload from frontend for simplicity or create the user if googleId is provided.
        if (!email || !name) {
            return next(new errors_1.BadRequestError('Google email and name are required'));
        }
        let user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            user = await db_1.default.user.create({
                data: {
                    name,
                    email,
                    googleId: googleId || `google_${Math.random().toString(36).substr(2, 9)}`,
                    cart: {
                        create: {}
                    }
                },
            });
        }
        else if (!user.googleId) {
            // Connect existing email user with google credentials
            user = await db_1.default.user.update({
                where: { id: user.id },
                data: { googleId: googleId || `google_${Math.random().toString(36).substr(2, 9)}` }
            });
        }
        const token = (0, jwt_1.signToken)({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.googleLogin = googleLogin;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Not logged in'));
        }
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
        if (!user) {
            return next(new errors_1.NotFoundError('User not found'));
        }
        res.status(200).json({
            status: 'success',
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return next(new errors_1.NotFoundError('No user found with that email address'));
        }
        // In a real application, send an email here with a reset token.
        // For this e-commerce app, we will mock the notification and succeed.
        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to your email address (Simulated)',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
