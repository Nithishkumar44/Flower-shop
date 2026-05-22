"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const order_validator_1 = require("../validators/order.validator");
const router = (0, express_1.Router)();
router.use(auth_1.protect); // protect all order routes
router.post('/checkout', (0, validation_1.validate)(order_validator_1.checkoutSchema), order_controller_1.checkout);
router.post('/verify-payment', (0, validation_1.validate)(order_validator_1.paymentVerificationSchema), order_controller_1.verifyPayment);
router.get('/history', order_controller_1.getOrderHistory);
router.get('/:id', order_controller_1.getOrderDetails);
exports.default = router;
