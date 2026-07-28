import mongoose from 'mongoose';
import orderRepository from '../repositories/orderRepository.js';
import inventoryRepository from '../repositories/inventoryRepository.js';
import cartService from './cartService.js';
import couponService from './couponService.js';
import couponRepository from '../repositories/couponRepository.js';
import invoiceService from './invoiceService.js';
import emailService from './emailService.js';
import customizationService from './customizationService.js';
import OrderItem from '../models/OrderItem.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import CustomCart from '../models/customCart.js';
import Customization from '../models/Customization.js';
import customCartService from './customCartService.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { enqueuePrintGeneration } from './printQueueService.js';

class OrderService {
  /**
   * Place an order from the user's cart, freezing all design parameters as static snapshots
   */
  async placeOrder(userId, { paymentMethod, couponCode, shippingAddress, billingAddress, shippingMethodId, idempotencyKey }) {
    // Idempotency check: prevent duplicate checkouts
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        logger.info(`Duplicate order placement request detected for idempotencyKey: ${idempotencyKey}`);
        return {
          order: existingOrder,
          isDuplicate: true
        };
      }
    }

    // 1. Get both standard and custom carts for the user
    const [cart, customCart] = await Promise.all([
      Cart.findOne({ user: userId }).populate('items.product items.variant items.customization'),
      CustomCart.findOne({ user: userId }).populate('items.customizationId')
    ]);

    const allCartItems = [];
    if (cart && cart.items.length > 0) {
      allCartItems.push(...cart.items.map(item => ({
        product: item.product,
        variant: item.variant,
        customization: item.customization,
        quantity: item.quantity,
        price: item.price,
        pricing: item.pricing,
        size: item.size,
        color: item.color,
        isTemplate: false
      })));
    }
    if (customCart && customCart.items.length > 0) {
      allCartItems.push(...customCart.items.map(item => {
        const itemPrice = item.totalItemPrice / (item.quantity || 1);
        return {
          product: null,
          variant: null, // CRITICAL FIX: Explicitly null to prevent CastErrors on population
          clothingType: item.clothingType, // Carry over string token safely
          customization: item.customizationId || item, // Pass customizationId or item snapshot
          rawCustomCartItem: item,
          quantity: item.quantity,
          price: itemPrice,
          pricing: {
            basePrice: item.virtualBasePrice,
            customizationCost: item.totalItemPrice - (item.virtualBasePrice * item.quantity),
            printCost: 0
          },
          size: item.size,
          color: item.color,
          isTemplate: true
        };
      }));
    }

    if (allCartItems.length === 0) {
      throw new ApiError(400, 'Your shopping cart is empty');
    }

    // 2. Verify stock inventory for standard database items
    for (const item of allCartItems) {
      if (item.isTemplate) {
        continue; // Print-on-demand template items bypass inventory check
      }
      const hasStock = await inventoryRepository.checkStock(item.variant, item.quantity);
      if (!hasStock) {
        throw new ApiError(400, `Stock unavailable for SKU: ${item.variant?.sku || 'selected item'}. Decrease quantity or try again.`);
      }
    }

    // 3. Calculate Prices from item snapshots (prioritize active salePrice)
    let calculatedSubTotal = allCartItems.reduce((sum, item) => {
      const prod = item.product;
      const unitPrice = (prod?.salePrice && Number(prod.salePrice) > 0)
        ? Number(prod.salePrice)
        : ((prod?.price && Number(prod.price) > 0)
            ? Number(prod.price)
            : (prod?.basePrice || item.price || 0));
      return sum + (unitPrice * (item.quantity || 1));
    }, 0);

    let subTotal = calculatedSubTotal > 0 
      ? calculatedSubTotal 
      : ((cart?.totalAmount || 0) + (customCart?.totalAmount || 0));

    let discountAmount = 0;

    // Apply Coupon
    let couponId = null;
    if (couponCode) {
      const valCoupon = await couponService.validateCoupon(couponCode, subTotal);
      discountAmount = valCoupon.discountAmount;
      couponId = valCoupon.couponId;
    }

    // Taxes & Shipping
    const taxAmount = 0;
    const shippingCharges = 0;
    const totalAmount = Math.max(0, Math.round((subTotal - discountAmount + shippingCharges) * 100) / 100);

    // 4. Create Order Number
    const orderNumber = `MOJ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStatus = paymentMethod === 'COD' ? 'confirmed' : 'pending';

    // 5. Create Order with snapshot summary
    const order = await orderRepository.create({
      user: userId,
      orderNumber,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod: shippingMethodId || null,
      shippingCharges,
      taxAmount,
      discountAmount,
      subTotal,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: 'pending',
      orderStatus: initialStatus,
      coupon: couponId,
      ...(idempotencyKey ? { idempotencyKey } : {}), // Conditionally include so MongoDB sparse index skips undefined keys
      pricingSummary: {
        subtotal: subTotal,
        tax: taxAmount,
        shipping: shippingCharges,
        discount: discountAmount,
        grandTotal: totalAmount
      },
      statusHistory: [{
        status: initialStatus,
        notes: paymentMethod === 'COD' ? 'Order placed and confirmed (COD).' : 'Order created, awaiting online payment confirmation.',
        updatedBy: 'system'
      }]
    });

    if (couponId) {
      await couponRepository.incrementUsage(couponId);
    }

    // 6. Create Order Items and Deduct Inventory Stock
    const orderItems = [];
    for (const item of allCartItems) {
      // Clean string representation of template or database product properties
      const prettyClothingType = item.clothingType
        ? item.clothingType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Custom Garment';

      const variantDesc = item.isTemplate
        ? `Base: ${prettyClothingType} / Size: ${item.size || 'N/A'} / Color: ${item.color || 'N/A'}`
        : `Size: ${item.size || 'N/A'} / Color: ${item.color || 'N/A'}`;

      // Persist real Customization document in MongoDB collection
      let customizationRef = null;
      const rawCust = (typeof item.customization === 'object' && item.customization !== null)
        ? item.customization
        : (item.rawCustomCartItem || item || {});

      const rawId = typeof item.customization === 'string' && mongoose.Types.ObjectId.isValid(item.customization)
        ? item.customization
        : (rawCust._id || rawCust.id || rawCust.customizationId);

      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        const existingCust = await Customization.findById(rawId);
        if (existingCust) {
          customizationRef = existingCust._id;
          if (userId && !existingCust.user) {
            existingCust.user = userId;
            await existingCust.save({ validateBeforeSave: false });
          }
          logger.info(`[OrderService] Linked existing Customization document: ${existingCust._id}`);
        }
      }

      if (!customizationRef && (item.isTemplate || item.clothingType || rawCust.decalUrl || rawCust.previewUrl || rawCust.previews || rawCust.editableDesignJSON)) {
        const frontImg = rawCust.decalUrl || rawCust.previewUrl || rawCust.previews?.front || rawCust.frontPreview || item.image || item.decalUrl || null;

        logger.info('[OrderService] Creating new Customization document for order item:', {
          clothingType: prettyClothingType,
          color: item.color || rawCust.selectedColor || rawCust.color,
          hasFrontImg: Boolean(frontImg)
        });

        try {
          const createdCust = await customizationService.createCustomization({
            productId: item.product?._id || item.product || null,
            variantId: item.variant?._id || item.variant || null,
            selectedColor: rawCust.selectedColor || rawCust.color || item.color || '#6B7280',
            selectedSize: item.size || rawCust.size || 'M',
            editableDesignJSON: rawCust.editableDesignJSON || rawCust.designJSON || null,
            previews: rawCust.previews || (frontImg ? { front: frontImg } : {}),
            decalUrl: frontImg,
            previewUrl: frontImg,
            printAreas: rawCust.printAreas || [
              {
                areaName: 'front',
                layers: rawCust.layers || []
              }
            ],
            userId: userId || null,
            baseTemplateId: rawCust.baseTemplateId || item.clothingType || 'template',
            clothingType: prettyClothingType
          });

          if (createdCust && createdCust._id) {
            customizationRef = createdCust._id;
            logger.info(`[OrderService] Successfully created & linked Customization document: ${createdCust._id}`);
          }
        } catch (custErr) {
          logger.error('[OrderService] Failed to create customization document during placeOrder:', custErr);
        }
      }

      const orderItem = await OrderItem.create({
        order: order._id,
        product: item.product?._id || null,
        productVariant: item.variant?._id || null,
        customization: customizationRef,
        productName: item.product?.name || item.customization?.clothingType || prettyClothingType,
        variantDescription: variantDesc,
        color: item.color || item.customization?.selectedColor || item.customization?.color || '#FFFFFF',
        size: item.size || 'M',
        quantity: item.quantity || 1,
        price: item.price || 0,
        pricing: {
          basePrice: item.pricing?.basePrice || item.price || 0,
          customizationCost: item.pricing?.customizationCost || 0,
          printCost: item.pricing?.printCost || 0
        }
      });

      orderItems.push(orderItem);

      if (!item.isTemplate && item.variant) {
        await inventoryRepository.deductStock(item.variant, item.quantity);
      }
    }

    // 7. Generate invoice document
    let invoice = null;
    try {
      invoice = await invoiceService.generateInvoiceForOrder(order._id);
    } catch (err) {
      logger.error('Failed to generate invoice for order:', err);
    }

    // 8. Clear standard & custom carts upon successful order creation
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }
    try {
      await customCartService.clearCart({ userId }, false);
    } catch (err) {
      logger.error(`Failed to clear custom cart for user ${userId} on checkout:`, err);
    }

    if (paymentMethod === 'COD') {
      // Trigger print rendering background job
      try {
        await enqueuePrintGeneration(order._id);
      } catch (err) {
        logger.error(`Failed to enqueue print files generation for COD Order ${order._id}:`, err);
      }

      // Trigger asynchronous email confirmation
      this.sendConfirmationEmailAsync(userId, order);
    }

    return {
      order,
      invoiceNumber: invoice ? invoice.invoiceNumber : null
    };
  }

  async sendConfirmationEmailAsync(userId, order) {
    try {
      const user = await Order.findById(order._id).populate('user');
      const pdfBuffer = await invoiceService.getInvoicePdfBuffer(order._id);
      await emailService.sendOrderConfirmationEmail(user.user.email, order, pdfBuffer);
    } catch (err) {
      logger.error('Failed to send confirmation email async:', err);
    }
  }

  /**
   * Update the order status, logging the timeline transition securely
   */
  async updateOrderStatus(orderId, { status, notes, userId }) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    } else if (status === 'refunded') {
      order.paymentStatus = 'refunded';
    }

    // Append to timeline log
    order.statusHistory.push({
      status,
      notes: notes || `Timeline transitioned from ${previousStatus} to ${status}.`,
      updatedBy: userId ? userId.toString() : 'system'
    });

    await order.save();
    return order;
  }
}

export default new OrderService();