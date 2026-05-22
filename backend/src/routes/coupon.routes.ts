import { Router } from 'express';
import { validateCoupon } from '../controllers/coupon.controller';

const router = Router();

router.get('/validate', validateCoupon);

export default router;
