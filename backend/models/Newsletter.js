import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

newsletterSchema.index({ email: 1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;
