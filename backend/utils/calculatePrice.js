/**
 * Calculate customized product pricing based on ink coverage area
 * @param {Number} basePrice - Product base price
 * @param {Number} variantAdjustment - Price adjustment based on size/color
 * @param {Array} layers - Array of layer objects containing bounding boxes (x, y, width, height, printAreaName)
 * @param {Number} quantity - Order quantity
 * @returns {Object} { itemBasePrice, customizationCostPerItem, pricePerItem, quantity, subTotal }
 */
export const calculateProductPrice = ({
  basePrice = 0,
  variantAdjustment = 0,
  layers = [],
  quantity = 1,
}) => {
  const itemBase = Number(basePrice) + Number(variantAdjustment);
  
  const PX_PER_INCH = 50;
  const RATE_PER_SQ_INCH = 1.00;      // ₹1.00 per sq inch
  const MINIMUM_VIEW_PRINT_COST = 30; // Minimum ₹30 charge per active print side

  let areaCost = 0;

  if (layers && layers.length > 0) {
    // Group layers by active print area (e.g. Front, Back)
    const layersByView = {};
    layers.forEach((layer) => {
      const view = layer.printAreaName || 'Front';
      if (!layersByView[view]) {
        layersByView[view] = [];
      }
      layersByView[view].push(layer);
    });

    // Compute bounding box and ink cost per view
    Object.values(layersByView).forEach((viewLayers) => {
      if (!viewLayers || viewLayers.length === 0) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      viewLayers.forEach((obj) => {
        const x = obj.x || 0;
        const y = obj.y || 0;
        const w = obj.width || 0;
        const h = obj.height || 0;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });

      if (minX !== Infinity) {
        const widthInches = Math.max(0, maxX - minX) / PX_PER_INCH;
        const heightInches = Math.max(0, maxY - minY) / PX_PER_INCH;
        const calculatedAreaCost = widthInches * heightInches * RATE_PER_SQ_INCH;

        // Apply ₹30 Minimum Rule for this view
        areaCost += Math.max(MINIMUM_VIEW_PRINT_COST, calculatedAreaCost);
      }
    });
  }

  const customizationCost = Math.round(areaCost * 100) / 100;
  const singleItemTotal = itemBase + customizationCost;
  const subTotal = Math.round(singleItemTotal * quantity * 100) / 100;

  return {
    itemBasePrice: itemBase,
    customizationCostPerItem: customizationCost,
    pricePerItem: Math.round(singleItemTotal * 100) / 100,
    quantity,
    subTotal,
  };
};