"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = require("../controllers/address.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const order_validator_1 = require("../validators/order.validator");
const router = (0, express_1.Router)();
router.use(auth_1.protect); // protect all address endpoints
router.get('/', address_controller_1.getAddresses);
router.post('/', (0, validation_1.validate)(order_validator_1.addressSchema), address_controller_1.createAddress);
router.put('/:id', (0, validation_1.validate)(order_validator_1.addressSchema), address_controller_1.updateAddress);
router.delete('/:id', address_controller_1.deleteAddress);
exports.default = router;
