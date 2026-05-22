"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect); // protect all cart endpoints
router.get('/', cart_controller_1.getCart);
router.post('/add', cart_controller_1.addToCart);
router.put('/item/:id', cart_controller_1.updateCartItemQuantity);
router.delete('/item/:id', cart_controller_1.removeCartItem);
exports.default = router;
