export const PX_PER_INCH = 50;
export const MIN_ELEMENT_PRICE = 30.00;
export const RATE_PER_SQ_INCH = 1.00;

/**
 * Calculates displayed physical dimensions in inches (50px = 1 inch, 1 decimal place precision).
 */
export const getDimensionsInInches = (widthPx, heightPx, scaleX = 1, scaleY = 1) => {
  const wPx = Math.abs((Number(widthPx) || 0) * (scaleX !== undefined ? Number(scaleX) : 1));
  const hPx = Math.abs((Number(heightPx) || 0) * (scaleY !== undefined ? Number(scaleY) : 1));

  const wInches = parseFloat((wPx / PX_PER_INCH).toFixed(1));
  const hInches = parseFloat((hPx / PX_PER_INCH).toFixed(1));

  return { wInches, hInches };
};

/**
 * Calculates price for a single design element based on rendered dimensions.
 * elementPrice = max(₹30, widthInInches × heightInInches × ₹1)
 */
export const calculateElementPrice = (widthPx, heightPx, scaleX = 1, scaleY = 1) => {
  const { wInches, hInches } = getDimensionsInInches(widthPx, heightPx, scaleX, scaleY);

  if (wInches <= 0 || hInches <= 0) return 0;

  const areaSqInches = parseFloat((wInches * hInches).toFixed(2));
  const rawPrice = areaSqInches * RATE_PER_SQ_INCH;

  const elementPrice = Math.max(MIN_ELEMENT_PRICE, rawPrice);
  return Math.round(elementPrice * 100) / 100;
};

/**
 * Calculates total customization price for an array of layer objects.
 * Evaluates each printable element independently.
 */
export const calculateCustomizationCost = (layers = []) => {
  if (!Array.isArray(layers) || layers.length === 0) return 0;

  let totalCost = 0;

  layers.forEach((obj) => {
    if (!obj) return;
    if (obj.visible === false) return;
    if (obj.isBackground || obj.isOverlay || obj.isHelper || obj.isGrid || obj.isPrintAreaBox) return;
    if (obj.id === "grid" || obj.id === "background" || obj.name === "grid") return;

    const width = obj.width || 0;
    const height = obj.height || 0;
    const scaleX = obj.scaleX !== undefined ? obj.scaleX : 1;
    const scaleY = obj.scaleY !== undefined ? obj.scaleY : 1;

    if (width <= 0 || height <= 0) return;

    const elementPrice = calculateElementPrice(width, height, scaleX, scaleY);
    totalCost += elementPrice;
  });

  return Math.round(totalCost * 100) / 100;
};

/**
 * Calculate customized product pricing based on per-element ink coverage area
 */
export const calculateProductPrice = ({
  basePrice = 0,
  variantAdjustment = 0,
  layers = [],
  quantity = 1,
}) => {
  const itemBase = Number(basePrice) + Number(variantAdjustment);
  const areaCost = calculateCustomizationCost(layers);

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