import mongoose from 'mongoose';

const designHistorySchema = new mongoose.Schema({
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  snapshot: {
    type: String, // Stringified JSON snapshot of customizations at this point in time
    required: true,
  },
  changeSummary: {
    type: String,
    default: 'Modified design layout',
  }
}, {
  timestamps: true,
});

designHistorySchema.index({ design: 1 });

const DesignHistory = mongoose.model('DesignHistory', designHistorySchema);

export default DesignHistory;
