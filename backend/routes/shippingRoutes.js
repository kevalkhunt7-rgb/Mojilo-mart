import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { 
  getShippingMethods, 
  createShipment, 
  addCheckpoint,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod
} from '../controllers/shippingController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';

const router = express.Router();

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_access_secret_key');
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (err) {}
  next();
};

router.get('/methods', optionalProtect, getShippingMethods);

// Admin shipping method configuration CRUD
router.post('/methods', protect, adminOnly, createShippingMethod);
router.patch('/methods/:id', protect, adminOnly, updateShippingMethod);
router.delete('/methods/:id', protect, adminOnly, deleteShippingMethod);

// Admin shipment logistics
router.post('/shipment', protect, adminOnly, createShipment);
router.post('/shipment/:shipmentId/checkpoint', protect, adminOnly, addCheckpoint);

export default router;
