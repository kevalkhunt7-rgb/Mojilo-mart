import mongoose from 'mongoose';

const textLayerSchema = new mongoose.Schema({
  customization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  fontFamily: {
    type: String,
    default: 'Arial',
  },
  fontSize: {
    type: Number,
    default: 24,
  },
  bold: {
    type: Boolean,
    default: false,
  },
  italic: {
    type: Boolean,
    default: false,
  },
  underline: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#000000',
  },
  outlineColor: {
    type: String,
    default: null,
  },
  outlineWidth: {
    type: Number,
    default: 0,
  },
  shadowColor: {
    type: String,
    default: null,
  },
  shadowBlur: {
    type: Number,
    default: 0,
  },
  curved: {
    type: Boolean,
    default: false,
  },
  letterSpacing: {
    type: Number,
    default: 0,
  },
  lineHeight: {
    type: Number,
    default: 1.2,
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
  zIndex: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

textLayerSchema.index({ customization: 1 });

const TextLayer = mongoose.model('TextLayer', textLayerSchema);

export default TextLayer;
