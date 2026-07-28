import express from 'express';
import { 
  getWarehouses, 
  getWarehouseStock, 
  restockItems, 
  getLowStockAlerts 
} from '../controllers/inventoryController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/warehouses', getWarehouses);
router.get('/stock', getWarehouseStock);
router.post('/restock', restockItems);
router.get('/alerts', getLowStockAlerts);

export default router;
