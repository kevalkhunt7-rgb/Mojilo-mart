import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  metaTitle: String,
  metaDescription: String,
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

pageSchema.index({ slug: 1 });

pageSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title);
  }
  next();
});

const Page = mongoose.model('Page', pageSchema);

export default Page;
