"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../utils/errors");
const getAddresses = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const addresses = await db_1.default.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({
            status: 'success',
            data: { addresses }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
const createAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { title, street, city, state, postalCode, country, phone, isDefault } = req.body;
        if (isDefault) {
            // Set all other addresses for this user to isDefault = false
            await db_1.default.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        // Check if this is the first address, make it default automatically
        const existingCount = await db_1.default.address.count({ where: { userId } });
        const shouldBeDefault = existingCount === 0 ? true : !!isDefault;
        const address = await db_1.default.address.create({
            data: {
                userId,
                title,
                street,
                city,
                state,
                postalCode,
                country,
                phone,
                isDefault: shouldBeDefault
            }
        });
        res.status(201).json({
            status: 'success',
            data: { address }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAddress = createAddress;
const updateAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, street, city, state, postalCode, country, phone, isDefault } = req.body;
        const address = await db_1.default.address.findUnique({ where: { id } });
        if (!address || address.userId !== userId) {
            return next(new errors_1.NotFoundError('Address not found'));
        }
        if (isDefault) {
            await db_1.default.address.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
        }
        const updatedAddress = await db_1.default.address.update({
            where: { id },
            data: {
                title,
                street,
                city,
                state,
                postalCode,
                country,
                phone,
                isDefault: !!isDefault
            }
        });
        res.status(200).json({
            status: 'success',
            data: { address: updatedAddress }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const address = await db_1.default.address.findUnique({ where: { id } });
        if (!address || address.userId !== userId) {
            return next(new errors_1.NotFoundError('Address not found'));
        }
        await db_1.default.address.delete({ where: { id } });
        // If we deleted the default address, make the most recent address default
        if (address.isDefault) {
            const remaining = await db_1.default.address.findFirst({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
            if (remaining) {
                await db_1.default.address.update({
                    where: { id: remaining.id },
                    data: { isDefault: true }
                });
            }
        }
        res.status(200).json({
            status: 'success',
            message: 'Address deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
