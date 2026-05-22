"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new errors_1.UnauthorizedError('You are not logged in. Please login to get access.'));
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return next(new errors_1.UnauthorizedError('Invalid or expired authentication session.'));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Authentication required.'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.ForbiddenError('You do not have permission to perform this action.'));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
