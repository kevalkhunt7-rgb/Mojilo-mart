import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Import all models to register schemas
import '../models/User.js';
import '../models/Category.js';
import '../models/Product.js';
import '../models/ProductVariant.js';
import '../models/Order.js';
import '../models/OrderItem.js';
import '../models/Customization.js';
import '../models/Layer.js';
import '../models/Tag.js';
import '../models/Collection.js';
import '../models/ShippingMethod.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const syncIndexes = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB for manual index synchronization...');
    await mongoose.connect(mongoUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB successfully.');

    const modelNames = mongoose.modelNames();
    console.log(`Synchronizing indexes for ${modelNames.length} models...`);

    for (const modelName of modelNames) {
      const model = mongoose.model(modelName);
      console.log(`Syncing indexes for model: ${modelName}...`);
      await model.syncIndexes();
      console.log(`✓ ${modelName} indexes synchronized.`);
    }

    console.log('All indexes synchronized successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing indexes:', error);
    process.exit(1);
  }
};

syncIndexes();
