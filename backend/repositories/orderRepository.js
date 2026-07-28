import mongoose from 'mongoose';
import BaseRepository from './baseRepository.js';
import Order from '../models/Order.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async populateOrdersHelper(orders) {
    if (!orders) return orders;
    const isArray = Array.isArray(orders);
    const orderDocs = isArray ? orders.filter(Boolean) : [orders].filter(Boolean);
    if (orderDocs.length === 0) return orders;

    const orderIds = orderDocs.map(o => o._id);

    const OrderItem = mongoose.model('OrderItem');
    const Product = mongoose.model('Product');
    const ProductVariant = mongoose.model('ProductVariant');
    const Customization = mongoose.model('Customization');
    const Layer = mongoose.model('Layer');

    // Batch 1: Fetch all OrderItems for these orders in one query
    const allOrderItems = await OrderItem.find({ order: { $in: orderIds } }).lean();

    // Extract unique product, variant, and customization IDs
    const productIds = [];
    const variantIds = [];
    const customizationIds = [];

    allOrderItems.forEach(item => {
      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        productIds.push(item.product);
      }
      if (item.productVariant && mongoose.Types.ObjectId.isValid(item.productVariant)) {
        variantIds.push(item.productVariant);
      }
      if (item.customization) {
        let targetId = null;
        if (mongoose.Types.ObjectId.isValid(item.customization)) {
          targetId = item.customization;
        } else if (typeof item.customization === 'object' && item.customization !== null) {
          targetId = item.customization._id || item.customization.id || item.customization.customizationId || null;
        }
        if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
          customizationIds.push(targetId);
        }
      }
    });

    // Batch 2: Fetch Products, Variants, Customizations, and Layers using $in
    const [products, variants, customizations, layers] = await Promise.all([
      productIds.length > 0 ? Product.find({ _id: { $in: productIds } }).lean() : [],
      variantIds.length > 0 ? ProductVariant.find({ _id: { $in: variantIds } }).lean() : [],
      customizationIds.length > 0 ? Customization.find({ _id: { $in: customizationIds } }).lean() : [],
      customizationIds.length > 0 ? Layer.find({ customizationId: { $in: customizationIds } }).lean() : []
    ]);

    // Create lookup maps for fast O(1) matching
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    const variantMap = new Map(variants.map(v => [v._id.toString(), v]));
    const customizationMap = new Map(customizations.map(c => [c._id.toString(), c]));

    const layerMap = new Map();
    layers.forEach(l => {
      const cid = l.customizationId ? l.customizationId.toString() : null;
      if (cid) {
        if (!layerMap.has(cid)) layerMap.set(cid, []);
        layerMap.get(cid).push(l);
      }
    });

    // Process and attach populated data to order items
    const itemsByOrderMap = new Map();

    allOrderItems.forEach(item => {
      // 1. Product resolution
      if (item.product && productMap.has(item.product.toString())) {
        item.product = productMap.get(item.product.toString());
      } else {
        item.product = { name: item.productName || 'Custom Template Item' };
      }

      // 2. Variant resolution
      if (item.productVariant && variantMap.has(item.productVariant.toString())) {
        item.productVariant = variantMap.get(item.productVariant.toString());
      } else {
        item.productVariant = {
          name: typeof item.productVariant === 'string' ? item.productVariant : 'Custom Template Design'
        };
      }

      // 3. Customization resolution & Synthetic Fallback
      let targetIdStr = null;
      if (item.customization) {
        if (mongoose.Types.ObjectId.isValid(item.customization)) {
          targetIdStr = item.customization.toString();
        } else if (typeof item.customization === 'object' && item.customization !== null) {
          const possibleId = item.customization._id || item.customization.id || item.customization.customizationId;
          if (possibleId && mongoose.Types.ObjectId.isValid(possibleId)) {
            targetIdStr = possibleId.toString();
          }
        }
      }

      const custDoc = targetIdStr ? customizationMap.get(targetIdStr) : null;
      const itemLayers = targetIdStr ? (layerMap.get(targetIdStr) || []) : [];

      if (custDoc) {
        // Real Customization document found
        let frontImg = custDoc.decalUrl || custDoc.previewUrl || custDoc.previews?.front || custDoc.previews?.mockup;

        if (!frontImg && itemLayers.length > 0) {
          for (const l of itemLayers) {
            if (l.imageConfig?.originalUrl || l.imageConfig?.processedUrl) {
              frontImg = l.imageConfig.originalUrl || l.imageConfig.processedUrl;
              break;
            }
          }
        }

        if (!frontImg && custDoc.editableDesignJSON) {
          try {
            const design = typeof custDoc.editableDesignJSON === 'string' ? JSON.parse(custDoc.editableDesignJSON) : custDoc.editableDesignJSON;
            if (typeof design === 'object' && design !== null) {
              for (const view of Object.keys(design)) {
                const objs = Array.isArray(design[view]) ? design[view] : (design[view]?.objects || []);
                for (const obj of objs) {
                  if (obj && (obj.src || obj.url)) {
                    frontImg = obj.src || obj.url;
                    break;
                  }
                }
                if (frontImg) break;
              }
            }
          } catch (e) {}
        }

        if (!frontImg) frontImg = item.image || item.imageUrl || null;

        const custColor = custDoc.selectedColor || custDoc.color || item.color || '#FFFFFF';
        item.color = custColor;

        item.customization = {
          ...custDoc,
          color: custColor,
          selectedColor: custColor,
          decalUrl: frontImg,
          previewUrl: frontImg,
          previews: {
            front: frontImg,
            ...(custDoc.previews || {})
          },
          layers: itemLayers
        };
      } else {
        // Synthetic Fallback: Construct customization object directly from OrderItem fields
        const rawCustObj = typeof item.customization === 'object' && item.customization !== null ? item.customization : {};
        const fallbackColor = rawCustObj.selectedColor || rawCustObj.color || item.color || '#FFFFFF';
        const fallbackImg = rawCustObj.decalUrl || rawCustObj.previewUrl || rawCustObj.image || item.decalUrl || item.previewUrl || item.image || item.imageUrl || null;

        item.color = fallbackColor;
        item.customization = {
          _id: targetIdStr || item._id,
          ...rawCustObj,
          color: fallbackColor,
          selectedColor: fallbackColor,
          decalUrl: fallbackImg,
          previewUrl: fallbackImg,
          previews: {
            front: fallbackImg,
            ...(rawCustObj.previews || {})
          },
          clothingType: item.productName || 'Custom Garment',
          layers: []
        };
      }

      const oId = item.order.toString();
      if (!itemsByOrderMap.has(oId)) itemsByOrderMap.set(oId, []);
      itemsByOrderMap.get(oId).push(item);
    });

    orderDocs.forEach(order => {
      order.items = itemsByOrderMap.get(order._id.toString()) || [];
    });

    return orders;
  }

  async findByUserId(userId) {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    return await this.populateOrdersHelper(orders);
  }

  async findWithDetails(orderId) {
    const order = await Order.findById(orderId)
      .populate('shippingMethod')
      .lean();
    if (!order) return null;
    const populated = await this.populateOrdersHelper([order]);
    return populated[0];
  }

  async findByNumberWithDetails(orderNumber) {
    const order = await Order.findOne({ orderNumber })
      .populate('shippingMethod')
      .lean();
    if (!order) return null;
    const populated = await this.populateOrdersHelper([order]);
    return populated[0];
  }

  async getRevenueStats() {
    const stats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    return stats[0] || { totalRevenue: 0, count: 0 };
  }

  async getMonthlySales() {
    return await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
  }
}

export default new OrderRepository();

