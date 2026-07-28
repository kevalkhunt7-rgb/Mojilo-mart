import userRepository from '../repositories/userRepository.js';
import addressRepository from '../repositories/addressRepository.js';
import orderRepository from '../repositories/orderRepository.js';
import Design from '../models/Design.js';
import Wishlist from '../models/Wishlist.js';
import ApiError from '../utils/ApiError.js';

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user;
  }

  async updateProfile(userId, updates) {
    // Prevent updating role/password directly here
    delete updates.role;
    delete updates.permissions;
    delete updates.password;

    const user = await userRepository.updateById(userId, updates);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user;
  }

  async getAddresses(userId) {
    return await addressRepository.findByUserId(userId);
  }

  async addAddress(userId, addressData) {
    if (addressData.isDefaultShipping) {
      await addressRepository.unsetDefaultShipping(userId);
    }
    if (addressData.isDefaultBilling) {
      await addressRepository.unsetDefaultBilling(userId);
    }

    return await addressRepository.create({
      user: userId,
      ...addressData
    });
  }

  async updateAddress(userId, addressId, addressData) {
    const address = await addressRepository.findById(addressId);
    if (!address || address.user.toString() !== userId.toString()) {
      throw new ApiError(404, 'Address not found');
    }

    if (addressData.isDefaultShipping) {
      await addressRepository.unsetDefaultShipping(userId);
    }
    if (addressData.isDefaultBilling) {
      await addressRepository.unsetDefaultBilling(userId);
    }

    return await addressRepository.updateById(addressId, addressData);
  }

  async deleteAddress(userId, addressId) {
    const address = await addressRepository.findById(addressId);
    if (!address || address.user.toString() !== userId.toString()) {
      throw new ApiError(404, 'Address not found');
    }
    await addressRepository.deleteById(addressId);
    return { message: 'Address removed successfully' };
  }

  async getOrderHistory(userId) {
    return await orderRepository.findByUserId(userId);
  }

  async getSavedDesigns(userId) {
    return await Design.find({ user: userId }).populate({
      path: 'customizations',
      populate: { path: 'printArea textLayers imageLayers' }
    });
  }
}

export default new UserService();
