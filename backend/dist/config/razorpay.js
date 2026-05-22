"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaymentSignature = exports.createPaymentOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isConfigured = process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET;
let razorpayInstance = null;
if (isConfigured) {
    razorpayInstance = new razorpay_1.default({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}
else {
    console.warn("Razorpay credentials missing. Running in simulation mode.");
}
const createPaymentOrder = async (amount, receiptId) => {
    if (!isConfigured || !razorpayInstance) {
        // Return a mock Razorpay order
        return {
            id: `mock_order_${Math.random().toString(36).substring(2, 15)}`,
            entity: "order",
            amount: amount * 100, // in paisa
            amount_paid: 0,
            amount_due: amount * 100,
            currency: "INR",
            receipt: receiptId,
            status: "created",
            attempts: 0,
            notes: [],
            created_at: Math.floor(Date.now() / 1000),
            isMock: true
        };
    }
    try {
        const order = await razorpayInstance.orders.create({
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: receiptId,
        });
        return order;
    }
    catch (error) {
        console.error("Razorpay order creation failed:", error);
        throw error;
    }
};
exports.createPaymentOrder = createPaymentOrder;
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, signature) => {
    if (!isConfigured || !razorpayInstance) {
        // If running in simulation, verify all payments as valid
        return true;
    }
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
};
exports.verifyPaymentSignature = verifyPaymentSignature;
exports.default = razorpayInstance;
