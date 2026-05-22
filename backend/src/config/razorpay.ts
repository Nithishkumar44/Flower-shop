import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

const isConfigured =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance: Razorpay | null = null;

if (isConfigured) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
} else {
  console.warn("Razorpay credentials missing. Running in simulation mode.");
}

export const createPaymentOrder = async (amount: number, receiptId: string) => {
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
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    throw error;
  }
};

export const verifyPaymentSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean => {
  if (!isConfigured || !razorpayInstance) {
    // If running in simulation, verify all payments as valid
    return true;
  }

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
  hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
  const generatedSignature = hmac.digest('hex');

  return generatedSignature === signature;
};

export default razorpayInstance;
