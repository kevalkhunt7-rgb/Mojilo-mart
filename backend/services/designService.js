import mongoose from 'mongoose';
import Design from '../models/Design.js';
import Customization from '../models/Customization.js';
import TextLayer from '../models/TextLayer.js';
import ImageLayer from '../models/ImageLayer.js';
import PrintArea from '../models/PrintArea.js';
import Layout from '../models/Layout.js';
import DesignHistory from '../models/DesignHistory.js';
import ApiError from '../utils/ApiError.js';

class DesignService {
  async getPrintAreasByProduct(productId) {
    if (!productId || productId === 'undefined' || productId === 'null' || productId === 'default' || !mongoose.Types.ObjectId.isValid(productId)) {
      return await PrintArea.find({ $or: [{ product: null }, { product: { $exists: false } }] });
    }
    return await PrintArea.find({ product: productId });
  }

  async createPrintArea(printAreaData) {
    const data = { ...printAreaData };
    if (!data.product || data.product === 'undefined' || data.product === 'null' || data.product === 'default' || !mongoose.Types.ObjectId.isValid(data.product)) {
      data.product = null;
    }
    return await PrintArea.create(data);
  }

  async saveUserDesign(userId, { name, productId, customizations, previewImage }) {
    const validProductId = (productId && productId !== 'undefined' && productId !== 'null' && productId !== 'default' && mongoose.Types.ObjectId.isValid(productId)) ? productId : null;
    const customizationIds = [];

    for (const cust of customizations) {
      const customization = await Customization.create({
        user: userId,
        product: validProductId,
        printArea: cust.printAreaId,
        backgroundColor: cust.backgroundColor || '#ffffff',
      });

      // Save Text Layers
      if (cust.textLayers && cust.textLayers.length > 0) {
        const textLayers = cust.textLayers.map(l => ({ ...l, customization: customization._id }));
        await TextLayer.insertMany(textLayers);
      }

      // Save Image Layers
      if (cust.imageLayers && cust.imageLayers.length > 0) {
        const imageLayers = cust.imageLayers.map(l => ({ ...l, customization: customization._id }));
        await ImageLayer.insertMany(imageLayers);
      }

      customizationIds.push(customization._id);
    }

    const design = await Design.create({
      user: userId,
      product: validProductId,
      name,
      customizations: customizationIds,
      previewImage: previewImage || undefined
    });

    // Save snapshot in history
    await DesignHistory.create({
      design: design._id,
      user: userId,
      snapshot: JSON.stringify(customizations),
      changeSummary: 'Initial design creation'
    });

    return design;
  }

  async getDesignDetails(designId) {
    const design = await Design.findById(designId).populate({
      path: 'customizations',
      populate: { path: 'printArea textLayers imageLayers' }
    });

    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    return design;
  }

  async updateDesign(user, designId, { name, customizations, previewImage }) {
    const design = await Design.findById(designId);
    if (!design) {
      throw new ApiError(404, 'Design not found');
    }

    if (design.user.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new ApiError(403, 'Unauthorized to update this design');
    }

    if (name) {
      design.name = name;
    }

    if (previewImage) {
      design.previewImage = previewImage;
    }

    await design.save();

    if (customizations) {
      // Clear old customizations
      for (const custId of design.customizations) {
        await TextLayer.deleteMany({ customization: custId });
        await ImageLayer.deleteMany({ customization: custId });
        await Customization.findByIdAndDelete(custId);
      }

      const customizationIds = [];
      for (const cust of customizations) {
        const customization = await Customization.create({
          user: user._id,
          product: design.product,
          printArea: cust.printAreaId,
          backgroundColor: cust.backgroundColor || '#ffffff',
        });

        if (cust.textLayers && cust.textLayers.length > 0) {
          const textLayers = cust.textLayers.map(l => ({ ...l, customization: customization._id }));
          await TextLayer.insertMany(textLayers);
        }

        if (cust.imageLayers && cust.imageLayers.length > 0) {
          const imageLayers = cust.imageLayers.map(l => ({ ...l, customization: customization._id }));
          await ImageLayer.insertMany(imageLayers);
        }
        customizationIds.push(customization._id);
      }

      design.customizations = customizationIds;
      await design.save();

      // Log changes in history
      await DesignHistory.create({
        design: design._id,
        user: user._id,
        snapshot: JSON.stringify(customizations),
        changeSummary: 'Updated design layout and layers'
      });
    }

    return design;
  }
}

export default new DesignService();
