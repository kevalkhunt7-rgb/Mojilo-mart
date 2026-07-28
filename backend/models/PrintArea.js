import mongoose from 'mongoose';

const printAreaSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true, // e.g. Front, Back, Left Sleeve, Right Sleeve, Inside Neck
  },
  // Backward compatibility fields
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  x: {
    type: Number,
    default: 0, // center offset or absolute X
  },
  y: {
    type: Number,
    default: 0, // Y offset
  },
  rotation: {
    type: Number,
    default: 0, // rotation angle
  },
  maxUploadSize: {
    type: Number,
    default: 10 * 1024 * 1024, // 10MB
  },
  allowedFileTypes: [{
    type: String,
    default: ['jpg', 'jpeg', 'png', 'svg']
  }],

  // Upgraded customizer schema fields
  canvasWidth: {
    type: Number,
    default: 4500, // Pixels at 300 DPI
  },
  canvasHeight: {
    type: Number,
    default: 5400, // Pixels at 300 DPI
  },
  printableWidth: {
    type: Number, // in mm
  },
  printableHeight: {
    type: Number, // in mm
  },
  dpi: {
    type: Number,
    default: 300,
  },
  backgroundColor: {
    type: String,
    default: 'transparent',
  },
  scaleFactor: {
    type: Number,
    default: 1.0,
  }
}, {
  timestamps: true,
});

printAreaSchema.index({ product: 1 });

const PrintArea = mongoose.model('PrintArea', printAreaSchema);

export default PrintArea;
