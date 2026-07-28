import BaseRepository from './baseRepository.js';
import Address from '../models/Address.js';

class AddressRepository extends BaseRepository {
  constructor() {
    super(Address);
  }

  async findByUserId(userId) {
    return await Address.find({ user: userId });
  }

  async unsetDefaultShipping(userId) {
    await Address.updateMany({ user: userId, isDefaultShipping: true }, { isDefaultShipping: false });
  }

  async unsetDefaultBilling(userId) {
    await Address.updateMany({ user: userId, isDefaultBilling: true }, { isDefaultBilling: false });
  }
}

export default new AddressRepository();
