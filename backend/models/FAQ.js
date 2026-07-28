import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String, // e.g. Shipping, Customization, Payments
    required: true,
    default: 'General',
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

faqSchema.index({ category: 1 });

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;
