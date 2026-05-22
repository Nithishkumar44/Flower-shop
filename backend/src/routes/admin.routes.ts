import { Router } from 'express';
import {
  getAnalytics,
  createProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  createCoupon,
  getAllOrders
} from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { productCreateSchema, productUpdateSchema } from '../validators/product.validator';

const router = Router();

// Secure all admin endpoints
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/analytics', getAnalytics);
router.get('/orders', getAllOrders);
router.put('/order/:id/status', updateOrderStatus);
router.post('/products', validate(productCreateSchema), createProduct);
router.put('/products/:id', validate(productUpdateSchema), updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/coupons', createCoupon);

export default router;
