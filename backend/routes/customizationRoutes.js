import express from 'express';
import { 
  getCustomization, 
  createCustomization, 
  updateCustomization, 
  deleteCustomization 
} from '../controllers/customizationController.js';
import { optionalProtect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:id', optionalProtect, getCustomization);
router.post('/', optionalProtect, createCustomization);
router.put('/:id', optionalProtect, updateCustomization);
router.delete('/:id', optionalProtect, deleteCustomization);

export default router;
