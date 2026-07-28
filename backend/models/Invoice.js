import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  invoicePdfUrl: {
    type: String, // URL link to PDF invoice asset
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

invoiceSchema.index({ order: 1 });
invoiceSchema.index({ invoiceNumber: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
