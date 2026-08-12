import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Category from '../models/Category.js';
import { cloudinary } from '../config/cloudinary.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const migrateCategoryImages = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB for Category Image Migration...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const categories = await Category.find();
    console.log(`Found ${categories.length} categories to check.`);

    let migratedCount = 0;

    for (const cat of categories) {
      if (cat.image && (cat.image.startsWith('data:image/') || cat.image.length > 500)) {
        console.log(`Migrating Base64 image for category '${cat.name}' (${cat._id})...`);
        try {
          const result = await cloudinary.uploader.upload(cat.image, {
            folder: 'categories',
          });
          cat.image = result.secure_url;
          await cat.save();
          migratedCount++;
          console.log(`✓ Category '${cat.name}' migrated. New URL: ${result.secure_url}`);
        } catch (uploadErr) {
          console.error(`✕ Failed to migrate image for category '${cat.name}':`, uploadErr.message);
        }
      } else {
        console.log(`- Category '${cat.name}' image is already clean/URL.`);
      }
    }

    console.log(`\nMigration complete. ${migratedCount} categories updated.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateCategoryImages();
