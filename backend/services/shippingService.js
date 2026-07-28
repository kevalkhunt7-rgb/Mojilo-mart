import ShippingMethod from '../models/ShippingMethod.js';
import Shipment from '../models/Shipment.js';
import Tracking from '../models/Tracking.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

class ShippingService {
  async getActiveMethods(orderAmount = 0) {
    const methods = await ShippingMethod.find({ isActive: true });
    return methods.map(method => {
      // Check if orderAmount exceeds threshold for free shipping
      let currentCost = method.cost;
      if (method.minOrderAmount && orderAmount >= method.minOrderAmount) {
        currentCost = 0; // free shipping option
      }
      return {
        _id: method._id,
        name: method.name,
        cost: currentCost,
        deliveryTimeEstimated: method.deliveryTimeEstimated
      };
    });
  }

  async createShipment(orderId, { carrier, trackingNumber }) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const shipment = await Shipment.create({
      order: orderId,
      shippingCarrier: carrier,
      trackingNumber,
      shippedDate: new Date(),
      status: 'shipped'
    });

    // Create initial tracking checkpoint
    await Tracking.create({
      shipment: shipment._id,
      status: 'Shipped',
      location: 'Fulfillment Hub',
      notes: `Package handed over to ${carrier}. Tracking reference: ${trackingNumber}`
    });

    order.orderStatus = 'shipped';
    await order.save();

    return shipment;
  }

  async addTrackingCheckpoint(shipmentId, { status, location, notes }) {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) {
      throw new ApiError(404, 'Shipment record not found');
    }

    const checkpoint = await Tracking.create({
      shipment: shipmentId,
      status,
      location,
      notes
    });

    if (status === 'Delivered') {
      shipment.status = 'delivered';
      shipment.deliveryDate = new Date();
      await shipment.save();

      // Update Order Status
      await Order.findByIdAndUpdate(shipment.order, { orderStatus: 'delivered', paymentStatus: 'paid' });
    } else {
      shipment.status = 'in_transit';
      await shipment.save();
    }

    return checkpoint;
  }
}

export default new ShippingService();
