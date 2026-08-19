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
  contactEmail: {
    type: String,
    default: 'support@mojilo.com',
  },
  contactPhone: {
    type: String,
    default: '+91 98765 43210',
  },
  businessAddress: {
    type: String,
    default: '123 Fashion Street, Surat, Gujarat, India',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  shippingEnabled: {
    type: Boolean,
    default: true,
  },
  defaultShippingCharge: {
    type: Number,
    default: 50,
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
    whatsapp: {
      url: { type: String, default: 'https://whatsapp.com/channel/0029VavFd8G6RGJNAmFON31c' },
      enabled: { type: Boolean, default: true },
    },
    facebook: {
      url: { type: String, default: 'https://facebook.com/MojiloMart' },
      enabled: { type: Boolean, default: true },
    },
    instagram: {
      url: { type: String, default: 'https://instagram.com/mojilomart' },
      enabled: { type: Boolean, default: true },
    },
    pinterest: {
      url: { type: String, default: 'https://in.pinterest.com/mojilomart' },
      enabled: { type: Boolean, default: true },
    },
    amazon: {
      url: { type: String, default: 'https://amzn.to/3W21xlC' },
      enabled: { type: Boolean, default: true },
    },
    googleMap: {
      url: { type: String, default: 'https://maps.app.goo.gl/wg4HAyaeiJzMcZKA' },
      enabled: { type: Boolean, default: true },
    },
    linkedin: {
      url: { type: String, default: 'https://linkedin.com/in/mojilo' },
      enabled: { type: Boolean, default: true },
    },
    twitter: {
      url: { type: String, default: 'https://x.com/MojiloMart' },
      enabled: { type: Boolean, default: true },
    },
    youtube: {
      url: { type: String, default: '' },
      enabled: { type: Boolean, default: true },
    },
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
