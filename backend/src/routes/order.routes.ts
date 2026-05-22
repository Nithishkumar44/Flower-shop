import { Router } from 'express';
import { checkout, verifyPayment, getOrderHistory, getOrderDetails } from '../controllers/order.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { checkoutSchema, paymentVerificationSchema } from '../validators/order.validator';

const router = Router();

router.use(protect); // protect all order routes

router.post('/checkout', validate(checkoutSchema), checkout);
router.post('/verify-payment', validate(paymentVerificationSchema), verifyPayment);
router.get('/history', getOrderHistory);
router.get('/:id', getOrderDetails);

export default router;
