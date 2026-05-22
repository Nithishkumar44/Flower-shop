import { Router } from 'express';
import { getCart, addToCart, updateCartItemQuantity, removeCartItem } from '../controllers/cart.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // protect all cart endpoints

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:id', updateCartItemQuantity);
router.delete('/item/:id', removeCartItem);

export default router;
