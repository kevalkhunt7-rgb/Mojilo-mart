import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from 'react-hot-toast';
import * as fabric from "fabric";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layers,
  Sparkles,
  Undo2,
  Redo2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid ,
  Shirt,
  Palette,
  Maximize2,
  QrCode,
  Type,
  ImagePlus,
  Wrench,
  Boxes,
  PencilRuler,
  Wand2,
  Grid3x3,
  Ruler,
  Box,
  Calculator,
  X,
  Users,
  UserPlus,
  Trash2,
  Plus,
  Eye,
  Move,
  LogIn,
  ShieldAlert,
  Sliders
} from "lucide-react";

// Components
import ThreeDViewer from "../components/ThreeDViewer";
import CanvasEditor, { withGuidesHidden } from "../components/CanvasEditor";
import PriceCalculator from "../components/PriceCalculator";
import ObjectInspector from "../components/ObjectInspector";
import AIImageGenerator from "../components/AIImageGenerator";
import ProductSelector from "../components/ProductSelector";
import QrCodeGenerator from "../components/QrCodeGenerator";
import TypographyPanel from "../components/TypographyPanel";
import StickersPanel from "../components/StickersPanel";
import ShapesPanel from "../components/ShapesPanel";
import ImageUploadPanel from "../components/ImageUploadPanel";
import BackgroundRemovalPanel from "../components/BackgroundRemovalPanel";
import { AddToCartLoader } from "../components/AddtoCartLoader";

// Store & Context
import { useCanvas } from "../context/CanvasContext";
import { useCanvasTextureSync } from "../hooks/useCanvasTextureSync";
import { useCustomizerStore } from "../store/useCustomizerStore";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apparelConfig } from "../utils/apparelConfig";
import { recalculateTextCurve } from "../utils/textCurveHelper";
import api from "../lib/axios";

// ------------------------------------------------------------------
// useIsMobile: tracks the same breakpoint as Tailwind's `lg` (1024px).
// Debounced with rAF so resize/orientation-change doesn't cause a
// re-render storm, which itself is a common source of mobile jank.
// ------------------------------------------------------------------
function useIsMobile(breakpointPx = 1024) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpointPx
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    let raf = null;

    const handleChange = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIsMobile(mql.matches));
    };

    handleChange();
    mql.addEventListener("change", handleChange);
    return () => {
      mql.removeEventListener("change", handleChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [breakpointPx]);

  return isMobile;
}

// Small, cheap placeholder shown instead of the heavy canvases while
// they're not the active mobile view — keeps layout stable without
// paying render cost.
function PanelSkeleton({ label, loading3D }) {
  if (loading3D) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Background shimmer sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(139,92,246,0.15) 50%, transparent 60%)",
              animation: "skeletonShimmer 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Pulsing ring stack */}
        <div className="relative flex items-center justify-center mb-6">
          <div
            className="absolute rounded-full border-2 border-violet-400/20"
            style={{ width: 110, height: 110, animation: "pingRing 2s ease-out infinite" }}
          />
          <div
            className="absolute rounded-full border-2 border-violet-400/30"
            style={{ width: 80, height: 80, animation: "pingRing 2s ease-out 0.5s infinite" }}
          />
          {/* Spinning arc */}
          <div
            className="absolute rounded-full"
            style={{
              width: 64,
              height: 64,
              border: "3px solid transparent",
              borderTopColor: "#7c3aed",
              borderRightColor: "#a78bfa",
              animation: "spinArc 1s linear infinite",
            }}
          />
          {/* 3D box icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
            style={{ animation: "floatBox 3s ease-in-out infinite" }}
          >
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 tracking-wide">
          Loading 3D Model
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Preparing your garment…
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-400"
              style={{ animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>

        {/* Inline keyframes */}
        <style>{`
          @keyframes skeletonShimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes pingRing {
            0%   { transform: scale(0.8); opacity: 0.7; }
            80%  { transform: scale(1.2); opacity: 0; }
            100% { transform: scale(1.2); opacity: 0; }
          }
          @keyframes spinArc {
            to { transform: rotate(360deg); }
          }
          @keyframes floatBox {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50%       { transform: translateY(-6px) rotate(3deg); }
          }
          @keyframes bounceDot {
            0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
            40%            { transform: scale(1.3); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs font-semibold uppercase tracking-widest">
      {label}
    </div>
  );
}

// The 8 available tool tabs, shared between the desktop vertical strip
// and the mobile bottom-sheet strip.
const TOOL_TABS = [
  { id: "apparel", label: "Apparel", icon: <Shirt className="h-5 w-5" /> },
  { id: "upload", label: "Upload Image", icon: <ImagePlus className="h-5 w-5" /> },
  { id: "text", label: "Text", icon: <Type className="h-5 w-5" /> },
  { id: "graphics", label: "Stickers", icon: <LayoutGrid  className="h-5 w-5" /> },
  // { id: "shapes", label: "Shapes", icon: <Layers className="h-5 w-5" /> },
  { id: "ai", label: "AI Generator", icon: <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" /> },
  { id: "qr", label: "QR Code", icon: <QrCode  className="h-5 w-5" /> },
  { id: "bg-remover", label: "BG Remover", icon: <Wand2 className="h-5 w-5 " /> },
];

// Bottom nav shortcuts shown on mobile (matches the reference design):
// View toggle + the four most-used tool tabs. The rest remain reachable
// from the full tab strip inside the bottom sheet itself.
const MOBILE_QUICK_TABS = ["apparel", "text", "upload", "graphics"];

export default function CoustomProductTshirt() {
  const { apparelId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Zustand Store mappings
  const currentProduct = useCustomizerStore((state) => state.currentProduct);
  const setCurrentProduct = useCustomizerStore((state) => state.setCurrentProduct);
  const productColor = useCustomizerStore((state) => state.productColor);
  const setProductColor = useCustomizerStore((state) => state.setProductColor);
  const productSize = useCustomizerStore((state) => state.productSize);
  const setProductSize = useCustomizerStore((state) => state.setProductSize);
  const selectedView = useCustomizerStore((state) => state.selectedView);
  const setSelectedView = useCustomizerStore((state) => state.setSelectedView);
  const isDarkMode = useCustomizerStore((state) => state.isDarkMode);
  const setIsDarkMode = useCustomizerStore((state) => state.setIsDarkMode);
  // Live templates from admin panel (keyed by product key)
  const apparelTemplates = useCustomizerStore((state) => state.apparelTemplates);

  const performUndo = useCustomizerStore((state) => state.performUndo);
  const performRedo = useCustomizerStore((state) => state.performRedo);

  // Sports Jersey inputs
  const jerseyPlayerName = useCustomizerStore((state) => state.jerseyPlayerName);
  const setJerseyPlayerName = useCustomizerStore((state) => state.setJerseyPlayerName);
  const jerseyPlayerNumber = useCustomizerStore((state) => state.jerseyPlayerNumber);
  const setJerseyPlayerNumber = useCustomizerStore((state) => state.setJerseyPlayerNumber);

  // Bulk Roster / Teamwear State
  const [isBulkRoster, setIsBulkRoster] = useState(false);
  const [rosterPlacementSide, setRosterPlacementSide] = useState("back"); // "back" | "front" | "both"
  const [activePreviewIndex, setActivePreviewIndex] = useState(null);
  const [roster, setRoster] = useState([
    { playerName: "", playerNumber: "", size: "M" }
  ]);

  const handleAddRosterRow = () => {
    setRoster((prev) => [
      ...prev,
      { playerName: "", playerNumber: "", size: productSize || "M" }
    ]);
  };

  const handleRemoveRosterRow = (index) => {
    setRoster((prev) => prev.filter((_, i) => i !== index));
    if (activePreviewIndex === index) {
      setActivePreviewIndex(null);
    }
  };


  // ─── Helpers: find or create the roster Name / Number fabric objects ─────────
  const getRosterObjects = (cv) => {
    if (!cv || typeof cv.getObjects !== "function") return { nameObj: null, numObj: null };
    const all = cv.getObjects();
    return {
      nameObj: all.find((o) => o.isRosterName === true) || null,
      numObj: all.find((o) => o.isRosterNumber === true) || null,
    };
  };

  const clearRosterObjectsFromCanvas = (cv, view) => {
    if (!cv || typeof cv.getObjects !== "function") return;
    const all = cv.getObjects();
    const rosterObjs = all.filter((o) => o.isRosterName === true || o.isRosterNumber === true);
    rosterObjs.forEach((o) => cv.remove(o));
    if (rosterObjs.length > 0) {
      cv.renderAll();
      cv.fire("object:modified");
      if (view) manualTriggerSync?.(view);
    }
  };

  const ensureRosterObjectsForCanvas = (cv, nameVal, numVal, view = "back") => {
    if (!cv || typeof cv.getObjects !== "function") return { nameObj: null, numObj: null };
    let { nameObj, numObj } = getRosterObjects(cv);
    const cx = cv.width ? cv.width / 2 : 150;
    const cy = cv.height ? cv.height / 2 : 200;

    const trimmedName = (nameVal || "").trim().toUpperCase();
    const trimmedNum = (numVal || "").trim();

    // ── Handle Name Object (Optional field: if blank, remove/don't display) ──
    if (trimmedName) {
      if (!nameObj) {
        nameObj = new fabric.IText(trimmedName, {
          left: cx,
          top: trimmedNum ? cy - 45 : cy,
          originX: "center",
          originY: "center",
          fontFamily: "Impact",
          fontSize: 28,
          fill: "#000000",
          isRosterName: true,
        });
        cv.add(nameObj);
      } else {
        nameObj.set("text", trimmedName);
      }
      recalculateTextCurve(nameObj);
    } else if (nameObj) {
      cv.remove(nameObj);
      nameObj = null;
    }

    // ── Handle Number Object (Optional field: if blank, remove/don't display) ──
    if (trimmedNum) {
      if (!numObj) {
        numObj = new fabric.IText(trimmedNum, {
          left: cx,
          top: trimmedName ? cy + 45 : cy,
          originX: "center",
          originY: "center",
          fontFamily: "Impact",
          fontSize: 54,
          fill: "#000000",
          isRosterNumber: true,
        });
        cv.add(numObj);
      } else {
        numObj.set("text", trimmedNum);
      }
      recalculateTextCurve(numObj);
    } else if (numObj) {
      cv.remove(numObj);
      numObj = null;
    }

    cv.renderAll();
    cv.fire("object:modified");
    manualTriggerSync?.(view);
    return { nameObj, numObj };
  };

  const syncRosterToCanvases = (player, side = rosterPlacementSide) => {
    if (!player) return;
    const backName = (player.playerName || "").trim();
    const backNum = (player.playerNumber || "").trim();

    // Independent Front vs Back fields support
    const frontName = (player.frontPlayerName !== undefined && player.frontPlayerName !== null && player.frontPlayerName !== "")
      ? player.frontPlayerName.trim()
      : backName;
    const frontNum = (player.frontPlayerNumber !== undefined && player.frontPlayerNumber !== null && player.frontPlayerNumber !== "")
      ? player.frontPlayerNumber.trim()
      : backNum;

    if (side === "back") {
      clearRosterObjectsFromCanvas(frontCanvas, "front");
      if (backCanvas) {
        ensureRosterObjectsForCanvas(backCanvas, backName, backNum, "back");
      }
    } else if (side === "front") {
      clearRosterObjectsFromCanvas(backCanvas, "back");
      if (frontCanvas) {
        ensureRosterObjectsForCanvas(frontCanvas, frontName, frontNum, "front");
      }
    } else if (side === "both") {
      if (frontCanvas) ensureRosterObjectsForCanvas(frontCanvas, frontName, frontNum, "front");
      if (backCanvas) ensureRosterObjectsForCanvas(backCanvas, backName, backNum, "back");
    }
  };

  const handleSetRosterSide = (side) => {
    setRosterPlacementSide(side);
    if (side === "front") setSelectedView("front");
    if (side === "back") setSelectedView("back");

    const activeIndex = activePreviewIndex !== null ? activePreviewIndex : 0;
    const activePlayer = roster[activeIndex];
    if (activePlayer) {
      syncRosterToCanvases(activePlayer, side);
    }
  };

  const handlePreviewPlayer = (index) => {
    setActivePreviewIndex(index);
    const player = roster[index];
    if (!player) return;

    const backName = (player.playerName || "").trim();
    const backNum = (player.playerNumber || "").trim();
    const frontName = (player.frontPlayerName !== undefined && player.frontPlayerName !== null && player.frontPlayerName !== "")
      ? player.frontPlayerName.trim()
      : backName;
    const frontNum = (player.frontPlayerNumber !== undefined && player.frontPlayerNumber !== null && player.frontPlayerNumber !== "")
      ? player.frontPlayerNumber.trim()
      : backNum;
    const sizeVal = player.size || productSize || "M";

    // Update 3D model store state
    setJerseyPlayerName(backName || frontName || "");
    setJerseyPlayerNumber(backNum || frontNum || "");
    setProductSize(sizeVal);
    if (rosterPlacementSide !== "both") {
      setSelectedView(rosterPlacementSide);
    }

    // Sync to front, back or both canvases according to selected placement side
    syncRosterToCanvases(player, rosterPlacementSide);

    const displayName = (rosterPlacementSide === "front" ? frontName : backName) || "Player";
    const displayNum = (rosterPlacementSide === "front" ? frontNum : backNum) || "";
    toast.success(`Previewing Player #${index + 1}: ${displayName} ${displayNum ? "#" + displayNum : ""}`);
  };

  const handleUpdateRosterRow = (index, field, value) => {
    setRoster((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );

    // Live-sync to canvas & 3D only when this row is actively previewed
    if (activePreviewIndex === index) {
      const updatedPlayer = { ...roster[index], [field]: value };
      const activeName = (updatedPlayer.playerName || updatedPlayer.frontPlayerName || "").trim().toUpperCase();
      const activeNum = (updatedPlayer.playerNumber || updatedPlayer.frontPlayerNumber || "").trim();

      setJerseyPlayerName(activeName);
      setJerseyPlayerNumber(activeNum);
      if (field === "size") setProductSize(value);

      syncRosterToCanvases(updatedPlayer, rosterPlacementSide);
    }
  };


  // Active tool tab (shared between desktop sidebar and mobile sheet)
  const [activeTab, setActiveTab] = useState("apparel");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartLoaderState, setCartLoaderState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
  });
  const [dbProduct, setDbProduct] = useState(null);
  const { addCustomTemplateToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // ------------------------------------------------------------------
  // Mobile view state
  // ------------------------------------------------------------------
  // Which heavy view fills the main area on mobile: 2D editor (default,
  // matches the reference screenshot) or the 3D preview. Toggled by the
  // "View 3D" / "View 2D" button in the bottom nav.
  const [mobileMainView, setMobileMainView] = useState("editor"); // "editor" | "preview"
  // Whether the tools bottom-sheet (Apparel/Text/Upload/Stickers/etc.) is
  // expanded over the main view. Tapping a tool tab opens it; tapping the
  // same tab again, or the chevron handle, collapses it.
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  // Grid / Rulers toggles for the 2D editor toolbar (mobile + desktop).
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  // Mobile "View Costing" popup — keeps the price breakdown out of the
  // way so the garment view has full screen real estate by default.
  const [showCostingModal, setShowCostingModal] = useState(false);
  const [showObjectInspectorModal, setShowObjectInspectorModal] = useState(false);

  const handleMobileToggleView = () => {
    setMobileMainView((v) => (v === "editor" ? "preview" : "editor"));
    setMobileSheetOpen(false);
  };

  const handleMobileTabTap = (tabId) => {
    if (mobileSheetOpen && activeTab === tabId) {
      // Tapping the already-open tab again collapses the sheet.
      setMobileSheetOpen(false);
    } else {
      setActiveTab(tabId);
      setMobileSheetOpen(true);
      // Opening a tool implies working on the flat 2D artwork.
      setMobileMainView("editor");
    }
  };

  // Canvas context elements
  const {
    frontCanvas,
    backCanvas,
    leftCanvas,
    rightCanvas,
    pocketCanvas,
    hoodCanvas,
    activeCanvas,
    canvasLayers,
    setSelectedObject,
    selectedObject,
    deleteLayer
  } = useCanvas();

  const { resetCanvases } = useCanvas();
  const resetHistory = useCustomizerStore((state) => state.resetHistory);

  // Helper to wipe cached designer canvases from localStorage
  const clearDesignerStorage = () => {
    const views = ["front", "back", "left", "right", "pocket", "hood"];
    views.forEach((v) => {
      try {
        localStorage.removeItem(`tshirt-designer-${v}`);
      } catch (e) { }
    });
  };

  // Coordinated sync of route and state changes to prevent infinite update/toggling loops
  const lastApparelIdRef = useRef(null);
  const lastCurrentProductRef = useRef(null);
  const hasResetOnMountRef = useRef(false);

  // 1. Initial mount & apparelId change reset: Wipe cached designer state ONCE per page visit or product switch
  useEffect(() => {
    if (!hasResetOnMountRef.current || (apparelId && apparelId !== lastApparelIdRef.current)) {
      clearDesignerStorage();
      resetCanvases();
      resetHistory();
      setJerseyPlayerName("");
      setJerseyPlayerNumber("");
      hasResetOnMountRef.current = true;
    }
  }, [apparelId, resetCanvases, resetHistory, setJerseyPlayerName, setJerseyPlayerNumber]);

  // 2. Sync URL apparelId with customizer store product
  useEffect(() => {
    const isInitial = lastApparelIdRef.current === null && lastCurrentProductRef.current === null;
    const apparelIdChanged = apparelId !== lastApparelIdRef.current;
    const currentProductChanged = currentProduct !== lastCurrentProductRef.current;

    if (isInitial) {
      // On mount: if URL apparelId is different from state, prioritize URL (sync store to match URL)
      if (apparelId && apparelConfig[apparelId] && apparelId !== currentProduct) {
        setCurrentProduct(apparelId);
        setSelectedView(apparelConfig[apparelId].supportedViews[0]);
      }
    } else {
      if (apparelIdChanged) {
        // URL changed (e.g. back/forward navigation) -> sync store to match URL
        if (apparelId && apparelConfig[apparelId] && apparelId !== currentProduct) {
          setCurrentProduct(apparelId);
          setSelectedView(apparelConfig[apparelId].supportedViews[0]);
        }
      } else if (currentProductChanged) {
        // Store changed (e.g. sidebar product click) -> sync URL to match store
        if (currentProduct && currentProduct !== apparelId) {
          navigate(`/coustom-product-tshirt/${currentProduct}`, { replace: true });
        }
      }
    }

    lastApparelIdRef.current = apparelId;
    lastCurrentProductRef.current = currentProduct;
  }, [apparelId, currentProduct, navigate, setCurrentProduct, setSelectedView]);

  // Sync canvases textures into 3D viewer
  const {
    designTextureFront,
    designTextureBack,
    designTextureLeft,
    designTextureRight,
    designTexturePocket,
    designTextureHood,
    manualTriggerSync
  } = useCanvasTextureSync({
    frontCanvas,
    backCanvas,
    leftCanvas,
    rightCanvas,
    pocketCanvas,
    hoodCanvas,
    selectedView,
  });

  const getCanvasStateSnapshot = () => {
    const snapshot = {};
    const views = ["front", "back", "left", "right", "pocket", "hood"];
    const canvasMap = {
      front: frontCanvas,
      back: backCanvas,
      left: leftCanvas,
      right: rightCanvas,
      pocket: pocketCanvas,
      hood: hoodCanvas,
    };
    views.forEach((v) => {
      const cv = canvasMap[v];
      if (cv) {
        snapshot[v] = cv.getObjects().filter(o => o.selectable !== false).map(o => o.toJSON(["isRosterName", "isRosterNumber"]));
      } else {
        const stored = localStorage.getItem(`tshirt-designer-${v}`);
        snapshot[v] = stored ? JSON.parse(stored) : [];
      }
    });
    return snapshot;
  };

  const applySnapshot = (snapshot) => {
    if (!snapshot) return;
    const views = ["front", "back", "left", "right", "pocket", "hood"];
    const canvasMap = {
      front: frontCanvas,
      back: backCanvas,
      left: leftCanvas,
      right: rightCanvas,
      pocket: pocketCanvas,
      hood: hoodCanvas,
    };

    views.forEach((v) => {
      const cv = canvasMap[v];
      const data = snapshot[v] || [];
      localStorage.setItem(`tshirt-designer-${v}`, JSON.stringify(data));

      if (cv) {
        const toRemove = cv.getObjects().filter(o => o.selectable !== false);
        toRemove.forEach(o => cv.remove(o));

        fabric.util.enlivenObjects(data)
          .then((objects) => {
            objects.forEach((obj) => {
              cv.add(obj);
            });
            cv.renderAll();
          })
          .catch((err) => {
            console.error("Error enlivening objects during snapshot application:", err);
          });
      }
    });
  };

  const handleUndo = useCallback(() => {
    const prev = performUndo(getCanvasStateSnapshot);
    if (prev) applySnapshot(prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performUndo, frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas]);

  const handleRedo = useCallback(() => {
    const next = performRedo(getCanvasStateSnapshot);
    if (next) applySnapshot(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performRedo, frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeCanvas) return;
      const activeObj = activeCanvas.getActiveObject();

      // Prevent shortcut interference inside input tags
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable
      ) {
        return;
      }

      const nudge = e.shiftKey ? 5 : 1;

      if (e.key === "ArrowUp") {
        if (activeObj) {
          e.preventDefault();
          activeObj.set("top", activeObj.top - nudge);
          activeObj.setCoords();
          activeCanvas.renderAll();
          activeCanvas.fire("object:modified");
        }
      } else if (e.key === "ArrowDown") {
        if (activeObj) {
          e.preventDefault();
          activeObj.set("top", activeObj.top + nudge);
          activeObj.setCoords();
          activeCanvas.renderAll();
          activeCanvas.fire("object:modified");
        }
      } else if (e.key === "ArrowLeft") {
        if (activeObj) {
          e.preventDefault();
          activeObj.set("left", activeObj.left - nudge);
          activeObj.setCoords();
          activeCanvas.renderAll();
          activeCanvas.fire("object:modified");
        }
      } else if (e.key === "ArrowRight") {
        if (activeObj) {
          e.preventDefault();
          activeObj.set("left", activeObj.left + nudge);
          activeObj.setCoords();
          activeCanvas.renderAll();
          activeCanvas.fire("object:modified");
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (activeObj) {
          e.preventDefault();
          deleteLayer(activeObj);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        if (activeObj) {
          e.preventDefault();
          activeObj.clone((cloned) => {
            cloned.set({
              left: activeObj.left + 20,
              top: activeObj.top + 20,
            });
            activeCanvas.add(cloned);
            activeCanvas.setActiveObject(cloned);
            activeCanvas.renderAll();
            activeCanvas.fire("object:modified");
          });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCanvas, deleteLayer, handleUndo, handleRedo]);

  // Export Design snapshot as JSON File
  const handleExportJSON = () => {
    const snapshot = getCanvasStateSnapshot();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mojilo-design-${currentProduct}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Design snapshot
  const fileInputRef = useRef(null);
  const handleImportJSON = (e) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        applySnapshot(parsed);
      } catch (err) {
        console.error("Failed to parse design JSON configuration file:", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // High Resolution Print Exporter
  const handleHighResPrintExport = () => {
    if (!activeCanvas) return;
    const dataURL = withGuidesHidden(activeCanvas, () => {
      return activeCanvas.toDataURL({
        format: "png",
        quality: 1.0,
        multiplier: 4.0, // Scale rendering to 4x high resolution for prints
      });
    });
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataURL);
    downloadAnchor.setAttribute("download", `mojilo-print-${currentProduct}-${selectedView}-highres.png`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Fetch the matching DB product for the current apparel type
  useEffect(() => {
    const fetchDbProduct = async () => {
      try {
        const nameKeywords = {
          'half-sleeve': 'half',
          'long-sleeve': 'long',
          'oversized': 'oversized',
          'hoodie': 'hoodie',
          'sports-jersey': 'jersey',
        };
        const keyword = nameKeywords[currentProduct];
        if (!keyword) return;
        const res = await api.get(`/products?search=${keyword}&limit=1`);
        const products = res.data?.data?.products || res.data?.data || [];
        if (products.length > 0) {
          setDbProduct(products[0]);
        }
      } catch (err) {
        console.warn('Could not fetch matching DB product for customizer:', err.message);
      }
    };
    fetchDbProduct();
  }, [currentProduct]);

  // Convert a temporary blob: URL into a permanent base64 Data URL so it
  // survives being saved to the DB and viewed in the Admin Panel later.
  const ensurePermanentUrl = async (url) => {
    if (!url || !url.startsWith("blob:")) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to convert blob URL to Base64 Data URL:", err);
      return url; // Return original as last resort
    }
  };

  // Helper to generate a blank 600x800 canvas Data URL with the selected shirt background color
  const createBlankCanvasDataUrl = (color = "#FFFFFF", width = 600, height = 800) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color || "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    return canvas.toDataURL("image/png");
  };

  // Helper to export a view canvas as a clean Data URL (data:image/png;...)
  // Uses multiplier: 1.0 (screen resolution) to keep payload size manageable.
  const exportCanvasViewDataUrl = (cv, backgroundColor = "#FFFFFF", width = 600, height = 800) => {
    if (!cv) {
      return null; // Return null for missing canvases — blank fallback only when needed
    }

    try {
      // 1. Force renderAll() to capture post-background-removal image states & latest edits
      if (cv.renderAll) {
        cv.renderAll();
      }

      // 2. Export canvas Data URL with guides hidden at 1x resolution to reduce payload
      let dataUrl = withGuidesHidden(cv, () =>
        cv.toDataURL({ format: "png", quality: 0.85, multiplier: 1.0 })
      );

      // 3. Ensure dataUrl is a valid data:image/ string
      if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
        return null;
      }

      return dataUrl;
    } catch (err) {
      console.warn("Failed to export canvas view Data URL:", err);
      return null;
    }
  };

  // Add customized product to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    if (addingToCart) return;
    setAddingToCart(true);
    setCartLoaderState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      message: "Preparing your custom design...",
    });

    try {
      // 1. Build the design snapshot JSON from all canvas views
      const designSnapshot = getCanvasStateSnapshot();

      // 2. Generate 2D Fabric canvas preview images & production files from each view
      const previews = {};
      const productionFiles = {};
      const canvasMap = {
        front: frontCanvas,
        back: backCanvas,
        left: leftCanvas,
        right: rightCanvas,
        pocket: pocketCanvas,
        hood: hoodCanvas,
      };

      // Export each canvas view; only store views that have actual content (non-null)
      for (const [view, cv] of Object.entries(canvasMap)) {
        const hasContent = cv && cv.getObjects().filter((o) => o.selectable !== false).length > 0;
        if (hasContent) {
          const dataUrl = exportCanvasViewDataUrl(cv, productColor || "#FFFFFF");
          if (dataUrl) previews[view] = dataUrl;
        }
      }

      // Production files always include at least front; use blank fallback if no content
      productionFiles.frontPrintUrl = previews.front || createBlankCanvasDataUrl(productColor || "#FFFFFF");
      if (previews.back) productionFiles.backPrintUrl = previews.back;
      if (previews.left) productionFiles.leftSleevePrintUrl = previews.left;
      if (previews.right) productionFiles.rightSleevePrintUrl = previews.right;

      // 🟢 2b. Capture 3D WebGL Canvas snapshot as JPEG 0.75 to keep payload small
      const allCanvases = Array.from(document.querySelectorAll("canvas"));
      const threeDCanvas = allCanvases.find((c) => {
        try {
          return c.getContext("webgl") || c.getContext("webgl2") || c.getContext("experimental-webgl");
        } catch (e) {
          return false;
        }
      }) || allCanvases[allCanvases.length - 1];

      if (threeDCanvas) {
        try {
          const threeDDataUrl = threeDCanvas.toDataURL("image/jpeg", 0.75);
          if (threeDDataUrl && threeDDataUrl.startsWith("data:image/")) {
            previews.mockup = threeDDataUrl;
          }
        } catch (e) {
          console.warn("Could not capture 3D canvas snapshot:", e);
        }
      }

      // Ensure previews.front ALWAYS exists as a valid data:image/ string
      if (!previews.front || typeof previews.front !== "string" || !previews.front.startsWith("data:image/")) {
        const blankFront = createBlankCanvasDataUrl(productColor || "#FFFFFF");
        previews.front = blankFront;
        productionFiles.frontPrintUrl = blankFront;
      }

      // 3. Build print areas array from canvas layers
      //    ensurePermanentUrl converts any temporary blob: URLs to base64 Data URLs
      //    so images survive being saved to the DB and viewed in the Admin Panel.
      const printAreas = [];
      for (const [view, cv] of Object.entries(canvasMap)) {
        if (cv) {
          if (cv.renderAll) cv.renderAll();
          const objects = cv.getObjects().filter((o) => o.selectable !== false);
          if (objects.length > 0) {
            const layers = await Promise.all(
              objects.map(async (obj, i) => {
                const isText = obj.type === "i-text" || obj.type === "textbox";
                let layerData = {
                  id: obj.id || `layer-${view}-${i}`,
                  type: isText ? "text" : "image",
                  zIndex: i,
                  x: Math.round(obj.left || 0),
                  y: Math.round(obj.top || 0),
                  width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
                  height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
                  scaleX: obj.scaleX || 1,
                  scaleY: obj.scaleY || 1,
                  rotation: obj.angle || 0,
                };

                if (isText) {
                  layerData.textConfig = {
                    text: obj.text,
                    fontFamily: obj.fontFamily,
                    fontSize: obj.fontSize,
                    fill: obj.fill,
                    fontWeight: obj.fontWeight,
                    fontStyle: obj.fontStyle,
                    textAlign: obj.textAlign,
                  };
                } else {
                  // Convert all blob: URLs to permanent base64 Data URLs
                  const rawSrc = obj.getSrc ? obj.getSrc() : (obj.src || obj.originalSrc);
                  const rawOriginal = obj.originalSrc || obj.src;
                  const rawProcessed = obj.src || obj.originalSrc;

                  const [permanentSrc, permanentOriginal, permanentProcessed] = await Promise.all([
                    ensurePermanentUrl(rawSrc),
                    ensurePermanentUrl(rawOriginal),
                    ensurePermanentUrl(rawProcessed),
                  ]);

                  layerData.imageConfig = {
                    src: permanentSrc,
                    originalUrl: permanentOriginal,
                    processedUrl: permanentProcessed,
                  };
                }

                return layerData;
              })
            );

            printAreas.push({ areaName: view, layers });
          }
        }
      }

      // 4. Build the clothingType key for the backend pricing dictionary
      const CLOTHING_TYPE_MAP = {
        "half-sleeve": "half_sleeve_t_shirt",
        "long-sleeve": "long_sleeve_t_shirt",
        oversized: "oversized_t_shirt",
        hoodie: "hoodie",
        "sports-jersey": "sports_jersey",
      };
      const clothingTypeKey =
        CLOTHING_TYPE_MAP[currentProduct] || currentProduct;

      // 4b. Calculate total quantity & process roster array if Bulk Roster is enabled
      let finalQuantity = 1;
      let cleanedRoster = [];

      if (isBulkRoster) {
        cleanedRoster = roster
          .map((r) => ({
            playerName: (r.playerName || "").trim(),
            playerNumber: (r.playerNumber || "").trim(),
            size: r.size || productSize || "M",
          }))
          .filter((r) => r.playerName !== "" || r.playerNumber !== "");

        if (cleanedRoster.length === 0) {
          setCartLoaderState({
            isLoading: false,
            isSuccess: false,
            isError: true,
            message: "Please add at least one player name or number to your roster before adding to cart.",
          });
          toast.error("Please add at least one player name or number to your roster before adding to cart.");
          setAddingToCart(false);
          return;
        }

        finalQuantity = cleanedRoster.length;
      }

      // 5. Create customization record on server
      const customRes = await api.post("/customizations", {
        productId: null,
        variantId: null,
        selectedColor: productColor,
        selectedSize: productSize,
        editableDesignJSON: designSnapshot,
        previews,
        productionFiles,
        printAreas,
        baseTemplateId: currentProduct,
        productType: currentProduct, // 🟢 Key for identifying the 3D model GLB
        clothingType: productConfig.name,
        isBulkRoster,
        roster: cleanedRoster,
      });

      const customizationId = customRes.data?.data?._id;
      if (!customizationId) {
        throw new Error(
          "Failed to save customization design. Please try again."
        );
      }

      // 6. Add to CUSTOM CART with dynamic total quantity
      await addCustomTemplateToCart(
        customizationId,
        clothingTypeKey,
        productSize || "M",
        productColor || "#FFFFFF",
        finalQuantity
      );

      // 7. Navigate to cart page
      setCartLoaderState({
        isLoading: false,
        isSuccess: true,
        isError: false,
        message: "Added to Cart!",
      });
      window.setTimeout(() => navigate("/cart"), 1200);
    } catch (err) {
      console.error("Failed to add customized product to cart:", err);
      setCartLoaderState({
        isLoading: false,
        isSuccess: false,
        isError: true,
        message: err.message || "Failed to add to cart. Please try again.",
      });
      toast.error(err.message || "Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };
  // ── Live apparel template for current product ──────────────────────────────
  // Falls back to static defaults if the admin API hasn't responded yet.
  const FALLBACK_COLORS = [
    "#FFFFFF", "#000000", "#EF4444", "#3B82F6", "#10B981",
    "#1E3A8A", "#F59E0B", "#6B7280", "#F97316", "#8B5CF6",
  ];
  const FALLBACK_SIZES = [
    { size: "XS", enabled: true, priceAddon: 0 },
    { size: "S", enabled: true, priceAddon: 0 },
    { size: "M", enabled: true, priceAddon: 0 },
    { size: "L", enabled: true, priceAddon: 0 },
    { size: "XL", enabled: true, priceAddon: 0 },
    { size: "XXL", enabled: true, priceAddon: 0 },
    { size: "3XL", enabled: false, priceAddon: 0 },
  ];

  const liveTemplate = apparelTemplates?.[currentProduct] ?? null;
  // Colors: use admin-set list or fallback
  const presetTshirtColors = liveTemplate?.availableColors?.length
    ? liveTemplate.availableColors
    : FALLBACK_COLORS;
  // Sizes: only enabled ones from admin; fallback if not loaded
  const tshirtSizes = (liveTemplate?.sizes ?? FALLBACK_SIZES).filter((s) => s.enabled);

  const productConfig = apparelConfig[currentProduct] || apparelConfig["half-sleeve"];
  const ActiveModelMesh = productConfig.modelComponent;

  // ------------------------------------------------------------------
  // Mount flags: on desktop (lg+) everything is always mounted, matching
  // original behavior. On mobile, only the active main view's heavy
  // component is mounted — this stops the 3D render loop / fabric canvas
  // from burning CPU/GPU while off-screen.
  // ------------------------------------------------------------------
  const shouldMountPreview = !isMobile || mobileMainView === "preview";
  // CanvasEditor stays mounted continuously so Fabric canvas state, pricing, and previews are never lost on mobile view toggle
  const shouldMountEditor = true;
  // Tool tab content only needs to exist once it's actually visible:
  // always on desktop, or on mobile once the sheet has been opened.
  const shouldMountTools = !isMobile || mobileSheetOpen;

  const viewLabel = (selectedView || "front").charAt(0).toUpperCase() + (selectedView || "front").slice(1);

  // Shared tool-tab content block, reused by both the desktop sidebar and
  // the mobile bottom sheet so behavior never drifts between the two.
  const toolTabContent = (
    <div>
      {activeTab === "apparel" && (
        <div className="space-y-5">
          <ProductSelector />

          {/* Apparel Color picker preset grid */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Palette className="h-4 w-4" /> Fabric Color
            </div>
            <div className="flex flex-wrap gap-2">
              {presetTshirtColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setProductColor(color)}
                  className={`w-7 h-7 rounded-full border shadow-inner transition-all hover:scale-110 cursor-pointer ${productColor === color
                    ? "border-[#997241] ring-2 ring-[#997241] dark:ring-[#997241]"
                    : "border-slate-200 dark:border-slate-600"
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Sizing selector */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Garment Size</div>
            <div className="flex flex-wrap gap-1.5">
              {tshirtSizes.map((sz) => {
                // sz is either { size, enabled, priceAddon } (live) or a plain string (fallback)
                const sizeLabel = typeof sz === "string" ? sz : sz.size;
                const priceAddon = typeof sz === "object" ? (sz.priceAddon ?? 0) : 0;
                const isSelected = productSize === sizeLabel;
                return (
                  <button
                    key={sizeLabel}
                    onClick={() => setProductSize(sizeLabel)}
                    title={priceAddon > 0 ? `+₹${priceAddon} for ${sizeLabel}` : sizeLabel}
                    className={`relative w-9 h-8 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isSelected
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-white border-slate-200 dark:bg-slate-700 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
                      }`}
                  >
                    {sizeLabel}
                    {priceAddon > 0 && (
                      <span className="absolute -top-1.5 -right-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50 px-0.5 rounded leading-none">
                        +{priceAddon}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>



          {/* --- TEAM ROSTER / BULK ORDER SECTION --- */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Team Roster / Bulk Order</span>
                  <span className="text-[10px] text-slate-400 block">Names, numbers & sizes for teamwear</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isBulkRoster}
                  onChange={(e) => setIsBulkRoster(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-[#997241]"></div>
              </label>
            </div>

            {isBulkRoster && (
              <div className="space-y-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Roster List ({roster.length} Players)</span>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                    Qty: {roster.length}
                  </span>
                </div>

                {/* Print Placement Location Selector */}
                <div className="p-2 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-lg space-y-1.5">
                  {/* <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    <span>Print Location:</span>
                    <span className="font-mono text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.2 rounded">
                      {rosterPlacementSide.toUpperCase()}
                    </span>
                  </div> */}
                  <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
                    {/* <button
                      type="button"
                      onClick={() => handleSetRosterSide("front")}
                      className={`py-1 px-2 text-[10px] font-bold rounded transition-all cursor-pointer ${
                        rosterPlacementSide === "front"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      Front Side
                    </button> */}
                    <button
                      type="button"
                      onClick={() => handleSetRosterSide("back")}
                      className={`py-1 px-2 text-[10px] font-bold rounded transition-all cursor-pointer ${rosterPlacementSide === "back"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                    >
                      Back Side
                    </button>

                  </div>
                </div>

                {/* Roster rows */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {roster.map((player, idx) => {
                    const isPreviewing = activePreviewIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg space-y-2 text-xs relative group shadow-sm transition-all border ${isPreviewing
                            ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-300 dark:ring-indigo-800"
                            : "bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600"
                          }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span className="flex items-center gap-1.5">
                            Player #{idx + 1}
                            {isPreviewing && (
                              <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.2 rounded font-semibold tracking-normal uppercase">
                                Active Preview
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePreviewPlayer(idx)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${isPreviewing
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                                }`}
                              title="Preview on 3D/2D garment & edit position"
                            >
                              <Eye className="h-3 w-3" />
                              {isPreviewing ? "Active" : "Preview"}
                            </button>
                            {roster.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRosterRow(idx)}
                                className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                                title="Remove player"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {rosterPlacementSide === "both" ? (
                          <div className="space-y-1.5">
                            {/* Back Side Row */}
                            <div className="grid grid-cols-12 gap-1.5 items-center">
                              <div className="col-span-2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Back:</div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  placeholder="Back Name (Opt)"
                                  value={player.playerName || ""}
                                  onChange={(e) => handleUpdateRosterRow(idx, "playerName", e.target.value)}
                                  className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <div className="col-span-3">
                                <input
                                  type="text"
                                  placeholder="No. (#)"
                                  value={player.playerNumber || ""}
                                  onChange={(e) => handleUpdateRosterRow(idx, "playerNumber", e.target.value.slice(0, 3))}
                                  className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <div className="col-span-3">
                                <select
                                  value={player.size || productSize || "M"}
                                  onChange={(e) => handleUpdateRosterRow(idx, "size", e.target.value)}
                                  className="w-full h-7 px-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                                >
                                  {(tshirtSizes.length > 0 ? tshirtSizes : ["S", "M", "L", "XL", "XXL", "3XL"]).map((s) => {
                                    const label = typeof s === "string" ? s : s.size;
                                    return (
                                      <option key={label} value={label}>
                                        {label}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            </div>

                            {/* Front Side Row */}
                            <div className="grid grid-cols-12 gap-1.5 items-center">
                              <div className="col-span-2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Front:</div>
                              <div className="col-span-5">
                                <input
                                  type="text"
                                  placeholder="Front Name (Opt)"
                                  value={player.frontPlayerName ?? ""}
                                  onChange={(e) => handleUpdateRosterRow(idx, "frontPlayerName", e.target.value)}
                                  className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <div className="col-span-5">
                                <input
                                  type="text"
                                  placeholder="Front No. (#) (Opt)"
                                  value={player.frontPlayerNumber ?? ""}
                                  onChange={(e) => handleUpdateRosterRow(idx, "frontPlayerNumber", e.target.value.slice(0, 3))}
                                  className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-12 gap-1.5">
                            <div className="col-span-5">
                              <input
                                type="text"
                                placeholder={rosterPlacementSide === "front" ? "Front Name (Opt)" : "Back Name (Opt)"}
                                value={rosterPlacementSide === "front" ? (player.frontPlayerName ?? player.playerName ?? "") : (player.playerName ?? "")}
                                onChange={(e) => handleUpdateRosterRow(idx, rosterPlacementSide === "front" ? "frontPlayerName" : "playerName", e.target.value)}
                                className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="text"
                                placeholder="No. (#)"
                                value={rosterPlacementSide === "front" ? (player.frontPlayerNumber ?? player.playerNumber ?? "") : (player.playerNumber ?? "")}
                                onChange={(e) => handleUpdateRosterRow(idx, rosterPlacementSide === "front" ? "frontPlayerNumber" : "playerNumber", e.target.value.slice(0, 3))}
                                className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div className="col-span-4">
                              <select
                                value={player.size || productSize || "M"}
                                onChange={(e) => handleUpdateRosterRow(idx, "size", e.target.value)}
                                className="w-full h-7 px-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                              >
                                {(tshirtSizes.length > 0 ? tshirtSizes : ["S", "M", "L", "XL", "XXL", "3XL"]).map((s) => {
                                  const label = typeof s === "string" ? s : s.size;
                                  return (
                                    <option key={label} value={label}>
                                      {label}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddRosterRow}
                  className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" /> + Add Player to Roster
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "upload" && <ImageUploadPanel />}
      {activeTab === "text" && <TypographyPanel manualSync={manualTriggerSync} />}
      {activeTab === "graphics" && <StickersPanel manualSync={manualTriggerSync} />}
      {activeTab === "shapes" && <ShapesPanel manualSync={manualTriggerSync} />}
      {activeTab === "ai" && <AIImageGenerator />}
      {activeTab === "qr" && <QrCodeGenerator />}
      {activeTab === "bg-remover" && <BackgroundRemovalPanel />}
    </div>
  );

  const tabHeaderLabel = {
    apparel: "Product Settings",
    upload: "Upload Images",
    text: "Typography Panel",
    graphics: "Stickers & Clipart",
    shapes: "Shapes Library",
    ai: "AI Image Maker",
    qr: "QR Generator",
    "bg-remover": "Background Remover",
  }[activeTab];

  // Auth banner dismiss state — shown once per page load for guests
  const [authBannerDismissed, setAuthBannerDismissed] = useState(false);
  const showAuthBanner = !isAuthenticated && !authBannerDismissed;

  return (
    <div className={`h-screen flex flex-col font-sans antialiased overflow-hidden ${isDarkMode ? "bg-slate-900 text-slate-100 dark" : "bg-slate-50 text-slate-800"
      }`}>

      {/* ── Guest Auth Alert Banner ─────────────────────────────────────────
          Shown at the very top when the user is not logged in.
          Smoothly animates in, and can be dismissed with the × button.
      ─────────────────────────────────────────────────────────────────── */}
      {showAuthBanner && (
        <div
          role="alert"
          className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5
            bg-gradient-to-r from-amber-800 via-orange-800 to-amber-800
            text-white text-xs font-semibold shadow-md z-50
            animate-[slideDown_0.35s_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{
            /* inline keyframes so no external CSS file change is needed */
          }}
        >
          <style>{`
            @keyframes slideDown {
              from { transform: translateY(-110%); opacity: 0; }
              to   { transform: translateY(0);     opacity: 1; }
            }
          `}</style>

          {/* Left: icon + message */}
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="h-4 w-4 shrink-0 text-white/90" />
            <span className="truncate">
              You're browsing as a guest. Please&nbsp;
              <button
                onClick={() => navigate("/login")}
                className="underline underline-offset-2 font-bold hover:text-white/80 transition-colors cursor-pointer"
              >
                log in
              </button>
              &nbsp;to save your design or add to cart.
            </span>
          </div>

          {/* Right: Login CTA + dismiss */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:bg-white/40
                border border-white/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </button>
            <button
              onClick={() => setAuthBannerDismissed(true)}
              aria-label="Dismiss login reminder"
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/20 active:bg-white/30 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Header */}
      <header className="h-14 border-b shrink-0 flex items-center justify-between gap-2 px-2 sm:px-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-30 shadow-sm transition-colors overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => navigate("/custom")}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider truncate">Design Studio</h1>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none mt-0.5 truncate">Mojilo Customizer</p>
          </div>
        </div>

        {/* Global Toolbar utility actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 cursor-pointer shrink-0"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            title="Redo (Ctrl+Y)"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 cursor-pointer shrink-0"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ============================================================
          MOBILE-ONLY toolbar row: Grid / Rulers + Front/Back view switcher —
          only relevant while looking at the flat 2D artwork.
          ============================================================ */}
      {isMobile && mobileMainView === "editor" && (
        <div className="lg:hidden shrink-0 flex items-center justify-between gap-1 px-3 py-2 border-b bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-20">
          {/* <div className="flex items-center ">
            <button
              onClick={() => setShowGrid((v) => !v)}
              className={`flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${showGrid
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200"
                }`}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Grid
            </button>
            <button
              onClick={() => setShowRulers((v) => !v)}
              className={`flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${showRulers
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200"
                }`}
            >
              <Ruler className="h-3.5 w-3.5" /> Rulers
            </button>
          </div> */}

          {/* FRONT and BACK View Switcher Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
            {(productConfig.supportedViews || ["front", "back"]).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                  selectedView === view
                    ? "bg-[#997241] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          MOBILE-ONLY print-area label bar (matches reference design)
          ============================================================ */}
      {isMobile && mobileMainView === "editor" && (
        <div className="lg:hidden shrink-0 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
          <span className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider">
            {viewLabel} Print Area
          </span>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden z-10 pb-14 lg:pb-0">

        {/* ========================================================
            COLUMN 1 (DESKTOP ONLY): Left Collapsible Tool Sidebar.
            On mobile, tool tabs live in the bottom sheet instead — see
            below — so this column is hidden entirely on small screens.
            ======================================================== */}
        <div className="hidden lg:flex shrink-0 relative z-30 w-auto h-full border-r bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all overflow-hidden">

          {/* Vertical Tabs Strip HUD */}
          <div className="w-[60px] border-r flex flex-col items-center py-4 gap-4 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shrink-0 overflow-y-auto">
            {TOOL_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setLeftSidebarOpen(true);
                }}
                title={tab.label}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${activeTab === tab.id && leftSidebarOpen
                  ? "bg-[#997241] text-[#FFF] shadow-md scale-[1.05]"
                  : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
              >
                {tab.icon}
              </button>
            ))}
          </div>

          {/* Tabs drawer container */}
          <div
            className={`flex flex-col h-full bg-white dark:bg-slate-800 transition-all overflow-hidden z-20 border-r border-slate-100 dark:border-slate-700 ${leftSidebarOpen ? "flex-1 lg:w-[300px]" : "w-0"
              }`}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {tabHeaderLabel}
                </span>
              </div>
              {toolTabContent}
            </div>

            {/* Bottom pricing estimation element */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 shrink-0 space-y-3 bg-white dark:bg-slate-800">
              <PriceCalculator />
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full h-11 bg-[#997241] hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shirt className="h-4.5 w-4.5" />
                Add to Cart & Checkout
              </button>
            </div>
          </div>

          {/* Toggle sidebar drawer arrow — desktop only */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-12 items-center justify-center rounded-r-xl border-y border-r bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10 shadow cursor-pointer focus:outline-none"
          >
            {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* ========================================================
            COLUMN 2: 3D Preview (React Three Fiber)
            Desktop: always visible, side by side with the editor.
            Mobile: only visible (and only MOUNTED) when the user has
            tapped "View 3D" — this is what stops the WebGL render loop
            from burning battery/CPU while the 2D editor is on screen.
            ======================================================== */}
        <section
          className={`${isMobile ? (mobileMainView === "preview" ? "block" : "hidden") : "block"
            } flex-1 min-w-0 lg:min-w-[320px] h-full relative z-10 lg:border-r border-slate-200 dark:border-slate-700`}
        >
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <span className="text-[11px] font-bold text-[#997241] bg-[#fff] hover:bg-indigo-200 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {productConfig.name}
            </span>
          </div>

          {shouldMountPreview ? (
            <Suspense fallback={<PanelSkeleton loading3D />}>
              <ThreeDViewer
                modelComponent={ActiveModelMesh}
                tshirtColor={productColor}
                designTexture={designTextureFront}
                designTextureBack={designTextureBack}
                designTextureLeft={designTextureLeft}
                designTextureRight={designTextureRight}
                designTexturePocket={designTexturePocket}
                designTextureHood={designTextureHood}
                onViewChange={(view) => setSelectedView(view)}
                // Lower pixel ratio on mobile so the GPU isn't rendering at
                // full device pixel ratio (e.g. 3x on many phones).
                // ThreeDViewer should forward this to <Canvas dpr={...} />.
                dpr={isMobile ? [1, 1.5] : undefined}
              />
            </Suspense>
          ) : (
            <PanelSkeleton label="Preview paused" />
          )}
        </section>

        {/* ========================================================
            COLUMN 3: 2D Workspace (Fabric Canvas and Inspector)
            Desktop: always visible, side by side.
            Mobile: this IS the default view (matches reference design).
            Only MOUNTED while active on mobile.
            ======================================================== */}
        <aside
          className={`${isMobile ? (mobileMainView === "editor" ? "flex" : "hidden") : "flex"
            } w-full lg:w-[500px] scrollbar-hide h-full bg-slate-50 dark:bg-slate-900 flex-col shrink-0 relative overflow-hidden z-20`}
        >
          <div className="flex-1 overflow-y-auto flex flex-col justify-start items-stretch">
            <div className="w-full flex justify-center h-fit">
              <CanvasEditor
                manualSync={manualTriggerSync}
                showGrid={showGrid}
                showRulers={showRulers}
              />
            </div>
            {/* Object coordinates inspector panel - DESKTOP ONLY */}
            <div className="hidden lg:block w-full p-4 pt-0">
              <ObjectInspector />
            </div>
          </div>
        </aside>

      </div>

      {/* ========================================================
          MOBILE-ONLY slim action bar: "View Costing" opens the full
          price breakdown in a popup instead of sitting inline, so the
          garment view stays uncluttered. Add-to-cart stays one tap away.
          ======================================================== */}
      <div className="lg:hidden shrink-0 fixed left-0 right-0 bottom-14 z-30 p-3 border-t bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCostingModal(true)}
            className="flex-1 h-11 min-w-0 flex items-center justify-center gap-2 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99] transition-transform"
          >
            <Calculator className="h-4 w-4" />
            View Costing
          </button>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="h-11 px-4 shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shirt className="h-4.5 w-4.5" />
            Add
          </button>
        </div>
      </div>

      {/* ========================================================
          MOBILE-ONLY costing popup — full PriceCalculator breakdown,
          shown on demand instead of permanently occupying screen space.
          ======================================================== */}
      {showCostingModal && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex items-end justify-center bg-black/40"
          onClick={() => setShowCostingModal(false)}
        >
          <div
            className="w-full max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Estimation</span>
              <button
                onClick={() => setShowCostingModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <PriceCalculator />
            <button
              onClick={() => {
                setShowCostingModal(false);
                handleAddToCart();
              }}
              disabled={addingToCart}
              className="w-full h-11 mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shirt className="h-4.5 w-4.5" />
              Add to Cart & Checkout
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MOBILE-ONLY floating Object Inspector action trigger pill
          Appears on screen whenever an element is selected on mobile 2D view.
          ======================================================== */}
      {isMobile && selectedObject && mobileMainView === "editor" && (
        <div className="lg:hidden fixed bottom-28 right-4 z-40 flex items-center gap-1.5 p-1 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur border border-slate-700/60 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setShowObjectInspectorModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Inspect</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold uppercase truncate max-w-[80px]">
              {selectedObject.type}
            </span>
          </button>
          <button
            onClick={() => {
              if (activeCanvas?.discardActiveObject) {
                activeCanvas.discardActiveObject();
                activeCanvas.renderAll();
              }
            }}
            title="Deselect element"
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================
          MOBILE-ONLY Object Inspector Popup Modal
          Opens on demand when tapping "Inspect" floating pill or button.
          ======================================================== */}
      {showObjectInspectorModal && isMobile && (
        <div
          className="lg:hidden fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowObjectInspectorModal(false)}
        >
          <div
            className="w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.2)] p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <ObjectInspector onClose={() => setShowObjectInspectorModal(false)} />
          </div>
        </div>
      )}

      {/* ========================================================
          MOBILE-ONLY bottom sheet: opens over the main view when a
          tool tab is tapped in the bottom nav. Contains the full tab
          strip (all 8 tools) plus the active tab's content.
          ======================================================== */}
      <div
        className={`lg:hidden fixed left-0 right-0 bottom-14 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out ${mobileSheetOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
        style={{ maxHeight: "70vh" }}
      >
        {/* Drag handle / close */}
        <button
          onClick={() => setMobileSheetOpen(false)}
          className="w-full flex flex-col items-center pt-2 pb-1 cursor-pointer"
        >
          <span className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
          <ChevronDown className="h-4 w-4 text-slate-400 mt-1" />
        </button>

        {/* Horizontal tab strip */}
        <div className="flex items-center gap-2 px-3 pb-2 overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-700">
          {TOOL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${activeTab === tab.id
                ? "bg-violet-600 text-white"
                : "bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(70vh - 60px)" }}>
          {shouldMountTools && toolTabContent}
        </div>
      </div>

      {/* ========================================================
          Mobile bottom tab bar (matches reference design): View 3D/2D
          toggle + the four most-used tool tabs. Hidden on lg+.
          ======================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 z-50 flex items-stretch border-t bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={handleMobileToggleView}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${mobileMainView === "preview" && !mobileSheetOpen
            ? "text-violet-600 dark:text-violet-400"
            : "text-slate-400 dark:text-slate-500"
            }`}
        >
          {mobileMainView === "preview" ? <PencilRuler className="h-5 w-5" /> : <Box className="h-5 w-5" />}
          <span className="text-[10px] font-bold uppercase tracking-wide">
            {mobileMainView === "preview" ? "View 2D" : "View 3D"}
          </span>
        </button>

        {MOBILE_QUICK_TABS.map((tabId) => {
          const tab = TOOL_TABS.find((t) => t.id === tabId);
          const active = mobileSheetOpen && activeTab === tabId;
          return (
            <button
              key={tab.id}
              onClick={() => handleMobileTabTap(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${active ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
                }`}
            >
              {tab.icon}
              <span className="text-[10px] font-bold uppercase tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <AddToCartLoader
        isLoading={cartLoaderState.isLoading}
        isSuccess={cartLoaderState.isSuccess}
        isError={cartLoaderState.isError}
        message={cartLoaderState.message}
        onRetry={() => handleAddToCart()}
      />
    </div>
  );
}
export { CoustomProductTshirt };