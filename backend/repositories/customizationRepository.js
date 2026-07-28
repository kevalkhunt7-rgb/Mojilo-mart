import BaseRepository from './baseRepository.js';
import Customization from '../models/Customization.js';

class CustomizationRepository extends BaseRepository {
  constructor() {
    super(Customization);
  }

  async findWithLayers(customizationId) {
    return await Customization.findById(customizationId)
      .populate('textLayers')
      .populate('imageLayers')
      .populate('printArea')
      .populate('layers')
      .populate('assets');
  }
}

export default new CustomizationRepository();
