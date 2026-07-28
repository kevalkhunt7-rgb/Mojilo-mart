import express from 'express';
import { 
  getSettings, 
  updateSettings, 
  getPrintPriceCalculation 
} from '../controllers/settingController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { updateSettingsRules } from '../validators/settingValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.get('/', getSettings);
router.get('/calculate-print-price', getPrintPriceCalculation);
router.patch('/', protect, adminOnly, updateSettingsRules, validate, updateSettings);

export default router;
