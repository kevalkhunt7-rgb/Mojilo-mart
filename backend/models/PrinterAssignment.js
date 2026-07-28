import mongoose from 'mongoose';

const printerAssignmentSchema = new mongoose.Schema({
  printerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  machine: {
    type: String,
    required: true,
    trim: true,
  },
  maxDailyCapacity: {
    type: Number,
    default: 50,
  },
  currentDailyLoad: {
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

printerAssignmentSchema.index({ printerId: 1 });
printerAssignmentSchema.index({ machine: 1 });

const PrinterAssignment = mongoose.model('PrinterAssignment', printerAssignmentSchema);

export default PrinterAssignment;
