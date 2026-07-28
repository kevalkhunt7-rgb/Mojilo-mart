import BaseRepository from './baseRepository.js';
import Setting from '../models/Setting.js';

class SettingRepository extends BaseRepository {
  constructor() {
    super(Setting);
  }

  async getSettings() {
    let settings = await Setting.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await Setting.create({});
    }
    return settings;
  }
}

export default new SettingRepository();
