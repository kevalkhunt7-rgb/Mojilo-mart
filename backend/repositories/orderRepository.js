import mongoose from 'mongoose';
import BaseRepository from './baseRepository.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import Customization from '../models/Customization.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async getOrdersList({ skip = 0, limit = 20 }) {
    // 1. Fetch orders list (exclude unconfirmed abandoned pending checkouts)
    const filter = {
      $nor: [{ paymentStatus: 'pending', orderStatus: 'pending' }]
    };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select('orderNumber user totalAmount paymentStatus orderStatus createdAt shippingAddress')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    if (orders.length === 0) {
      return { orders: [], total: 0 };
    }

    const orderIds = orders.map(o => o._id);
    const OrderItem = mongoose.model('OrderItem');

    // 2. Fetch OrderItems and populate lightweight product/variant image references
    const items = await OrderItem.find({ order: { $in: orderIds } })
      .select('order productName quantity price color size variantDescription image imageUrl decalUrl previewUrl customization product productVariant')
      .populate('product', 'image imageUrl images')
      .populate('productVariant', 'image imageUrl images')
      .lean();

    const itemsMap = new Map();
    items.forEach(item => {
      // Resolve image from OrderItem snapshot -> Product -> ProductVariant
      const prodImg = item.product?.image || item.product?.imageUrl || item.product?.images?.[0]?.url || (typeof item.product?.images?.[0] === 'string' ? item.product?.images?.[0] : null);
      const variantImg = item.productVariant?.image || item.productVariant?.imageUrl || item.productVariant?.images?.[0]?.url || (typeof item.productVariant?.images?.[0] === 'string' ? item.productVariant?.images?.[0] : null);
      
      const listImage = item.decalUrl || item.previewUrl || item.image || item.imageUrl || prodImg || variantImg || null;
      
      if (listImage) {
        item.image = item.image || listImage;
        item.customization = {
          decalUrl: listImage,
          previewUrl: listImage,
          previews: { front: listImage }
        };
      }

      const oId = item.order.toString();
      if (!itemsMap.has(oId)) itemsMap.set(oId, []);
      itemsMap.get(oId).push(item);
    });

    orders.forEach(order => {
      order.items = itemsMap.get(order._id.toString()) || [];
      if (order.items.length > 0) {
        const itemsTotal = order.items.reduce((sum, it) => sum + ((it.price || 0) * (it.quantity || 1)), 0);
        if (itemsTotal > 0) {
          order.totalAmount = itemsTotal;
          if (order.pricingSummary) {
            order.pricingSummary.subtotal = itemsTotal;
            order.pricingSummary.grandTotal = Math.max(0, itemsTotal - (order.pricingSummary.discount || 0));
          }
        }
      }
    });

    return { orders, total };
  }

  async populateOrdersHelper(orders, options = {}) {
    if (!orders) return orders;
    const isArray = Array.isArray(orders);
    const orderDocs = isArray ? orders.filter(Boolean) : [orders].filter(Boolean);
    if (orderDocs.length === 0) return orders;

    const { includeFullCanvas = false } = options;
    const orderIds = orderDocs.map(o => o._id);

    const OrderItem = mongoose.model('OrderItem');
    const Product = mongoose.model('Product');
    const ProductVariant = mongoose.model('ProductVariant');
    const Customization = mongoose.model('Customization');
    const Layer = mongoose.model('Layer');

    const allOrderItems = await OrderItem.find({ order: { $in: orderIds } }).lean();

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

    const custQuery = customizationIds.length > 0
      ? (includeFullCanvas
        ? Customization.find({ _id: { $in: customizationIds } }).lean()
        : Customization.find({ _id: { $in: customizationIds } }).select('-canvasJSON -editableDesignJSON').lean())
      : Promise.resolve([]);

    const [products, variants, customizations, layers] = await Promise.all([
      productIds.length > 0 ? Product.find({ _id: { $in: productIds } }).lean() : [],
      variantIds.length > 0 ? ProductVariant.find({ _id: { $in: variantIds } }).lean() : [],
      custQuery,
      customizationIds.length > 0 ? Layer.find({ customizationId: { $in: customizationIds } }).lean() : []
    ]);

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

    const itemsByOrderMap = new Map();

    allOrderItems.forEach(item => {
      if (item.product && productMap.has(item.product.toString())) {
        item.product = productMap.get(item.product.toString());
      } else {
        item.product = { name: item.productName || 'Custom Template Item' };
      }

      const prodImg = (typeof item.product === 'object' && item.product !== null)
        ? (item.product.image || item.product.imageUrl || (Array.isArray(item.product.images) ? (item.product.images[0]?.url || item.product.images[0]) : null))
        : null;

      if (item.productVariant && variantMap.has(item.productVariant.toString())) {
        item.productVariant = variantMap.get(item.productVariant.toString());
      } else {
        item.productVariant = {
          name: typeof item.productVariant === 'string' ? item.productVariant : 'Custom Template Design'
        };
      }

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
        const hasRealCustomData = Boolean(
          itemLayers.length > 0 ||
          (custDoc.editableDesignJSON && typeof custDoc.editableDesignJSON === 'object' && Object.keys(custDoc.editableDesignJSON).length > 0) ||
          (custDoc.canvasJSON && typeof custDoc.canvasJSON === 'object' && Object.keys(custDoc.canvasJSON).length > 0) ||
          custDoc.isCustomDesign === true ||
          item.isCustomTemplate === true ||
          item.productName === 'Custom Template Item'
        );
        item.isCustomized = hasRealCustomData;
        let frontImg = custDoc.decalUrl || custDoc.previewUrl || custDoc.previews?.front || custDoc.previews?.mockup;

        if (!frontImg && itemLayers.length > 0) {
          for (const l of itemLayers) {
            if (l.imageConfig?.originalUrl || l.imageConfig?.processedUrl) {
              frontImg = l.imageConfig.originalUrl || l.imageConfig.processedUrl;
              break;
            }
          }
        }

        if (!frontImg) frontImg = item.decalUrl || item.previewUrl || item.image || item.imageUrl || prodImg || null;

        const custColor = custDoc.selectedColor || custDoc.color || item.color || '#FFFFFF';
        item.color = custColor;
        item.decalUrl = hasRealCustomData ? frontImg : null;
        item.previewUrl = frontImg;
        item.image = frontImg || item.image || prodImg;

        item.customization = {
          ...custDoc,
          color: custColor,
          selectedColor: custColor,
          decalUrl: frontImg,
          previewUrl: frontImg,
          previews: { front: frontImg, ...(custDoc.previews || {}) },
          layers: itemLayers
        };
      } else {
        const rawCustObj = typeof item.customization === 'object' && item.customization !== null ? item.customization : {};
        const hasRealCustomData = Boolean(
          (rawCustObj.editableDesignJSON && typeof rawCustObj.editableDesignJSON === 'object' && Object.keys(rawCustObj.editableDesignJSON).length > 0) ||
          (rawCustObj.canvasJSON && typeof rawCustObj.canvasJSON === 'object' && Object.keys(rawCustObj.canvasJSON).length > 0) ||
          (Array.isArray(rawCustObj.layers) && rawCustObj.layers.length > 0) ||
          rawCustObj.isCustomDesign === true ||
          item.isCustomTemplate === true ||
          item.productName === 'Custom Template Item'
        );
        item.isCustomized = hasRealCustomData;

        const fallbackColor = rawCustObj.selectedColor || rawCustObj.color || item.color || '#FFFFFF';
        const fallbackImg = rawCustObj.decalUrl || rawCustObj.previewUrl || rawCustObj.image || item.decalUrl || item.previewUrl || item.image || item.imageUrl || prodImg || null;

        item.color = fallbackColor;
        item.decalUrl = hasRealCustomData ? fallbackImg : null;
        item.previewUrl = fallbackImg;
        item.image = fallbackImg || item.image || prodImg;

        if (hasRealCustomData) {
          item.customization = {
            _id: targetIdStr || item._id,
            ...rawCustObj,
            color: fallbackColor,
            selectedColor: fallbackColor,
            decalUrl: fallbackImg,
            previewUrl: fallbackImg,
            previews: { front: fallbackImg, ...(rawCustObj.previews || {}) },
            clothingType: item.productName || 'Custom Garment',
            layers: []
          };
        } else {
          item.customization = null;
        }
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
    const orders = await Order.find({
      user: userId,
      $nor: [{ paymentStatus: 'pending', orderStatus: 'pending' }]
    })
      .select('orderNumber totalAmount paymentStatus orderStatus createdAt shippingAddress discountAmount pricingSummary subTotal')
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) return [];

    const populated = await this.populateOrdersHelper(orders, { includeFullCanvas: true });
    return populated;
  }

  async findWithDetails(orderId) {
    let order = null;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate('shippingMethod')
        .lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: orderId })
        .populate('user', 'name email')
        .populate('shippingMethod')
        .lean();
    }
    if (!order) return null;
    const populated = await this.populateOrdersHelper([order], { includeFullCanvas: true });
    return populated[0];
  }

  async findByNumberWithDetails(orderNumber) {
    const order = await Order.findOne({ orderNumber })
      .populate('shippingMethod')
      .lean();
    if (!order) return null;
    const populated = await this.populateOrdersHelper([order], { includeFullCanvas: true });
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