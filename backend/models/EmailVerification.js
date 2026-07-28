import mongoose from 'mongoose';

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: String,
  }
}, {
  timestamps: true,
});

emailVerificationSchema.index({ email: 1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-expire

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

export default EmailVerification;
