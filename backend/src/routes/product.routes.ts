import { Router } from 'express';
import { getCategories, getProducts, getProductBySlug, getBestsellers, getSameDayCollection } from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/bestsellers', getBestsellers);
router.get('/same-day', getSameDayCollection);
router.get('/slug/:slug', getProductBySlug);

export default router;
