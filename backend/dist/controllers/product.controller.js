"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSameDayCollection = exports.getBestsellers = exports.getProductBySlug = exports.getProducts = exports.getCategories = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const getCategories = async (req, res, next) => {
    try {
        const categories = await db_1.default.category.findMany({
            orderBy: { name: 'asc' },
        });
        res.status(200).json({
            status: 'success',
            results: categories.length,
            data: { categories },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 9, search, category, minPrice, maxPrice, flowerType, occasion, deliveryType, sortBy = 'createdAt', // priceAsc, priceDesc, popularity, createdAt
         } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        // Build filter query
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
                { flowerType: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.category = { slug: String(category) };
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = Number(minPrice);
            if (maxPrice)
                where.price.lte = Number(maxPrice);
        }
        if (flowerType) {
            where.flowerType = { equals: String(flowerType), mode: 'insensitive' };
        }
        if (occasion) {
            where.occasion = { equals: String(occasion), mode: 'insensitive' };
        }
        if (deliveryType) {
            where.deliveryType = String(deliveryType);
        }
        // Sorting
        let orderBy = { createdAt: 'desc' };
        if (sortBy === 'priceAsc') {
            orderBy = { price: 'asc' };
        }
        else if (sortBy === 'priceDesc') {
            orderBy = { price: 'desc' };
        }
        else if (sortBy === 'rating') {
            orderBy = { rating: 'desc' };
        }
        const [products, totalItems] = await db_1.default.$transaction([
            db_1.default.product.findMany({
                where,
                orderBy,
                skip,
                take: limitNumber,
                include: {
                    category: {
                        select: { name: true, slug: true }
                    }
                }
            }),
            db_1.default.product.count({ where }),
        ]);
        const totalPages = Math.ceil(totalItems / limitNumber);
        res.status(200).json({
            status: 'success',
            metadata: {
                totalItems,
                totalPages,
                currentPage: pageNumber,
                limit: limitNumber,
            },
            data: { products },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await db_1.default.product.findUnique({
            where: { slug },
            include: {
                category: true,
                reviews: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!product) {
            return next(new errors_1.NotFoundError('Product not found'));
        }
        res.status(200).json({
            status: 'success',
            data: { product },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductBySlug = getProductBySlug;
const getBestsellers = async (req, res, next) => {
    try {
        const products = await db_1.default.product.findMany({
            where: { isBestSeller: true },
            take: 4,
            include: {
                category: {
                    select: { name: true, slug: true }
                }
            }
        });
        res.status(200).json({
            status: 'success',
            data: { products },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBestsellers = getBestsellers;
const getSameDayCollection = async (req, res, next) => {
    try {
        const products = await db_1.default.product.findMany({
            where: { isSameDayDelivery: true },
            take: 4,
            include: {
                category: {
                    select: { name: true, slug: true }
                }
            }
        });
        res.status(200).json({
            status: 'success',
            data: { products },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSameDayCollection = getSameDayCollection;
