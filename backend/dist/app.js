"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const address_routes_1 = __importDefault(require("./routes/address.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const error_1 = require("./middleware/error");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Luxe Blooms API is healthy and blooming!' });
});
// Route Registrations
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/addresses', address_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/wishlist', wishlist_routes_1.default);
app.use('/api/coupons', coupon_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Global Error Handler
app.use(error_1.errorHandler);
exports.default = app;
