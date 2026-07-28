import mongoose from 'mongoose';

const clipartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a clipart name'],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'General',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

clipartSchema.index({ category: 1 });

const Clipart = mongoose.model('Clipart', clipartSchema);

export default Clipart;
