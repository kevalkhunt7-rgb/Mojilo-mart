import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  tagline: {
    type: String,
    trim: true,
    default: 'LIMITED DROP'
  },
  title: {
    type: String,
    required: [true, 'Banner heading title is required'],
    trim: true,
    uppercase: true // Enforces the clean bold uppercase visual style from your layout
  },
  description: {
    type: String,
    required: [true, 'Banner description text copy is required'],
    trim: true
  },
  // Call to Action Link Parameters
  ctaText: {
    type: String,
    trim: true,
    default: 'Shop Now'
  },
  ctaLink: {
    type: String,
    trim: true,
    default: '/shop'
  },
  // Metric Badge 1 (e.g., 2k+ / Collections)
  stat1Number: {
    type: String,
    trim: true,
    default: '2k+'
  },
  stat1Label: {
    type: String,
    trim: true,
    default: 'Collections'
  },
  // Metric Badge 2 (e.g., 5k+ / Items trusted to deliver)
  stat2Number: {
    type: String,
    trim: true,
    default: '5k+'
  },
  stat2Label: {
    type: String,
    trim: true,
    default: 'Items trusted to deliver'
  },
  // Hero Image Media Asset (Cloudinary object structure)
  image: {
    url: {
      type: String,
      required: [true, 'Hero display image URL asset link is required']
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary storage public ID asset reference tracking is required']
    }
  },
  // Visibility Carousel Switch Controls
  isActive: {
    type: Boolean,
    default: true
  },
  // Slide Ordering Index (Allows admins to manage sequence orders manually if needed)
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Tracks createdAt and updatedAt for timeline sorting
});

// Index declarations for optimizing landing page loading speeds
bannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;