import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    default: 'Mojilo',
  },
  currency: {
    type: String,
    default: 'INR',
  },
  taxRatePercentage: {
    type: Number,
    default: 18, // 18% standard GST
  },
  freeShippingThreshold: {
    type: Number,
    default: 999, // orders above Rs. 999 get free shipping
  },
  logoUrl: {
    type: String,
  },
  minimumPrintCharge: {
    type: Number,
    default: 30, // Minimum charge in currency units
  },
  pricePerSquareInch: {
    type: Number,
    default: 1, // Default rate per sq. in.
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    pinterest: String,
  },
  seoMetadata: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
  },
  smtpSettings: {
    host: String,
    port: Number,
    user: String,
    pass: String,
    fromEmail: String,
  }
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
