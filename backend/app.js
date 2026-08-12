import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose';

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
import cancellationRoutes from './routes/cancellationRoutes.js';
import apparelTemplateRoutes, { publicApparelRouter as apparelPublicRoutes } from './routes/apparelTemplateRoutes.js';
import imageGenerationRoutes from './routes/imageGenerationRoutes.js';

import { sanitizeData } from './middlewares/sanitize.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 3. RUN CLOUDINARY INITIALIZATION IMMEDIATELY AFTER CREATING THE APP INSTANCE
configureCloudinary();

// Security & CORS Middlewares — configured for cross-origin canvas textures on Vercel
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5176',
  'https://mojilo-mart.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Static Asset Serving with Cross-Origin Headers for Fabric.js canvas textures
app.use('/uploads', cors(), express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use('/public', cors(), express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
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

app.use((req, res, next) => {
  const start = Date.now();
  const authHeader = req.headers.authorization ? 'Bearer ***' : 'NONE';
  const cookieAuth = req.cookies?.accessToken ? 'Cookie ***' : 'NONE';
  console.log(`[BACKEND REQ] ${req.method} ${req.originalUrl} | AuthHeader: ${authHeader} | Cookie: ${cookieAuth}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[BACKEND RES] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Time: ${duration}ms`);
  });
  next();
});
// API Limiters
app.use('/api', apiLimiter);
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // If state is connecting (2), give it a brief grace period (up to 2000ms) to finish connecting
    if (mongoose.connection.readyState === 2) {
      let attempts = 0;
      while (attempts < 20 && mongoose.connection.readyState === 2) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is not ready. Please try again in a moment.',
        errors: []
      });
    }
  }
  next();
});

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
app.use('/api/cancellations', cancellationRoutes);
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
app.use('/api/generate-image', imageGenerationRoutes);

// Fallbacks
app.use(notFound);
app.use(errorHandler);


export default app;
