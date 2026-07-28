import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// 1. ADD THIS AT THE ABSOLUTE TOP OF YOUR INITIALIZATIONS
import dotenv from 'dotenv';
dotenv.config();

// 2. IMPORT YOUR CLOUDINARY CONFIGURATION HOOK
import { configureCloudinary } from './config/cloudinary.js'; // Adjust path if your file location is different

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import variantRoutes from './routes/variantRoutes.js';
import designRoutes from './routes/designRoutes.js';
import layoutRoutes from './routes/layoutRoutes.js';
import customizationRoutes from './routes/customizationRoutes.js';
import clipartRoutes from './routes/clipartRoutes.js';
import fontRoutes from './routes/fontRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import customCartRoutes from './routes/customCartRoute.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import apparelTemplateRoutes, { publicApparelRouter as apparelPublicRoutes } from './routes/apparelTemplateRoutes.js';

import { sanitizeData } from './middlewares/sanitize.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 3. RUN CLOUDINARY INITIALIZATION IMMEDIATELY AFTER CREATING THE APP INSTANCE
configureCloudinary();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mojilo-mart.vercel.app',
    'http://localhost:5176'
  ],
  credentials: true
}));

// Performance Middlewares
app.use(compression());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parsers & Sanitization
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(sanitizeData);

// API Limiters
app.use('/api', apiLimiter);

// Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/customizations', customizationRoutes);
app.use('/api/cliparts', clipartRoutes);
app.use('/api/fonts', fontRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/custom-cart', customCartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/admin/apparel-templates', apparelTemplateRoutes);
app.use('/api/apparel-templates', apparelPublicRoutes); // Public — used by frontend customizer

// Fallbacks
app.use(notFound);
app.use(errorHandler);


export default app;