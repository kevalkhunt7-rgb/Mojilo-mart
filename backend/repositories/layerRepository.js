import BaseRepository from './baseRepository.js';
import Layer from '../models/Layer.js';

class LayerRepository extends BaseRepository {
  constructor() {
    super(Layer);
  }

  async findByCustomizationId(customizationId) {
    return await this.model.find({ customizationId }).sort({ zIndex: 1 });
  }

  async deleteByCustomizationId(customizationId) {
    return await this.model.deleteMany({ customizationId });
  }
}

export default new LayerRepository();
