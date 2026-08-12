import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Order from '../models/Order.js';
import User from '../models/User.js';
import OrderItem from '../models/OrderItem.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const test = async () => {
  try {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const orders = await Order.find({})
      .select('orderNumber user totalAmount paymentStatus orderStatus createdAt shippingAddress')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(50)
      .lean();

    const orderIds = orders.map(o => o._id);
    const items = await OrderItem.find({ order: { $in: orderIds } })
      .select('order product customization productName quantity price color size variantDescription')
      .lean();

    const productObjectIds = [];
    const customizationObjectIds = [];

    items.forEach(item => {
      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        productObjectIds.push(new mongoose.Types.ObjectId(item.product.toString()));
      }
      if (item.customization && mongoose.Types.ObjectId.isValid(item.customization)) {
        customizationObjectIds.push(new mongoose.Types.ObjectId(item.customization.toString()));
      }
    });

    const db = mongoose.connection.db;

    console.log('Looking up products...');
    let t = Date.now();
    const products = productObjectIds.length > 0
      ? await db.collection('products').find({ _id: { $in: productObjectIds } }, { projection: { image: 1, images: 1 } }).toArray()
      : [];
    console.log(`Products fetched: ${products.length} in ${Date.now() - t} ms.`);

    console.log('Looking up customizations...');
    t = Date.now();
    const customizations = customizationObjectIds.length > 0
      ? await db.collection('customizations').find({ _id: { $in: customizationObjectIds } }, { projection: { previewUrl: 1, decalUrl: 1, previews: 1 } }).toArray()
      : [];
    console.log(`Customizations fetched: ${customizations.length} in ${Date.now() - t} ms.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
};

test();
