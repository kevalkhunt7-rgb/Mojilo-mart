import mongoose from 'mongoose';

const fontSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a font name'],
    unique: true,
    trim: true,
  },
  family: {
    type: String,
    required: true, // e.g. "'Pacifico', cursive"
  },
  url: {
    type: String, // Google font CDN link or hosted file link
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const Font = mongoose.model('Font', fontSchema);

export default Font;
