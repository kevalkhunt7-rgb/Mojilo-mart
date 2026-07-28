import mongoose from 'mongoose';

const manufacturingJobSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  orderItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true,
  },
  assignedPrinter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // assigned when transitioning to 'Assigned' status
  },
  machine: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Waiting', 'Assigned', 'Printing', 'QC', 'Completed'],
    default: 'Waiting',
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    notes: { type: String },
    updatedBy: { type: String }
  }]
}, {
  timestamps: true,
});

manufacturingJobSchema.index({ orderId: 1 });
manufacturingJobSchema.index({ orderItemId: 1 });
manufacturingJobSchema.index({ assignedPrinter: 1 });
manufacturingJobSchema.index({ status: 1 });

const ManufacturingJob = mongoose.model('ManufacturingJob', manufacturingJobSchema);

export default ManufacturingJob;
