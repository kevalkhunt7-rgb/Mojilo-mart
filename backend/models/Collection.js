import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a collection name'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

collectionSchema.index({ slug: 1 });

collectionSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
