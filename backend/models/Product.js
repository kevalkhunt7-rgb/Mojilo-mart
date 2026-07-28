import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price'],
    min: [0, 'Base price cannot be negative'],
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative'],
    validate: {
      validator: function (value) {
        if (value == null || value === '') return true;
        let basePrice = this.basePrice;
        if (basePrice === undefined && typeof this.getUpdate === 'function') {
          const update = this.getUpdate();
          const updateDoc = (update && update.$set) ? update.$set : update;
          basePrice = updateDoc ? updateDoc.basePrice : undefined;
        }
        if (basePrice !== undefined && basePrice !== null) {
          return Number(value) < Number(basePrice);
        }
        return true;
      },
      message: 'Sale price ({VALUE}) must be lower than base price',
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please associate a category'],
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  }],
  images: [{
    url: { type: String, required: true },
    publicId: String,
  }],
  newArrival: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sku: {
    type: String,
    trim: true,
    sparse: true, // Allows multiple docs without SKU
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft',
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex'],
    default: 'Unisex',
  },
  material: {
    type: String,
    trim: true,
  },
  sizeChart: {
    type: String,
  },
  colors: [{
    type: String,
    trim: true,
  }],
  sizes: [{
    type: String,
    trim: true,
  }],
  searchTags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
productSchema.index({ category: 1, basePrice: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 }, { sparse: true });

// Combined text search index (including searchTags for better search relevance)
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  searchTags: 'text' 
});

// Virtual populate for variants
productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'product',
});

// Auto-generate or format slug on save
productSchema.pre('save', function (next) {
  if (this.isModified('slug') && this.slug) {
    this.slug = slugify(this.slug);
  } else if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;