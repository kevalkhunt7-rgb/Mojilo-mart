import Customization from '../models/Customization.js';
import Layer from '../models/Layer.js';
import Product from '../models/Product.js';
import PrintArea from '../models/PrintArea.js';
import ApiError from '../utils/ApiError.js';

class CustomizationService {
  /**
   * Returns true when the request is based on a frontend-only clothing template
   * (no DB Product document). All print areas are considered enabled for these.
   */
  static isFrontendTemplate(productId, baseTemplateId, clothingType) {
    return (!productId || productId === 'template') && !!(baseTemplateId || clothingType);
  }

  /**
   * Normalizes a raw frontend view key to the canonical areaName expected by the
   * Mongoose enum: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve', 'Neck Label'].
   *
   * The frontend canvasMap uses keys: front, back, left, right, pocket, hood.
   */
  static normalizeAreaName(raw) {
    const map = {
      front:       'Front',
      back:        'Back',
      left:        'Left Sleeve',
      'left sleeve': 'Left Sleeve',
      right:       'Right Sleeve',
      'right sleeve': 'Right Sleeve',
      pocket:      'Neck Label',   // closest equivalent; update if a 'Pocket' enum is added
      hood:        'Back',         // hood print maps to back area; adjust as needed
      'neck label':'Neck Label',
      necktag:     'Neck Label',
    };
    const key = (raw || '').toLowerCase().trim();
    return map[key] || raw; // fall back to original if no mapping found
  }

  /**
   * Validates that the requested print areas are allowed for the given product.
   * 
   * If the design is based on a frontend-only clothing template (no DB product),
   * validation is skipped and all print areas default to enabled = true.
   *
   * @param {String|null} productId  - MongoDB ObjectId of the product (may be null for templates)
   * @param {Array}       printAreasData - The print areas the user wants to use
   * @param {String}      [baseTemplateId] - Frontend template identifier (e.g. 'oversized-tshirt')
   * @param {String}      [clothingType]   - Clothing type string (e.g. 'Hoodie')
   */
  async validateCustomizationInput(productId, printAreasData, baseTemplateId, clothingType) {
    // ── Frontend-only template path ──────────────────────────────────────────
    // When the user is designing on a UI-only clothing template (not backed by a
    // DB Product document), skip the product lookup entirely and allow all areas.
    if (!productId || baseTemplateId || clothingType) {
      // If there is genuinely no product reference at all, ensure we have a
      // template identifier so this isn't just a missing productId bug.
      if (!productId && !baseTemplateId && !clothingType) {
        throw new ApiError(400, 'Either a productId or a baseTemplateId / clothingType is required to save a customization');
      }
      // All print areas are implicitly enabled for frontend templates.
      return;
    }

    // ── DB product path ──────────────────────────────────────────────────────
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const printableAreas = product.customizationSettings?.printableAreas;

    // Products flagged as fully customizable (from the Design Studio) allow all print areas.
    if (product.isCustomizable) return;

    // ── Detect "not configured" state ────────────────────────────────────────
    // The Product schema initialises printableAreas with default: false for every
    // key.  That means a product that was never configured in the admin panel still
    // has { front: false, back: false, sleeve: false }.  We must NOT treat that as
    // "all areas blocked" — it just means no restriction has been set up yet.
    //
    // Rule: if NO area is explicitly enabled (true), the admin hasn't configured
    // restrictions yet → allow everything (same behaviour as isCustomizable: true).
    if (!printableAreas) return;

    // For object format, check if at least one key is explicitly true.
    // If nothing is true the config is still at defaults → allow all.
    if (typeof printableAreas === 'object' && !Array.isArray(printableAreas)) {
      const hasAnyExplicitlyEnabled = Object.values(printableAreas).some(
        (v) => v === true || v === 'true'
      );
      if (!hasAnyExplicitlyEnabled) return; // no restrictions configured → allow all
    }

    // For array format, an empty array also means no restrictions.
    if (Array.isArray(printableAreas) && printableAreas.length === 0) return;

    // Validate each incoming print area against the product's allowed areas
    for (const area of printAreasData) {
      const areaName = area.areaName;
      const lowerAreaName = areaName.toLowerCase();
      let isAreaEnabled = true; // default: allow unless explicitly restricted

      // 1. If printableAreas is an Array (e.g., ["front", "back"])
      //    → area must be present in the list to be allowed
      if (Array.isArray(printableAreas)) {
        isAreaEnabled = printableAreas.some(
          (a) => a.toLowerCase() === lowerAreaName ||
                 (lowerAreaName.includes('sleeve') && a.toLowerCase() === 'sleeve')
        );
      }
      // 2. If printableAreas is an Object (e.g., { front: true, back: false })
      //    → only deny when the value is explicitly false. Missing key = allowed.
      else if (typeof printableAreas === 'object') {
        const keyValue = printableAreas[lowerAreaName] ?? printableAreas[areaName];

        if (keyValue === false || keyValue === 'false') {
          // Explicitly disabled
          isAreaEnabled = false;
        } else if (lowerAreaName.includes('sleeve')) {
          // Sleeve fallback: check generic 'sleeve' key; only deny if explicitly false
          const sleeveValue = printableAreas.sleeve;
          if (sleeveValue === false || sleeveValue === 'false') {
            isAreaEnabled = false;
          }
        }
        // Any other value (true, 'true', undefined / missing) → allowed
      }

      if (!isAreaEnabled) {
        throw new ApiError(400, `Print area ${areaName} is not enabled for this product`);
      }
    }
  }
  async saveLayers(customizationId, printAreasData) {
    // Delete existing layers
    await Layer.deleteMany({ customizationId });

    // Normalize a raw frontend layer type to the Layer schema enum value.
    // Frontend (Fabric.js) uses lowercase: 'image', 'text', 'clipart', etc.
    const normalizeLayerType = (raw) => {
      const typeMap = {
        image:   'Image',
        img:     'Image',
        text:    'Text',
        'i-text':'Text',
        textbox: 'Text',
        clipart: 'Clipart',
        svg:     'SVG',
        shape:   'Shape',
        rect:    'Shape',
        circle:  'Shape',
        triangle:'Shape',
        polygon: 'Shape',
        qrcode:  'QRCode',
        barcode: 'Barcode',
      };
      const key = (raw || '').toLowerCase().trim();
      return typeMap[key] || 'Image'; // default to Image if unknown
    };

    // Re-create layers
    const layersToInsert = [];
    for (const area of printAreasData) {
      if (area.layers && area.layers.length > 0) {
        area.layers.forEach((layer) => {
          const normalizedType = normalizeLayerType(layer.type);

          // Normalize textConfig: frontend uses Fabric.js property names
          let textConfig;
          if (layer.textConfig) {
            textConfig = {
              text:         layer.textConfig.text,
              fontFamily:   layer.textConfig.fontFamily,
              fontWeight:   layer.textConfig.fontWeight    || (layer.textConfig.bold ? 'bold' : undefined),
              fontStyle:    layer.textConfig.fontStyle     || (layer.textConfig.italic ? 'italic' : undefined),
              fontSize:     layer.textConfig.fontSize,
              letterSpacing:layer.textConfig.letterSpacing || layer.textConfig.charSpacing,
              lineHeight:   layer.textConfig.lineHeight,
              align:        layer.textConfig.align         || layer.textConfig.textAlign, // frontend sends textAlign
              fillColor:    layer.textConfig.fillColor     || layer.textConfig.fill,      // frontend sends fill
              strokeColor:  layer.textConfig.strokeColor   || layer.textConfig.stroke,
              strokeWidth:  layer.textConfig.strokeWidth,
            };
          }

          // Normalize imageConfig: frontend sends { src } from Fabric, schema stores { originalUrl }
          let imageConfig;
          if (layer.imageConfig) {
            imageConfig = {
              assetId:     layer.imageConfig.assetId     || undefined,
              originalUrl: layer.imageConfig.originalUrl || layer.imageConfig.src || undefined,
              processedUrl:layer.imageConfig.processedUrl|| undefined,
            };
          }

          layersToInsert.push({
            customizationId,
            printAreaName: area.areaName,           // already normalized by createCustomization
            layerId:       layer.id || layer.layerId,
            type:          normalizedType,
            zIndex:        layer.zIndex,
            x:             layer.x,
            y:             layer.y,
            width:         layer.width,
            height:        layer.height,
            scaleX:        layer.scaleX  || 1,
            scaleY:        layer.scaleY  || 1,
            rotation:      layer.rotation || 0,
            flipX:         layer.flipX   || false,
            flipY:         layer.flipY   || false,
            opacity:       layer.opacity  !== undefined ? layer.opacity  : 1.0,
            visible:       layer.visible  !== undefined ? layer.visible  : true,
            locked:        layer.locked   !== undefined ? layer.locked   : false,
            blendMode:     layer.blendMode || 'normal',
            ...(textConfig  && { textConfig }),
            ...(imageConfig && { imageConfig }),
          });
        });
      }
    }

    if (layersToInsert.length > 0) {
      await Layer.insertMany(layersToInsert);
    }
  }

  async createCustomization({
    productId,
    variantId,
    selectedColor,
    selectedSize,
    editableDesignJSON,
    previews,
    printAreas,
    userId,
    sessionId,
    baseTemplateId,   // frontend-only template identifier (e.g. 'oversized-tshirt')
    clothingType,     // clothing type string (e.g. 'Hoodie')
    isBulkRoster,
    roster,
  }) {
    const isFrontendTemplate = !productId && !!(baseTemplateId || clothingType);

    // Require either a DB product or a frontend template identifier
    if (!productId && !isFrontendTemplate) {
      throw new ApiError(400, 'Either a productId or a baseTemplateId / clothingType is required');
    }

    // Normalize areaName values from frontend raw keys ('front') → schema enum ('Front')
    const normalizedPrintAreas = (printAreas || []).map((pa) => ({
      ...pa,
      areaName: CustomizationService.normalizeAreaName(pa.areaName),
    }));

    // Validate printable areas — passes template identifiers so the validator
    // can skip the DB lookup for frontend-only templates.
    if (normalizedPrintAreas.length > 0) {
      await this.validateCustomizationInput(productId, normalizedPrintAreas, baseTemplateId, clothingType);
    }

    // Build the document payload.
    // For frontend templates, `product` (required in schema) is kept undefined so
    // Mongoose won't fail — we override the required constraint via `validateBeforeSave`.
    // Normalize previews object to support both 'left'/'right' and 'leftSleeve'/'rightSleeve'
    const normalizedPreviews = previews ? {
      ...previews,
      left: previews.left || previews.leftSleeve || null,
      right: previews.right || previews.rightSleeve || null,
      leftSleeve: previews.leftSleeve || previews.left || null,
      rightSleeve: previews.rightSleeve || previews.right || null,
    } : null;

    const frontImg = normalizedPreviews?.front || normalizedPreviews?.mockup || normalizedPreviews?.previewUrl || null;

    const docPayload = {
      user: userId || null,
      variantId,
      selectedColor,
      selectedSize,
      editableDesignJSON,
      previews: normalizedPreviews,
      decalUrl: frontImg,
      previewUrl: frontImg,
      printArea: printAreas?.[0]?.printAreaId || null,
      isBulkRoster: Boolean(isBulkRoster),
      ...(Array.isArray(roster) && { roster }),
      // Template metadata — stored for reference / future order flow
      ...(baseTemplateId && { baseTemplateId }),
      ...(clothingType   && { clothingType }),
    };

    if (productId) {
      // Real DB product — wire up both legacy and new fields
      docPayload.product   = productId;
      docPayload.productId = productId;
    }

    // Use `new + save({ validateBeforeSave: false })` so we can bypass the
    // `product: required: true` schema constraint for frontend-only templates.
    const customization = new Customization(docPayload);
    await customization.save({ validateBeforeSave: !isFrontendTemplate });

    // Save print areas references (use normalized names for DB — enum requires capitalized)
    if (normalizedPrintAreas.length > 0) {
      customization.printAreas = normalizedPrintAreas.map((pa) => ({
        areaName: pa.areaName,
        printAreaId: pa.printAreaId || null,
      }));
      await customization.save({ validateBeforeSave: !isFrontendTemplate });

      // Save layers (use normalized areas so printAreaName matches)
      await this.saveLayers(customization._id, normalizedPrintAreas);
    }

    return customization;
  }

  async updateCustomization(id, {
    editableDesignJSON,
    previews,
    printAreas,
    userId,
    sessionId,
    isBulkRoster,
    roster,
  }) {
    const customization = await Customization.findById(id);
    if (!customization) {
      throw new ApiError(404, 'Customization draft not found');
    }

    // Verify ownership if authenticated
    if (userId && customization.user && customization.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized to update this customization');
    }

    if (typeof isBulkRoster === 'boolean') customization.isBulkRoster = isBulkRoster;
    if (Array.isArray(roster)) customization.roster = roster;
    if (editableDesignJSON) customization.editableDesignJSON = editableDesignJSON;
    if (previews) {
      const normalizedPreviews = {
        ...previews,
        left: previews.left || previews.leftSleeve || null,
        right: previews.right || previews.rightSleeve || null,
        leftSleeve: previews.leftSleeve || previews.left || null,
        rightSleeve: previews.rightSleeve || previews.right || null,
      };
      customization.previews = normalizedPreviews;
      const frontImg = normalizedPreviews.front || normalizedPreviews.mockup || normalizedPreviews.previewUrl || customization.decalUrl || customization.previewUrl;
      customization.decalUrl = frontImg;
      customization.previewUrl = frontImg;
    }

    if (printAreas && printAreas.length > 0) {
      customization.printAreas = printAreas.map((pa) => ({
        areaName: pa.areaName,
        printAreaId: pa.printAreaId
      }));
      
      // Save layers
      await this.saveLayers(customization._id, printAreas);
    }

    await customization.save();
    return customization;
  }

  async getCustomizationDetails(id) {
    const customization = await Customization.findById(id)
      .populate('productId')
      .populate('variantId')
      .populate('printAreas.printAreaId');

    if (!customization) {
      throw new ApiError(404, 'Customization not found');
    }

    // Populate active layers
    const layers = await Layer.find({ customizationId: id }).sort({ zIndex: 1 });
    return {
      customization,
      layers
    };
  }

  async deleteCustomization(id, { userId }) {
    const customization = await Customization.findById(id);
    if (!customization) {
      throw new ApiError(404, 'Customization not found');
    }

    if (userId && customization.user && customization.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized to delete this customization');
    }

    await Layer.deleteMany({ customizationId: id });
    await customization.deleteOne();

    return { message: 'Customization draft deleted successfully' };
  }
}

export default new CustomizationService();
