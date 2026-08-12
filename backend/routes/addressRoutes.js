import express from 'express';
import { 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress 
} from '../controllers/addressController.js';
import { protect } from '../middlewares/auth.js';
import { addressRules } from '../validators/userValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getAddresses);
router.post('/', addressRules, validate, addAddress);
router.put('/:id', addressRules, validate, updateAddress);
router.patch('/:id', addressRules, validate, updateAddress);
router.delete('/:id', deleteAddress);

export default router;
