import mongoose from 'mongoose';

const customizationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null if guest customization
  },
  // Backward compatibility fields
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
  },
  printArea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrintArea',
  },
  canvasJSON: {
    type: String, // fallback raw JSON canvas layout data
  },
  backgroundColor: {
    type: String,
    default: '#ffffff',
  },
  previewUrl: {
    type: String, // URL to design preview mockup image
  },

  // Upgraded production-ready customization fields
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
  },
  selectedColor: {
    type: String,
    trim: true,
  },
  selectedSize: {
    type: String,
    trim: true,
  },

  // Store editable designs as native MongoDB objects (BSON)
  editableDesignJSON: {
    type: mongoose.Schema.Types.Mixed,
  },

  assets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],

  printAreas: [{
    areaName: {
      type: String,
      required: true,
      enum: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Neck Label']
    },
    printAreaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrintArea'
    }
  }],

  previews: {
    front: { type: String },
    back: { type: String },
    leftSleeve: { type: String },
    rightSleeve: { type: String },
    left: { type: String },
    right: { type: String },
    pocket: { type: String },
    hood: { type: String },
    neckLabel: { type: String },
    mockup: { type: String }
  },

  productionFiles: {
    frontPrintUrl: { type: String },
    backPrintUrl: { type: String },
    leftSleevePrintUrl: { type: String },
    rightSleevePrintUrl: { type: String },
    neckLabelPrintUrl: { type: String }
  },

  // Frontend-only template fields (set when no DB product is linked)
  baseTemplateId: {
    type: String,
    trim: true,
    default: null,
  },
  clothingType: {
    type: String,
    trim: true,
    default: null,
  },

  // Bulk Roster / Teamwear customization details
  isBulkRoster: {
    type: Boolean,
    default: false,
  },
  roster: [{
    playerName: { type: String, trim: true, default: '' },
    playerNumber: { type: String, trim: true, default: '' },
    size: { type: String, trim: true, default: '' },
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

customizationSchema.index({ user: 1 });
customizationSchema.index({ product: 1 });
customizationSchema.index({ productId: 1 });

customizationSchema.virtual('textLayers', {
  ref: 'TextLayer',
  localField: '_id',
  foreignField: 'customization',
});

customizationSchema.virtual('imageLayers', {
  ref: 'ImageLayer',
  localField: '_id',
  foreignField: 'customization',
});

customizationSchema.virtual('layers', {
  ref: 'Layer',
  localField: '_id',
  foreignField: 'customizationId',
});

const Customization = mongoose.model('Customization', customizationSchema);

export default Customization;
