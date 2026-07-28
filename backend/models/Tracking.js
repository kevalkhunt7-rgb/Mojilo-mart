import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true,
  },
  status: {
    type: String,
    required: true, // e.g. Shipped, In Transit, Arrived at Facility, Out for Delivery, Delivered
  },
  location: {
    type: String,
    required: true, // e.g. "Hub, Bangalore"
  },
  checkpointTime: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  }
}, {
  timestamps: true,
});

trackingSchema.index({ shipment: 1 });

const Tracking = mongoose.model('Tracking', trackingSchema);

export default Tracking;
