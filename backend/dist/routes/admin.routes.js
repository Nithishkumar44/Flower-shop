"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const product_validator_1 = require("../validators/product.validator");
const router = (0, express_1.Router)();
// Secure all admin endpoints
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('ADMIN'));
router.get('/analytics', admin_controller_1.getAnalytics);
router.get('/orders', admin_controller_1.getAllOrders);
router.put('/order/:id/status', admin_controller_1.updateOrderStatus);
router.post('/products', (0, validation_1.validate)(product_validator_1.productCreateSchema), admin_controller_1.createProduct);
router.put('/products/:id', (0, validation_1.validate)(product_validator_1.productUpdateSchema), admin_controller_1.updateProduct);
router.delete('/products/:id', admin_controller_1.deleteProduct);
router.post('/coupons', admin_controller_1.createCoupon);
exports.default = router;
