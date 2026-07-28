import BaseRepository from './baseRepository.js';
import Asset from '../models/Asset.js';

class AssetRepository extends BaseRepository {
  constructor() {
    super(Asset);
  }
  
  async findByUserId(userId) {
    return await this.model.find({ userId }).sort({ createdAt: -1 });
  }
}

export default new AssetRepository();
