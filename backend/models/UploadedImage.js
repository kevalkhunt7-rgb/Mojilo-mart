import mongoose from 'mongoose';

const uploadedImageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null for guests
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number, // in bytes
  },
  fileType: {
    type: String, // e.g. png, jpg
  }
}, {
  timestamps: true,
});

uploadedImageSchema.index({ user: 1 });

const UploadedImage = mongoose.model('UploadedImage', uploadedImageSchema);

export default UploadedImage;
