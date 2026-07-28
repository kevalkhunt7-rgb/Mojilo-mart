import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true, // Automatically enforces uppercase code formats
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  inventory: {
    type: Number,
    required: [true, 'Stock count is required'],
    default: 0,
    min: 0,
  },
  
  // Directly embeds the dynamic array configurations from the UI
  colors: [{
    name: { 
      type: String, 
      required: [true, 'Color display name is required'] 
    },
    value: { 
      type: String, 
      required: [true, 'Color hex code value is required'] // e.g., "#6366f1"
    }
  }],
  
  // Directly embeds the size tags array from the UI
  sizes: [{
    type: String, // e.g., ["M", "XL", "32"]
    uppercase: true,
    trim: true
  }],

  images: [{
    url: String,
    publicId: String
  }],
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

productVariantSchema.index({ product: 1 });
productVariantSchema.index({ sku: 1 });

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
export default ProductVariant;