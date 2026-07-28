import couponRepository from '../repositories/couponRepository.js';
import ApiError from '../utils/ApiError.js';

class CouponService {
  async getCouponByCode(code) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw new ApiError(404, 'Invalid coupon code or coupon is no longer active');
    }
    return coupon;
  }

  async validateCoupon(code, orderAmount) {
    const coupon = await this.getCouponByCode(code);

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new ApiError(400, 'This coupon code has expired');
    }

    if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      throw new ApiError(400, 'This coupon code usage limit has been reached');
    }

    const orderAmt = Number(orderAmount) || 0;

    if (coupon.minOrderAmount && orderAmt < coupon.minOrderAmount) {
      throw new ApiError(400, `Minimum order amount to use this coupon is Rs. ${coupon.minOrderAmount}`);
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderAmt * coupon.value) / 100;
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      // Flat discount
      discount = coupon.value;
    }

    if (orderAmt > 0 && discount > orderAmt) {
      discount = orderAmt;
    }

    discount = Math.round(discount * 100) / 100;

    return {
      couponId: coupon._id,
      code: coupon.code,
      discountAmount: discount,
      type: coupon.type,
      value: coupon.value
    };
  }

  async createCoupon(couponData) {
    return await couponRepository.create(couponData);
  }
}

export default new CouponService();
