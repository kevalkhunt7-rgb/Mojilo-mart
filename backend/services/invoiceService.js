import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import ApiError from '../utils/ApiError.js';
import Order from '../models/Order.js';

class InvoiceService {
  async getInvoiceByOrderId(orderId) {
    const invoice = await Invoice.findOne({ order: orderId });
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found for this order');
    }
    return invoice;
  }

  async generateInvoiceForOrder(orderId) {
    const order = await Order.findById(orderId).populate({
      path: 'items',
      populate: { path: 'product productVariant customization' }
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const existingInvoice = await Invoice.findOne({ order: orderId });
    if (existingInvoice) {
      return existingInvoice;
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Calculate tax (18%)
    const taxAmount = (order.subTotal * 18) / 100;

    const invoice = await Invoice.create({
      order: orderId,
      invoiceNumber,
      invoiceDate: new Date(),
      totalAmount: order.totalAmount,
      taxAmount
    });

    return invoice;
  }

  async getInvoicePdfBuffer(orderId) {
    const order = await Order.findById(orderId).populate({
      path: 'items',
      populate: { path: 'product productVariant customization' }
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return await generateInvoicePDF(order);
  }
}

export default new InvoiceService();
