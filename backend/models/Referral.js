import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'rewarded', 'expired'],
    default: 'pending',
  },
  rewardAmount: {
    type: Number,
    default: 100, // Reward value in currency units
  }
}, {
  timestamps: true,
});

referralSchema.index({ referrer: 1 });
referralSchema.index({ referredUser: 1 });

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;
