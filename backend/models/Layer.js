import mongoose from 'mongoose';

const layerSchema = new mongoose.Schema({
  customizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization',
    required: true,
  },
  printAreaName: {
    type: String,
    required: true,
    enum: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Neck Label'],
  },
  layerId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Image', 'Clipart', 'SVG', 'Text', 'Shape', 'QRCode', 'Barcode'],
  },
  zIndex: {
    type: Number,
    required: true,
  },
  
  // Transform & Geometry Coordinates
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  scaleX: { type: Number, default: 1 },
  scaleY: { type: Number, default: 1 },
  rotation: { type: Number, default: 0 },
  flipX: { type: Boolean, default: false },
  flipY: { type: Boolean, default: false },
  opacity: { type: Number, default: 1.0, min: 0, max: 1 },
  visible: { type: Boolean, default: true },
  locked: { type: Boolean, default: false },
  blendMode: { type: String, default: 'normal' },

  // Text-Specific Properties
  textConfig: {
    text: { type: String },
    fontFamily: { type: String },
    fontWeight: { type: String },
    fontStyle: { type: String },
    fontSize: { type: Number },
    letterSpacing: { type: Number },
    lineHeight: { type: Number },
    align: { type: String, enum: ['left', 'center', 'right', 'justify'] },
    fillColor: { type: String },
    strokeColor: { type: String },
    strokeWidth: { type: Number },
    shadow: {
      color: { type: String },
      blur: { type: Number },
      offsetX: { type: Number },
      offsetY: { type: Number }
    },
    curveRadius: { type: Number }
  },

  // Image/Asset-Specific Properties
  imageConfig: {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    originalUrl: { type: String },
    processedUrl: { type: String },
    cropInfo: {
      x: { type: Number },
      y: { type: Number },
      width: { type: Number },
      height: { type: Number }
    }
  }
}, {
  timestamps: true,
});

layerSchema.index({ customizationId: 1, printAreaName: 1, zIndex: 1 });

const Layer = mongoose.model('Layer', layerSchema);

export default Layer;
