import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a tag name'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  }
}, {
  timestamps: true,
});

tagSchema.index({ slug: 1 });

tagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
