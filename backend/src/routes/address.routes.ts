import { Router } from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/address.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { addressSchema } from '../validators/order.validator';

const router = Router();

router.use(protect); // protect all address endpoints

router.get('/', getAddresses);
router.post('/', validate(addressSchema), createAddress);
router.put('/:id', validate(addressSchema), updateAddress);
router.delete('/:id', deleteAddress);

export default router;
