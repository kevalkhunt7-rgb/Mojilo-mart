import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a brand name'],
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
  logo: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

brandSchema.index({ slug: 1 });

brandSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
