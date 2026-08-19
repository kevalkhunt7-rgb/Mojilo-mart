import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
    default: null,
  },
  name: {
    type: String,
    required: [true, 'Please add a design name'],
    trim: true,
  },
  previewImage: {
    url: String,
    publicId: String,
  },
  customizations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization',
  }]
}, {
  timestamps: true,
});

designSchema.index({ user: 1 });
designSchema.index({ product: 1 });

const Design = mongoose.model('Design', designSchema);


export default Design;