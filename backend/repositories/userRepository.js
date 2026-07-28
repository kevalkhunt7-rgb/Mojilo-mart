import BaseRepository from './baseRepository.js';
import User from '../models/User.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, selectPassword = false) {
    if (selectPassword) {
      return await User.findOne({ email }).select('+password');
    }
    return await User.findOne({ email });
  }

  async findByEmailWithVerificationFields(email) {
    return await User.findOne({ email }).select('+verificationOtp +verificationOtpExpire');
  }

  async findByEmailWithResetFields(email) {
    return await User.findOne({ email }).select('+resetPasswordOtp +resetPasswordOtpExpire');
  }

  async verifyUserEmail(userId) {
    return await User.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      status: 'active',
      $unset: { verificationOtp: 1, verificationOtpExpire: 1 }
    }, { new: true });
  }
}

export default new UserRepository();
