import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Product from './models/Product.js';
import ProductVariant from './models/ProductVariant.js';
import Warehouse from './models/Warehouse.js';
import Inventory from './models/Inventory.js';
import Setting from './models/Setting.js';

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('MongoDB Connected for Seeding');

    // 1. Clean collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});
    await Warehouse.deleteMany({});
    await Inventory.deleteMany({});
    await Setting.deleteMany({});
    console.log('Collections cleared');

    // 2. Seed Default Settings
    await Setting.create({
      storeName: 'Mojilo Custom T-Shirt Print Hub',
      currency: 'INR',
      taxRatePercentage: 18,
      freeShippingThreshold: 999,
      minimumPrintCharge: 30,
      pricePerSquareInch: 1
    });
    console.log('Global settings seeded');

    // 3. Seed verified Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123', // gets hashed by hook
      role: 'admin',
      isEmailVerified: true,
      status: 'active'
    });


    // 4. Seed Category & Brand
    const category = await Category.create({
      name: 'Apparel',
      description: 'Custom printable apparel'
    });

    const brand = await Brand.create({
      name: 'MOJILO',
      description: 'Mojilo Premium Custom Blanks'
    });
    console.log('Category and Brand seeded');

    // 5. Seed Warehouse
    const warehouse = await Warehouse.create({
      name: 'Main Fulfillment Center',
      location: 'Bangalore, Karnataka',
      contactPhone: '9988776655'
    });
    console.log('Warehouse seeded');

    // 6. Seed Product
    const product = await Product.create({
      name: 'Classic Crewneck T-Shirt',
      description: 'Heavyweight 100% cotton crewneck blank, perfect for custom direct-to-garment (DTG) printing.',
      basePrice: 299,
      category: category._id,
      brand: brand._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          publicId: 'default_tshirt'
        }
      ],
      newArrival: true,
      featured: true,
      isCustomizable: true
    });
    console.log('Product seeded');

    // 7. Seed Variant
    const variant = await ProductVariant.create({
      product: product._id,
      sku: 'MOJ-TSHIRT-BLK-L',
      price: 349, // overrides basePrice or stands as final variant price
      inventory: 100
    });
    console.log('Product Variant seeded');

    // 8. Seed Stock Inventory
    await Inventory.create({
      variant: variant._id,
      warehouse: warehouse._id,
      quantity: 100,
      lowStockThreshold: 5
    });
    console.log('Inventory logs seeded');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedAll();
