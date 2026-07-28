import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for anonymous guests
  },
  originalFileName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true, // in bytes
  },
  cloudinaryPublicId: {
    type: String,
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  processedUrl: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  bgRemovedFlag: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  }
}, {
  timestamps: true,
});

assetSchema.index({ userId: 1, createdAt: -1 });

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;
