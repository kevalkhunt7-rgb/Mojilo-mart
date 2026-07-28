class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id, populate = '') {
    return await this.model.findById(id).populate(populate);
  }

  async findOne(filter, populate = '') {
    return await this.model.findOne(filter).populate(populate);
  }

  async find(filter = {}, populate = '', sort = {}, skip = 0, limit = 100) {
    return await this.model.find(filter)
      .populate(populate)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async updateById(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async updateMany(filter, data) {
    return await this.model.updateMany(filter, data);
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}

export default BaseRepository;
