/**
 * Decoupled Pricing Engine Service for Customized Products
 */

/**
 * Calculate the base price of the product variant
 * @param {number} basePrice
 * @param {number} variantAdjustment
 * @returns {number}
 */
export const getBaseProductPrice = (basePrice = 0, variantAdjustment = 0) => {
  return Number(basePrice) + Number(variantAdjustment);
};

/**
 * Calculate print area costs (Front, Back, Sleeves)
 * @param {string} areaName
 * @returns {number}
 */
export const getPrintAreaCost = (areaName) => {
  if (!areaName) return 0;
  const name = areaName.toLowerCase();
  if (name.includes('front')) return 150;
  if (name.includes('back')) return 150;
  if (name.includes('sleeve')) return 100;
  if (name.includes('neck')) return 50;
  return 100; // default print area cost
};

/**
 * Calculate upload image cost
 * @param {number} count
 * @returns {number}
 */
export const getUploadCost = (count = 0) => {
  return count * 50;
};

/**
 * Calculate clipart cost
 * @param {number} count
 * @returns {number}
 */
export const getClipartCost = (count = 0) => {
  return count * 30;
};

/**
 * Calculate premium font cost
 * @param {Array<string>} fonts
 * @returns {number}
 */
export const getPremiumFontCost = (fonts = []) => {
  const premiumFonts = ['creamy', 'impact', 'vintage']; // example premium fonts
  const premiumCount = fonts.filter(f => premiumFonts.includes(f.toLowerCase())).length;
  return premiumCount * 20;
};

/**
 * Calculate Tax (e.g. 18% standard GST)
 * @param {number} subTotal
 * @returns {number}
 */
export const getTax = (subTotal = 0) => {
  return Math.round(subTotal * 0.18 * 100) / 100;
};

/**
 * Calculate Shipping cost (e.g. free shipping above 1000)
 * @param {number} subTotal
 * @returns {number}
 */
export const getShipping = (subTotal = 0) => {
  if (subTotal === 0 || subTotal >= 1000) return 0;
  return 50;
};

/**
 * Calculate Discount
 * @param {number} subTotal
 * @param {number} discountRate
 * @returns {number}
 */
export const getDiscount = (subTotal = 0, discountRate = 0) => {
  return Math.round(subTotal * discountRate * 100) / 100;
};

/**
 * Calculate Grand Total
 * @param {object} params
 * @returns {number}
 */
export const getGrandTotal = ({
  subTotal = 0,
  tax = 0,
  shipping = 0,
  discount = 0
}) => {
  return Math.max(0, subTotal + tax + shipping - discount);
};

/**
 * Comprehensive pricing engine calculation
 * @param {object} customization
 * @param {object} variant
 * @param {number} quantity
 * @returns {object} pricing details
 */
export const calculatePrice = ({ customization, variant, quantity = 1 }) => {
  const prod = variant?.product;
  const effectiveProductPrice = (prod?.salePrice && Number(prod.salePrice) > 0)
    ? Number(prod.salePrice)
    : ((prod?.price && Number(prod.price) > 0)
        ? Number(prod.price)
        : Number(prod?.basePrice || 0));

  const basePrice = getBaseProductPrice(effectiveProductPrice, 0);
  
  let textCost = 0;
  let imageCost = 0;
  let aiCost = 0;
  let areaCost = 0;
  let activeViewsCount = 0;

  // ── Pricing rates ──────────────────────────────────────────────────────────
  const PX_PER_INCH = 50;
  const RATE_PER_SQ_INCH = 1.00;       // ₹1.00 per sq inch
  const MINIMUM_VIEW_PRINT_COST = 30;  // Minimum ₹30 charge per active view/side
  const costPerText = 0;               // Flat fee per text layer (set to 0 if covered by ink area)
  const costPerUpload = 0;             // Flat fee per upload (set to 0 if covered by ink area)
  const costPerAI = 0;                 // Surcharge for AI generated images if applicable
  const costPerExtraSide = 0;          // Extra charge for printing on multiple sides

  if (customization && customization.layers && customization.layers.length > 0) {
    // Group layers by view (e.g., Front, Back, Sleeve)
    const layersByView = {};
    customization.layers.forEach((layer) => {
      const view = layer.printAreaName || 'Front';
      if (!layersByView[view]) {
        layersByView[view] = [];
      }
      layersByView[view].push(layer);
    });

    Object.entries(layersByView).forEach(([viewKey, objects]) => {
      if (!objects || objects.length === 0) return;

      activeViewsCount++;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      objects.forEach((obj) => {
        // Classify layer types for extra flat fees if configured
        if (obj.type === 'Text') {
          textCost += costPerText;
        } else {
          const isAI = obj.isAIImage || (obj.imageConfig?.originalUrl && obj.imageConfig.originalUrl.includes('/ai/'));
          if (isAI) {
            aiCost += costPerAI;
          } else {
            imageCost += costPerUpload;
          }
        }

        // Extend bounding box calculation per side
        const x = obj.x || 0;
        const y = obj.y || 0;
        const w = obj.width || 0;
        const h = obj.height || 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });

      // Calculate total area cost for this side
      if (minX !== Infinity) {
        const widthInches  = Math.max(0, maxX - minX) / PX_PER_INCH;
        const heightInches = Math.max(0, maxY - minY) / PX_PER_INCH;
        const calculatedAreaCost = widthInches * heightInches * RATE_PER_SQ_INCH;
        
        // Enforce the ₹30 Minimum Rule per view
        areaCost += Math.max(MINIMUM_VIEW_PRINT_COST, calculatedAreaCost);
      }
    });
  }

  // Extra side cost logic
  const extraPrintAreaCost = activeViewsCount > 1 ? (activeViewsCount - 1) * costPerExtraSide : 0.0;

  const customizationCost = textCost + imageCost + aiCost + areaCost + extraPrintAreaCost;
  const singleItemTotal = basePrice + customizationCost;
  const subTotal = singleItemTotal * quantity;
  
  const tax = getTax(subTotal);
  const shipping = getShipping(subTotal);
  const discount = 0; // Default zero discount in cart calculation
  const grandTotal = getGrandTotal({ subTotal, tax, shipping, discount });

  return {
    basePrice,
    customizationCost,
    printAreaCost: Math.round(areaCost * 100) / 100,
    uploadCost: imageCost,
    clipartCost: 0,
    premiumFontCost: textCost,
    singleItemTotal: Math.round(singleItemTotal * 100) / 100,
    subTotal: Math.round(subTotal * 100) / 100,
    tax,
    shipping,
    discount,
    grandTotal: Math.round(grandTotal * 100) / 100
  };
};

export default {
  getBaseProductPrice,
  getPrintAreaCost,
  getUploadCost,
  getClipartCost,
  getPremiumFontCost,
  getTax,
  getShipping,
  getDiscount,
  getGrandTotal,
  calculatePrice
};