import mongoose from 'mongoose';

const sizeVariantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  priceAddon: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });

const apparelTemplateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // e.g. 'half-sleeve', 'long-sleeve', 'oversized', 'hoodie', 'sports-jersey'
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
    default: 299,
  },
  availableColors: {
    type: [String],
    default: ['#FFFFFF', '#000000'],
    validate: {
      validator: (arr) => arr.every((c) => /^#[0-9A-Fa-f]{3,8}$/.test(c)),
      message: 'Each color must be a valid HEX value (e.g. #FF0000)',
    },
  },
  sizes: {
    type: [sizeVariantSchema],
    default: () => [
      { size: 'S',   enabled: true,  priceAddon: 0 },
      { size: 'M',   enabled: true,  priceAddon: 0 },
      { size: 'L',   enabled: true,  priceAddon: 0 },
      { size: 'XL',  enabled: true,  priceAddon: 0 },
      { size: 'XXL', enabled: true,  priceAddon: 0 },
      { size: '3XL', enabled: false, priceAddon: 0 },
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

apparelTemplateSchema.index({ key: 1 }, { unique: true });

const ApparelTemplate = mongoose.model('ApparelTemplate', apparelTemplateSchema);

export default ApparelTemplate;
