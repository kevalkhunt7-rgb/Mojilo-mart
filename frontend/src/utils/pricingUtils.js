/**
 * Pricing Utility for Customization Elements
 * Standardized pricing calculation across Customizer UI, Price Estimator, Cart, and Checkout.
 * 
 * Business Rule:
 * 1. Calculate actual element dimensions: widthInInches × heightInInches (rounded to 1 decimal place matching UI display)
 * 2. Apply element price formula: elementPrice = max(₹30, widthInInches × heightInInches × ₹1)
 * 3. The ₹30 minimum applies to EACH INDIVIDUAL DESIGN ELEMENT, NOT combined area.
 */

export const PX_PER_INCH = 50;
export const MIN_ELEMENT_PRICE = 30.00;
export const RATE_PER_SQ_INCH = 1.00;

/**
 * Calculates displayed physical dimensions in inches (50px = 1 inch, 1 decimal place precision).
 * Serves as the single source of truth for both display and pricing calculation.
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
 * Uses the exact displayed dimensions in inches so pricing and UI display are 100% consistent.
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
 * Calculates total customization price for an array of canvas objects or layers.
 * Evaluates each printable element independently.
 */
export const calculateCustomizationCost = (objects = []) => {
  if (!Array.isArray(objects) || objects.length === 0) return 0;

  let totalCost = 0;

  objects.forEach((obj) => {
    if (!obj) return;

    // Ignore non-printable, background, helper, or hidden objects
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
 * Extracts a detailed array of individual design elements with labels, dimensions, and prices
 * for display in the Price Estimation card.
 */
export const getElementBreakdown = (canvasesData = {}) => {
  const elements = [];

  Object.entries(canvasesData).forEach(([viewKey, objects]) => {
    if (!Array.isArray(objects) || objects.length === 0) return;

    objects.forEach((obj, idx) => {
      if (!obj || obj.visible === false) return;
      if (obj.isBackground || obj.isOverlay || obj.isHelper || obj.isGrid || obj.isPrintAreaBox) return;
      if (obj.id === "grid" || obj.id === "background" || obj.name === "grid") return;

      const width = obj.width || 0;
      const height = obj.height || 0;
      const scaleX = obj.scaleX !== undefined ? obj.scaleX : 1;
      const scaleY = obj.scaleY !== undefined ? obj.scaleY : 1;

      if (width <= 0 || height <= 0) return;

      const { wInches, hInches } = getDimensionsInInches(width, height, scaleX, scaleY);
      const price = calculateElementPrice(width, height, scaleX, scaleY);

      let label = "";
      if (obj.isRosterName || obj.isJerseyName) {
        const txt = obj.text ? `"${obj.text}"` : "Player Name";
        label = `Name (${txt})`;
      } else if (obj.isRosterNumber || obj.isJerseyNumber) {
        const txt = obj.text ? `"#${obj.text}"` : "Jersey Number";
        label = `Number (${txt})`;
      } else if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
        const rawTxt = (obj.text || "").trim();
        const shortTxt = rawTxt.length > 12 ? rawTxt.substring(0, 10) + "..." : rawTxt;
        label = rawTxt ? `Text ("${shortTxt}")` : "Text Element";
      } else if (obj.isAIImage) {
        label = "AI Graphic";
      } else if (obj.type === "image" || obj.type === "Image") {
        label = "Uploaded Graphic";
      } else {
        label = `${obj.type ? obj.type.charAt(0).toUpperCase() + obj.type.slice(1) : "Design"} Element`;
      }

      const viewLabel = viewKey ? viewKey.charAt(0).toUpperCase() + viewKey.slice(1) : "";

      elements.push({
        id: obj.id || `${viewKey}-${idx}`,
        label,
        view: viewLabel,
        dimensions: `${wInches}" × ${hInches}"`,
        price,
        type: obj.isAIImage ? "ai" : (obj.type === "image" || obj.type === "Image") ? "image" : "text",
      });
    });
  });

  return elements;
};
