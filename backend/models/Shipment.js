import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  shippingCarrier: {
    type: String, // e.g. FedEx, BlueDart, Delhivery
    required: true,
  },
  trackingNumber: {
    type: String,
    required: true,
  },
  shippedDate: {
    type: Date,
  },
  deliveryDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed_attempt'],
    default: 'pending',
  }
}, {
  timestamps: true,
});

shipmentSchema.index({ order: 1 });
shipmentSchema.index({ trackingNumber: 1 });

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;
