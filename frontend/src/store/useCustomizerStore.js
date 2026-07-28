import { create } from "zustand";

const BASE_PRICES = {
  "half-sleeve": 299,
  "long-sleeve": 399,
  "oversized": 449,
  "hoodie": 699,
  "sports-jersey": 499,
};

export const useCustomizerStore = create((set, get) => ({
  // Product configuration states
  currentProduct: "half-sleeve",
  productColor: "#FFFFFF",
  productSize: "M",
  selectedView: "front",

  // UI preferences
  gridVisible: false,
  rulersVisible: false,
  canvasZoom: 1.0,
  isDarkMode: false,

  // Sports Jersey custom details
  jerseyPlayerName: "",
  jerseyPlayerNumber: "",
  jerseySponsorLogo: null,

  // Live apparel templates fetched from the admin panel API.
  // Keyed by product key, e.g. { 'half-sleeve': { basePrice, availableColors, sizes, ... } }
  // Null means not yet loaded (ProductSelector fetches on mount).
  apparelTemplates: null,

  // Live pricing details
  pricingDetails: {
    base: 299,
    text: 0.0,
    image: 0.0,
    ai: 0.0,
    area: 0.0,
    extra: 0.0,
    total: 299,
  },

  // Undo/Redo stacks
  // Stores snapshot structure: { front: [], back: [], left: [], right: [], pocket: [], hood: [] }
  undoStack: [
    { front: [], back: [], left: [], right: [], pocket: [], hood: [] }
  ],
  redoStack: [],

  // Setters
  setApparelTemplates: (templates) => set({ apparelTemplates: templates }),

  setCurrentProduct: (product) => {
    const state = get();
    // Prefer live admin price; fall back to hardcoded BASE_PRICES
    const liveTemplate = state.apparelTemplates?.[product];
    const basePrice = liveTemplate?.basePrice ?? BASE_PRICES[product] ?? 19.99;

    // ── Reset color: pick first color of the new product's palette ──────────
    // If the new product has a live color palette from the admin panel, use its
    // first color.  If current color happens to be in the new palette, keep it.
    // Fallback to #FFFFFF (always safe on any garment).
    const newColors = liveTemplate?.availableColors;
    let newColor = "#FFFFFF";
    if (newColors && newColors.length > 0) {
      // Keep existing color only if it exists in the new product's palette
      newColor = newColors.includes(state.productColor) ? state.productColor : newColors[0];
    }

    // ── Reset size: pick first enabled size of the new product ───────────────
    const newSizes = liveTemplate?.sizes?.filter((s) => s.enabled);
    const firstSize = newSizes?.[0]?.size ?? "M";
    // Keep current size only if it is valid for the new product
    const sizeIsValid = newSizes
      ? newSizes.some((s) => s.size === state.productSize)
      : true;
    const newSize = sizeIsValid ? state.productSize : firstSize;

    set((st) => {
      // Auto-adjust selected view if the new product doesn't support the current view
      let newView = st.selectedView;
      if (product === "sports-jersey") {
        if (!["front", "back", "left", "right"].includes(st.selectedView)) newView = "front";
      } else if (product === "hoodie") {
        if (!["front", "back", "pocket", "hood"].includes(st.selectedView)) newView = "front";
      } else {
        if (!["front", "back"].includes(st.selectedView)) newView = "front";
      }
      return {
        currentProduct: product,
        selectedView: newView,
        productColor: newColor,
        productSize: newSize,
        pricingDetails: {
          ...st.pricingDetails,
          base: basePrice,
          total: basePrice + st.pricingDetails.text + st.pricingDetails.image + st.pricingDetails.ai + st.pricingDetails.area + st.pricingDetails.extra,
        },
      };
    });
  },

  setProductColor: (color) => set({ productColor: color }),
  setProductSize: (size) => set({ productSize: size }),
  setSelectedView: (view) => set({ selectedView: view }),
  setGridVisible: (visible) => set({ gridVisible: visible }),
  setRulersVisible: (visible) => set({ rulersVisible: visible }),
  setCanvasZoom: (zoom) => set({ canvasZoom: zoom }),
  setIsDarkMode: (isDark) => set({ isDarkMode: isDark }),

  setJerseyPlayerName: (name) => set({ jerseyPlayerName: name }),
  setJerseyPlayerNumber: (number) => set({ jerseyPlayerNumber: number }),
  setJerseySponsorLogo: (logo) => set({ jerseySponsorLogo: logo }),

  // Pricing calculations
  recalculatePrice: (canvasesData) => {
    // canvasesData: { front: Array, back: Array, left: Array, right: Array, pocket: Array, hood: Array }
    const state = get();
    const liveTemplate = state.apparelTemplates?.[state.currentProduct];
    const basePrice = liveTemplate?.basePrice ?? BASE_PRICES[state.currentProduct] ?? 19.99;

    // ── Pricing rates ────────────────────────────────────────────────────────
    // 50 px = 1 physical inch (matches apparelConfig: 600px canvas / 12" = 50 px/in)
    const PX_PER_INCH         = 50;
    const RATE_PER_SQ_INCH    = 1.00;   // ₹1.00 per sq inch of ink coverage
    const MINIMUM_VIEW_COST   = 30.00;  // ₹30 minimum charge per active view/side

    // Per-layer flat fees — set to 0: ink coverage area already captures cost.
    // Uncomment and set non-zero if your business charges additional layer fees.
    const costPerText         = 0;
    const costPerUpload       = 0;
    const costPerAI           = 0;
    const costPerExtraSide    = 0;    // extra charge for each view beyond the first

    let textCost     = 0.0;
    let imageCost    = 0.0;
    let aiCost       = 0.0;
    let areaCost     = 0.0;
    let activeViewsCount = 0;

    Object.entries(canvasesData).forEach(([viewKey, objects]) => {
      if (!objects || objects.length === 0) return;

      activeViewsCount++;

      // ── FIX #2: Sum individual object areas (not a single bounding-box union)
      // A bounding-box union charges for empty space between objects placed far
      // apart (e.g. collar text + hem graphic). Summing each object's own area
      // charges only for actual ink coverage.
      let viewAreaPx = 0;

      objects.forEach((obj) => {
        // ── FIX #3: Per-layer flat fees are all 0; kept here for future config ─
        if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
          textCost += costPerText;
        } else if (obj.type === "image" || obj.type === "Image") {
          if (obj.isAIImage) {
            aiCost += costPerAI;
          } else {
            imageCost += costPerUpload;
          }
        }

        // Accumulate this object's individual pixel area (scale-aware)
        const scaleX = obj.scaleX || 1;
        const scaleY = obj.scaleY || 1;
        const w = (obj.width  || 0) * scaleX;
        const h = (obj.height || 0) * scaleY;
        viewAreaPx += w * h;
      });

      // Convert total pixel area to sq-inches, then to cost
      const sqInches = viewAreaPx / (PX_PER_INCH * PX_PER_INCH);
      const rawViewCost = sqInches * RATE_PER_SQ_INCH;

      // ── FIX #1: Enforce ₹30 minimum per active view ──────────────────────
      areaCost += Math.max(MINIMUM_VIEW_COST, rawViewCost);
    });

    // Extra side cost (if more than 1 view contains designs)
    const extraPrintAreaCost = activeViewsCount > 1 ? (activeViewsCount - 1) * costPerExtraSide : 0.0;

    const total = basePrice + textCost + imageCost + aiCost + areaCost + extraPrintAreaCost;

    set({
      pricingDetails: {
        base:  parseFloat(basePrice.toFixed(2)),
        text:  parseFloat(textCost.toFixed(2)),
        image: parseFloat(imageCost.toFixed(2)),
        ai:    parseFloat(aiCost.toFixed(2)),
        area:  parseFloat(areaCost.toFixed(2)),
        extra: parseFloat(extraPrintAreaCost.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      },
    });
  },


  // History stack triggers
  pushSnapshot: (snapshot) => {
    // snapshot: { front: [], back: [], left: [], right: [], pocket: [], hood: [] }
    set((state) => {
      // Avoid pushing duplicate snapshots
      const lastSnapshot = state.undoStack[state.undoStack.length - 1];
      if (lastSnapshot && JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)) {
        return {};
      }
      const newUndo = [...state.undoStack, JSON.parse(JSON.stringify(snapshot))];
      if (newUndo.length > 50) newUndo.shift();
      return {
        undoStack: newUndo,
        redoStack: [],
      };
    });
  },

  performUndo: (getCurrentSnapshot) => {
    const state = get();
    const current = getCurrentSnapshot ? getCurrentSnapshot() : null;
    
    let activeUndoStack = state.undoStack;
    if (current) {
      const last = activeUndoStack[activeUndoStack.length - 1];
      if (last && JSON.stringify(last) !== JSON.stringify(current)) {
        // If there's a pending change not yet pushed to the undoStack, push it first
        activeUndoStack = [...activeUndoStack, JSON.parse(JSON.stringify(current))];
      }
    }

    if (activeUndoStack.length <= 1) return null;

    const poppedState = activeUndoStack[activeUndoStack.length - 1];
    const newUndo = activeUndoStack.slice(0, -1);
    const targetSnapshot = newUndo[newUndo.length - 1];
    const newRedo = [...state.redoStack, poppedState];

    set({
      undoStack: newUndo,
      redoStack: newRedo,
    });

    return targetSnapshot;
  },

  performRedo: () => {
    const state = get();
    if (state.redoStack.length === 0) return null;

    const nextSnapshot = state.redoStack[state.redoStack.length - 1];
    const newRedo = state.redoStack.slice(0, -1);
    const newUndo = [...state.undoStack, JSON.parse(JSON.stringify(nextSnapshot))];

    set({
      undoStack: newUndo,
      redoStack: newRedo,
    });

    return nextSnapshot;
  },

  resetHistory: () => {
    set({
      undoStack: [
        { front: [], back: [], left: [], right: [], pocket: [], hood: [] }
      ],
      redoStack: [],
    });
  },
}));
