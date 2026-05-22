import { Router } from 'express';
import { createReview } from '../controllers/review.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { reviewCreateSchema } from '../validators/product.validator';

const router = Router();

router.post('/product/:productId', protect, validate(reviewCreateSchema), createReview);

export default router;
