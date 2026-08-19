import { create } from "zustand";
import { calculateCustomizationCost, getElementBreakdown } from "../utils/pricingUtils";

const BASE_PRICES = {
  "half-sleeve": 249,
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
  setApparelTemplates: (templates) => set((state) => {
    const activeTemplates = Object.values(templates).filter(Boolean);
    const currentTemplate = templates[state.currentProduct];
    const selectedTemplate = currentTemplate || activeTemplates[0];

    // A product may have been disabled in the admin panel while this page was open.
    const currentProduct = currentTemplate ? state.currentProduct : (selectedTemplate?.key || state.currentProduct);
    const colors = selectedTemplate?.availableColors || [];
    const enabledSizes = (selectedTemplate?.sizes || []).filter((size) => size.enabled);
    const productColor = colors.includes(state.productColor) ? state.productColor : (colors[0] || state.productColor);
    const productSize = enabledSizes.some((size) => size.size === state.productSize)
      ? state.productSize
      : (enabledSizes[0]?.size || state.productSize);
    const defaultBasePrice = selectedTemplate?.basePrice ?? BASE_PRICES[currentProduct] ?? state.pricingDetails.base;
    const selectedSizeObj = (selectedTemplate?.sizes || []).find((s) => s.size === productSize);
    const sizePrice = Number(selectedSizeObj?.priceAddon || 0);
    const effectiveBasePrice = sizePrice > 0 ? sizePrice : defaultBasePrice;

    return {
      apparelTemplates: templates,
      currentProduct,
      productColor,
      productSize,
      pricingDetails: {
        ...state.pricingDetails,
        base: parseFloat(effectiveBasePrice.toFixed(2)),
        total: parseFloat((effectiveBasePrice + state.pricingDetails.text + state.pricingDetails.image + state.pricingDetails.ai + state.pricingDetails.area + state.pricingDetails.extra).toFixed(2)),
      },
    };
  }),

  setCurrentProduct: (product) => {
    const state = get();
    // Prefer live admin price; fall back to hardcoded BASE_PRICES
    const liveTemplate = state.apparelTemplates?.[product];
    const defaultBasePrice = liveTemplate?.basePrice ?? BASE_PRICES[product] ?? 249;

    // ── Reset color: pick first color of the new product's palette ──────────
    const newColors = liveTemplate?.availableColors;
    let newColor = "#FFFFFF";
    if (newColors && newColors.length > 0) {
      newColor = newColors.includes(state.productColor) ? state.productColor : newColors[0];
    }

    // ── Reset size: pick first enabled size of the new product ───────────────
    const newSizes = liveTemplate?.sizes?.filter((s) => s.enabled);
    const firstSize = newSizes?.[0]?.size ?? "M";
    const sizeIsValid = newSizes
      ? newSizes.some((s) => s.size === state.productSize)
      : true;
    const newSize = sizeIsValid ? state.productSize : firstSize;

    const selectedSizeObj = liveTemplate?.sizes?.find((s) => s.size === newSize);
    const sizePrice = Number(selectedSizeObj?.priceAddon || 0);
    const effectiveBasePrice = sizePrice > 0 ? sizePrice : defaultBasePrice;

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
          base: parseFloat(effectiveBasePrice.toFixed(2)),
          total: parseFloat((effectiveBasePrice + st.pricingDetails.text + st.pricingDetails.image + st.pricingDetails.ai + st.pricingDetails.area + st.pricingDetails.extra).toFixed(2)),
        },
      };
    });
  },

  setProductColor: (color) => set({ productColor: color }),
  setProductSize: (size) => set((state) => {
    const liveTemplate = state.apparelTemplates?.[state.currentProduct];
    const defaultBasePrice = liveTemplate?.basePrice ?? BASE_PRICES[state.currentProduct] ?? 249;
    const sizeObj = liveTemplate?.sizes?.find((s) => s.size === size);
    const sizePrice = Number(sizeObj?.priceAddon || 0);
    const effectiveBasePrice = sizePrice > 0 ? sizePrice : defaultBasePrice;

    const textCost = state.pricingDetails.text || 0;
    const imageCost = state.pricingDetails.image || 0;
    const aiCost = state.pricingDetails.ai || 0;
    const areaCost = state.pricingDetails.area || 0;
    const extraCost = state.pricingDetails.extra || 0;
    const total = effectiveBasePrice + textCost + imageCost + aiCost + areaCost + extraCost;

    return {
      productSize: size,
      pricingDetails: {
        ...state.pricingDetails,
        base: parseFloat(effectiveBasePrice.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      },
    };
  }),
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
    const defaultBasePrice = liveTemplate?.basePrice ?? BASE_PRICES[state.currentProduct] ?? 249;
    const selectedSizeObj = liveTemplate?.sizes?.find((s) => s.size === state.productSize);
    const sizePrice = Number(selectedSizeObj?.priceAddon || 0);
    const effectiveBasePrice = sizePrice > 0 ? sizePrice : defaultBasePrice;

    const costPerText      = 0;
    const costPerUpload    = 0;
    const costPerAI        = 0;
    const costPerExtraSide = 0;

    let textCost     = 0.0;
    let imageCost    = 0.0;
    let aiCost       = 0.0;
    let areaCost     = 0.0;
    let activeViewsCount = 0;

    Object.entries(canvasesData).forEach(([viewKey, objects]) => {
      if (!objects || objects.length === 0) return;

      // Filter out printable elements for view count check
      const printableObjects = objects.filter((obj) => {
        if (!obj || obj.visible === false) return false;
        if (obj.isBackground || obj.isOverlay || obj.isHelper || obj.isGrid || obj.isPrintAreaBox) return false;
        if (obj.id === "grid" || obj.id === "background" || obj.name === "grid") return false;
        return (obj.width || 0) > 0 && (obj.height || 0) > 0;
      });

      if (printableObjects.length === 0) return;

      activeViewsCount++;

      printableObjects.forEach((obj) => {
        if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
          textCost += costPerText;
        } else if (obj.type === "image" || obj.type === "Image") {
          if (obj.isAIImage) {
            aiCost += costPerAI;
          } else {
            imageCost += costPerUpload;
          }
        }
      });

      // Calculate ink area price PER INDIVIDUAL DESIGN ELEMENT
      const viewDesignCost = calculateCustomizationCost(printableObjects);
      areaCost += viewDesignCost;
    });

    const extraPrintAreaCost = activeViewsCount > 1 ? (activeViewsCount - 1) * costPerExtraSide : 0.0;
    const total = effectiveBasePrice + textCost + imageCost + aiCost + areaCost + extraPrintAreaCost;

    const elementList = getElementBreakdown(canvasesData);

    set({
      pricingDetails: {
        base:     parseFloat(effectiveBasePrice.toFixed(2)),
        text:     parseFloat(textCost.toFixed(2)),
        image:    parseFloat(imageCost.toFixed(2)),
        ai:       parseFloat(aiCost.toFixed(2)),
        area:     parseFloat(areaCost.toFixed(2)),
        extra:    parseFloat(extraPrintAreaCost.toFixed(2)),
        total:    parseFloat(total.toFixed(2)),
        elements: elementList,
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
