import BaseRepository from './baseRepository.js';
import Coupon from '../models/Coupon.js';

class CouponRepository extends BaseRepository {
  constructor() {
    super(Coupon);
  }

  async findByCode(code) {
    return await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  }

  async incrementUsage(couponId) {
    return await Coupon.findByIdAndUpdate(couponId, {
      $inc: { usageCount: 1 }
    }, { new: true });
  }

  async decrementUsage(couponId) {
    if (!couponId) return null;
    return await Coupon.findByIdAndUpdate(couponId, {
      $inc: { usageCount: -1 }
    }, { new: true });
  }
}

export default new CouponRepository();
