import sharp from 'sharp';
import AdmZip from 'adm-zip';
import Customization from '../models/Customization.js';
import Layer from '../models/Layer.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Asset from '../models/Asset.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';
import logger from '../utils/logger.js';

class PrintRenderService {
  /**
   * Helper to fetch file buffer from URL
   */
  async fetchImageBuffer(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      logger.error(`Error downloading image asset from URL ${url}:`, err);
      throw err;
    }
  }

  /**
   * Main print-ready file generation process
   */
  async generateProductionFiles(orderId) {
    logger.info(`Starting print file generation process for Order: ${orderId}`);
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Retrieve order items
    const items = await OrderItem.find({ order: orderId }).populate('customization');
    
    for (const item of items) {
      if (!item.customization) {
        logger.info(`OrderItem ${item._id} has no customization, skipping...`);
        continue;
      }

      const customizationId = item.customization._id;
      const customization = await Customization.findById(customizationId);
      const layers = await Layer.find({ customizationId }).populate('imageConfig.assetId');

      const printAreaFiles = {};
      const printAreaBuffers = {};

      // Process each configured print area (Front, Back, Sleeves, Neck Label)
      const areas = customization.printAreas && customization.printAreas.length > 0
        ? customization.printAreas
        : [{ areaName: 'Front' }]; // Default fallback

      for (const area of areas) {
        const areaName = area.areaName;
        logger.info(`Rendering printable area: ${areaName} for Item: ${item._id}`);

        const cleanArea = String(areaName || '').toLowerCase().replace(/[\s_-]/g, '');
        const areaLayers = layers.filter(l => {
          const cleanLayerArea = String(l.printAreaName || '').toLowerCase().replace(/[\s_-]/g, '');
          return cleanLayerArea === cleanArea ||
            (cleanArea.includes('left') && cleanLayerArea.includes('left')) ||
            (cleanArea.includes('right') && cleanLayerArea.includes('right'));
        });

        // Target print dims (4500x5400 at 300 DPI)
        const targetWidth = 4500;
        const targetHeight = 5400;
        
        // Assume default workspace sizing is 800x1000 pixels
        const workspaceWidth = 800;
        const scaleRatio = targetWidth / workspaceWidth;

        // Base transparent sharp canvas
        let canvas = sharp({
          create: {
            width: targetWidth,
            height: targetHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        });

        const compositeLayers = [];

        for (const layer of areaLayers) {
          try {
            let layerBuffer = null;

            if (layer.type === 'Text') {
              // Convert text to high-res SVG path vector to avoid pixelation
              const printFontSize = Math.round((layer.textConfig?.fontSize || 30) * scaleRatio);
              const textContent = layer.textConfig?.text || '';
              const fill = layer.textConfig?.fillColor || '#000000';
              const fontFamily = layer.textConfig?.fontFamily || 'sans-serif';

              // Text SVG block
              const svgText = `
                <svg width="${targetWidth}" height="${targetHeight}">
                  <style>
                    .txt {
                      font-family: "${fontFamily}";
                      font-size: ${printFontSize}px;
                      fill: ${fill};
                      text-anchor: middle;
                      dominant-baseline: middle;
                    }
                  </style>
                  <text x="50%" y="50%" class="txt">${textContent}</text>
                </svg>
              `;
              
              layerBuffer = Buffer.from(svgText);
            } else {
              // Clipart / Image uploads
              const imgUrl = layer.imageConfig?.processedUrl || layer.imageConfig?.originalUrl;
              if (!imgUrl) continue;
              layerBuffer = await this.fetchImageBuffer(imgUrl);
            }

            if (layerBuffer) {
              const printW = Math.round(layer.width * scaleRatio * (layer.scaleX || 1));
              const printH = Math.round(layer.height * scaleRatio * (layer.scaleY || 1));
              const printX = Math.round((layer.x) * scaleRatio);
              const printY = Math.round((layer.y) * scaleRatio);

              // Apply resize, rotation and opacity adjustments
              let layerImage = sharp(layerBuffer).resize(Math.max(1, printW), Math.max(1, printH));
              if (layer.rotation) {
                layerImage = layerImage.rotate(layer.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
              }

              const processedLayerBuffer = await layerImage.png().toBuffer();

              compositeLayers.push({
                input: processedLayerBuffer,
                left: Math.max(0, printX),
                top: Math.max(0, printY)
              });
            }
          } catch (layerErr) {
            logger.error(`Failed to process layer ${layer._id}:`, layerErr);
          }
        }

        // Composite all active layer overlays onto base transparent PNG
        if (compositeLayers.length > 0) {
          canvas = canvas.composite(compositeLayers);
        }

        // Set DPI density metadata to 300 DPI
        const areaBuffer = await canvas
          .png()
          .withMetadata({ density: 300 })
          .toBuffer();

        // Save buffer for ZIP aggregation
        printAreaBuffers[areaName.toLowerCase()] = areaBuffer;

        // Upload transparent file to Cloudinary prints folder
        const uploadResult = await uploadBufferToCloudinary(areaBuffer, `orders/order_${orderId}/prints`, {
          format: 'png',
          public_id: `${areaName.toLowerCase()}_print`
        });

        printAreaFiles[`${areaName.toLowerCase()}PrintUrl`] = uploadResult.secure_url;
      }

      // Update customization URLs
      await Customization.findByIdAndUpdate(customizationId, {
        productionFiles: {
          frontPrintUrl: printAreaFiles.frontPrintUrl || undefined,
          backPrintUrl: printAreaFiles.backPrintUrl || undefined,
          leftSleevePrintUrl: printAreaFiles.leftSleevePrintUrl || undefined,
          rightSleevePrintUrl: printAreaFiles.rightSleevePrintUrl || undefined,
          neckLabelPrintUrl: printAreaFiles.neckLabelPrintUrl || undefined
        }
      });

      // 4. Assemble ZIP Archive Pack
      logger.info(`Assembling ZIP archive package for Item: ${item._id}`);
      const zip = new AdmZip();

      // Add transparent PNGs to ZIP
      Object.keys(printAreaBuffers).forEach(areaKey => {
        zip.addFile(`${areaKey}-print.png`, printAreaBuffers[areaKey]);
      });

      // Add design metadata BSON JSON configuration
      zip.addFile('design.json', Buffer.from(JSON.stringify(customization.editableDesignJSON || {})));

      // Add user graphics raw files (if any)
      for (const layer of layers) {
        if (layer.type === 'Image' && layer.imageConfig?.assetId) {
          try {
            const assetObj = layer.imageConfig.assetId;
            const assetBuffer = await this.fetchImageBuffer(assetObj.originalUrl);
            zip.addFile(`assets/${assetObj.originalFileName || 'upload.png'}`, assetBuffer);
          } catch (err) {
            logger.error('Failed to include raw user asset in ZIP:', err);
          }
        }
      }

      const zipBuffer = zip.toBuffer();

      // Upload raw ZIP file to Cloudinary orders archive
      const zipUploadResult = await uploadBufferToCloudinary(zipBuffer, `orders/order_${orderId}/zips`, {
        resource_type: 'raw',
        format: 'zip',
        public_id: `item_${item._id}_assets`
      });

      // Set download links inside item records
      item.productionZipUrl = zipUploadResult.secure_url;
      await item.save();

      // Enqueue job in manufacturing queue automatically
      try {
        const manufacturingService = (await import('./manufacturingService.js')).default;
        await manufacturingService.queueManufacturingJob(orderId, item._id);
      } catch (err) {
        logger.error(`Failed to automatically enqueue manufacturing job for order ${orderId} item ${item._id}:`, err);
      }

      logger.info(`Successfully finished production print generation for OrderItem: ${item._id}`);
    }

    // Transition order state to 'Approved' artwork review once rendering finishes
    order.orderStatus = 'approved';
    order.statusHistory.push({
      status: 'approved',
      notes: 'High-resolution production files and ZIP packages rendered successfully.',
      updatedBy: 'system'
    });
    await order.save();

    logger.info(`Print generation pipeline finished successfully for Order: ${orderId}`);
  }
}

export default new PrintRenderService();
