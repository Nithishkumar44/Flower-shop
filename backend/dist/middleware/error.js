"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let status = 'error';
    let message = 'Something went wrong';
    let errors = null;
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        status = err.status;
        message = err.message;
    }
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        status = 'fail';
        message = err.message;
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        status = 'fail';
        message = 'Invalid token. Please log in again.';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        status = 'fail';
        message = 'Your session has expired. Please log in again.';
    }
    else {
        // Console log native errors for debugging in development
        console.error('SERVER ERROR 🔥:', err);
        message = err.message || message;
    }
    res.status(statusCode).json({
        status,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
