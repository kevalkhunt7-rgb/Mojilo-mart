import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an attribute name'],
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

attributeSchema.index({ slug: 1 });

attributeSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

const Attribute = mongoose.model('Attribute', attributeSchema);

export default Attribute;
