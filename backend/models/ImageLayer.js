import mongoose from 'mongoose';

const imageLayerSchema = new mongoose.Schema({
  customization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization',
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String, // Cloudinary asset ID
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  scaleX: {
    type: Number,
    default: 1,
  },
  scaleY: {
    type: Number,
    default: 1,
  },
  rotation: {
    type: Number,
    default: 0,
  },
  opacity: {
    type: Number,
    default: 1,
    min: 0,
    max: 1,
  },
  flipX: {
    type: Boolean,
    default: false,
  },
  flipY: {
    type: Boolean,
    default: false,
  },
  zIndex: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

imageLayerSchema.index({ customization: 1 });

const ImageLayer = mongoose.model('ImageLayer', imageLayerSchema);

export default ImageLayer;
