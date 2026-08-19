import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from 'react-hot-toast';
import { calculateElementPrice } from "../utils/pricingUtils";
import { Link } from "react-router-dom";
import logo from '../assets/Logo.png';
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

function PanelSkeleton({ label, loading3D }) {
  if (loading3D) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(153,114,65,0.18) 50%, transparent 60%)",
              animation: "skeletonShimmer 2s ease-in-out infinite",
            }}
          />
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div
            className="absolute rounded-full border-2 border-[#997241]/20"
            style={{ width: 110, height: 110, animation: "pingRing 2s ease-out infinite" }}
          />
          <div
            className="absolute rounded-full border-2 border-[#997241]/30"
            style={{ width: 80, height: 80, animation: "pingRing 2s ease-out 0.5s infinite" }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 64,
              height: 64,
              border: "3px solid transparent",
              borderTopColor: "#997241",
              borderRightColor: "#c2a274",
              animation: "spinArc 1s linear infinite",
            }}
          />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#997241] to-[#7c5c34] flex items-center justify-center shadow-lg shadow-[#997241]/30"
            style={{ animation: "floatBox 3s ease-in-out infinite" }}
          >
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
        </div>

        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 tracking-wide">
          Loading 3D Model
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Preparing your garment…
        </p>

        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#997241]"
              style={{ animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>

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
            50%        { transform: translateY(-6px) rotate(3deg); }
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

const TOOL_TABS = [
  { id: "apparel", label: "Apparel", icon: <Shirt className="h-5 w-5" /> },
  { id: "upload", label: "Upload Image", icon: <ImagePlus className="h-5 w-5" /> },
  { id: "text", label: "Text", icon: <Type className="h-5 w-5" /> },
  { id: "graphics", label: "Stickers", icon: <LayoutGrid  className="h-5 w-5" /> },
  { id: "ai", label: "AI Generator", icon: <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" /> },
  { id: "qr", label: "QR Code", icon: <QrCode  className="h-5 w-5" /> },
  { id: "bg-remover", label: "BG Remover", icon: <Wand2 className="h-5 w-5 " /> },
];

const MOBILE_QUICK_TABS = ["apparel", "text", "upload", "graphics"];

export default function CoustomProductTshirt() {
  const { apparelId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
  const apparelTemplates = useCustomizerStore((state) => state.apparelTemplates);

  const performUndo = useCustomizerStore((state) => state.performUndo);
  const performRedo = useCustomizerStore((state) => state.performRedo);

  const jerseyPlayerName = useCustomizerStore((state) => state.jerseyPlayerName);
  const setJerseyPlayerName = useCustomizerStore((state) => state.setJerseyPlayerName);
  const jerseyPlayerNumber = useCustomizerStore((state) => state.jerseyPlayerNumber);
  const setJerseyPlayerNumber = useCustomizerStore((state) => state.setJerseyPlayerNumber);

  const [isBulkRoster, setIsBulkRoster] = useState(false);
  const [rosterPlacementSide, setRosterPlacementSide] = useState("back");
  const [rosterDesignMode, setRosterDesignMode] = useState("uniform"); // "uniform" = Same for all, "individual" = Custom per player
  const [sharedRosterStyle, setSharedRosterStyle] = useState({
    nameStyle: null,
    numStyle: null,
  });
  const [activePreviewIndex, setActivePreviewIndex] = useState(null);
  const [roster, setRoster] = useState([
    { playerName: "", playerNumber: "", size: "M", nameStyle: null, numStyle: null }
  ]);
  const pricingDetails = useCustomizerStore((state) => state.pricingDetails);

  // Sync live active preview canvas price into roster entries
  useEffect(() => {
    if (isBulkRoster && pricingDetails?.total) {
      const currentTotal = pricingDetails.total;
      const basePrice = pricingDetails.base || 249;
      const currentInkCost = Math.max(0, currentTotal - basePrice);

      // Update only the active preview player's entry (or index 0 if none active)
      const activeIdx = activePreviewIndex !== null ? activePreviewIndex : 0;
      setRoster((prev) =>
        prev.map((player, i) => {
          if (i !== activeIdx) return player;
          if (player.calculatedPrice === currentTotal && player.inkCoveragePrice === currentInkCost) {
            return player;
          }
          return {
            ...player,
            inkCoveragePrice: parseFloat(currentInkCost.toFixed(2)),
            calculatedPrice: parseFloat(currentTotal.toFixed(2)),
          };
        })
      );
    }
  }, [pricingDetails?.total, isBulkRoster, activePreviewIndex]);

  const rosterGrandTotal = useMemo(() => {
    if (!isBulkRoster || !Array.isArray(roster) || roster.length === 0) {
      return null;
    }

    const basePrice = pricingDetails?.base ?? 249;
    const nonRosterExtraCost = (pricingDetails?.image || 0) + (pricingDetails?.ai || 0) + (pricingDetails?.extra || 0);

    const totalSum = roster.reduce((sum, player) => {
      let price = (player.calculatedPrice && typeof player.calculatedPrice === "number" && player.calculatedPrice > 0)
        ? player.calculatedPrice
        : null;

      if (!price) {
        let inkCost = (player.inkCoveragePrice && typeof player.inkCoveragePrice === "number")
          ? player.inkCoveragePrice
          : null;

        if (inkCost === null) {
          const nameVal = (rosterPlacementSide === "front" ? (player.frontPlayerName || player.playerName) : player.playerName) || "";
          const numVal = (rosterPlacementSide === "front" ? (player.frontPlayerNumber || player.playerNumber) : player.playerNumber) || "";
          const trimmedName = nameVal.trim().toUpperCase();
          const trimmedNum = numVal.trim();
          const nStyle = player.nameStyle || {};
          const nuStyle = player.numStyle || {};

          let namePrice = 0;
          if (trimmedName) {
            const nameFontSize = nStyle.fontSize || 28;
            const nameScaleX = nStyle.scaleX || 1;
            const nameWidthPx = trimmedName.length * nameFontSize * 0.55 * nameScaleX;
            const nameHeightPx = nameFontSize * 1.2;
            namePrice = calculateElementPrice(nameWidthPx, nameHeightPx);
          }

          let numPrice = 0;
          if (trimmedNum) {
            const numFontSize = nuStyle.fontSize || 54;
            const numScaleX = nuStyle.scaleX || 1;
            const numWidthPx = trimmedNum.length * numFontSize * 0.55 * numScaleX;
            const numHeightPx = numFontSize * 1.2;
            numPrice = calculateElementPrice(numWidthPx, numHeightPx);
          }

          inkCost = namePrice + numPrice;
        }

        price = basePrice + nonRosterExtraCost + inkCost;
      }
      return sum + price;
    }, 0);

    return parseFloat(totalSum.toFixed(2));
  }, [roster, isBulkRoster, rosterPlacementSide, pricingDetails?.total, pricingDetails?.base, pricingDetails?.image, pricingDetails?.ai, pricingDetails?.extra]);

  const handleAddRosterRow = () => {
    const basePrice = pricingDetails?.base || 249;
    setRoster((prev) => [
      ...prev,
      { playerName: "", playerNumber: "", size: productSize || "M", nameStyle: null, numStyle: null, inkCoveragePrice: 0, calculatedPrice: basePrice }
    ]);
  };

  const handleRemoveRosterRow = (index) => {
    setRoster((prev) => prev.filter((_, i) => i !== index));
    if (activePreviewIndex === index) {
      setActivePreviewIndex(null);
    }
  };

  const getRosterObjects = (cv) => {
    if (!cv || typeof cv.getObjects !== "function") return { nameObj: null, numObj: null };
    const all = cv.getObjects();
    return {
      nameObj: all.find((o) => o.isRosterName === true || o.isJerseyName === true) || null,
      numObj: all.find((o) => o.isRosterNumber === true || o.isJerseyNumber === true) || null,
    };
  };

  const saveCanvasRosterStyle = useCallback((cv) => {
    if (!cv || typeof cv.getObjects !== "function") return;
    const { nameObj, numObj } = getRosterObjects(cv);

    const extractStyle = (obj, defaultFontSize = 28) => {
      if (!obj) return null;
      const scaleY = obj.scaleY || 1;
      const scaleX = obj.scaleX || 1;
      const baseFontSize = obj.fontSize || defaultFontSize;

      const effectiveFontSize = Math.max(8, Math.round(baseFontSize * scaleY));
      const effectiveScaleX = scaleY !== 0 ? scaleX / scaleY : scaleX;

      // Update live canvas object to normalize scaleY to 1 and preserve width aspect ratio (scaleX)
      if (scaleY !== 1 || obj.scaleY !== 1) {
        obj.set({
          fontSize: effectiveFontSize,
          scaleX: effectiveScaleX,
          scaleY: 1,
        });
        obj.setCoords();
      }

      const style = {};
      const fields = [
        "fontFamily", "fill", "stroke", "strokeWidth",
        "fontWeight", "fontStyle", "textAlign", "letterSpacing", "charSpacing",
        "left", "top", "angle", "originX", "originY",
        "isCurved", "curvature", "radius", "arc"
      ];
      fields.forEach((f) => {
        if (obj[f] !== undefined && obj[f] !== null) style[f] = obj[f];
      });

      style.fontSize = effectiveFontSize;
      style.scaleX = effectiveScaleX;
      style.scaleY = 1;
      return style;
    };

    const newNameStyle = extractStyle(nameObj, 28);
    const newNumStyle = extractStyle(numObj, 54);

    if (rosterDesignMode === "uniform") {
      if (newNameStyle || newNumStyle) {
        setSharedRosterStyle((prev) => ({
          nameStyle: newNameStyle ? { ...(prev.nameStyle || {}), ...newNameStyle } : prev.nameStyle,
          numStyle: newNumStyle ? { ...(prev.numStyle || {}), ...newNumStyle } : prev.numStyle,
        }));
      }
    } else {
      const activeIdx = activePreviewIndex !== null ? activePreviewIndex : 0;
      if (newNameStyle || newNumStyle) {
        const currentTotal = pricingDetails?.total;
        const baseGarmentPrice = pricingDetails?.base ?? 249;

        setRoster((prev) =>
          prev.map((player, i) => {
            if (i !== activeIdx) return player;
            const updated = {
              ...player,
              nameStyle: newNameStyle ? { ...(player.nameStyle || {}), ...newNameStyle } : player.nameStyle,
              numStyle: newNumStyle ? { ...(player.numStyle || {}), ...newNumStyle } : player.numStyle,
            };

            let calculatedPrice;
            let inkCoveragePrice;

            if (currentTotal && typeof currentTotal === "number" && currentTotal > 0) {
              calculatedPrice = currentTotal;
              inkCoveragePrice = Math.max(0, currentTotal - baseGarmentPrice);
            } else if (player.calculatedPrice) {
              calculatedPrice = player.calculatedPrice;
              inkCoveragePrice = player.inkCoveragePrice || 0;
            } else {
              const nameVal = (rosterPlacementSide === "front" ? (updated.frontPlayerName || updated.playerName) : updated.playerName) || "";
              const numVal = (rosterPlacementSide === "front" ? (updated.frontPlayerNumber || updated.playerNumber) : updated.playerNumber) || "";
              const trimmedName = nameVal.trim().toUpperCase();
              const trimmedNum = numVal.trim();
              const nStyle = updated.nameStyle || {};
              const nuStyle = updated.numStyle || {};
              const nameFontSize = nStyle.fontSize || 28;
              const nameScaleX = nStyle.scaleX || 1;
              const nameAreaPx = trimmedName ? (trimmedName.length * nameFontSize * 0.55 * nameScaleX) * (nameFontSize * 1.2) : 0;
              const numFontSize = nuStyle.fontSize || 54;
              const numScaleX = nuStyle.scaleX || 1;
              const numAreaPx = trimmedNum ? (trimmedNum.length * numFontSize * 0.55 * numScaleX) * (numFontSize * 1.2) : 0;
              const totalRosterAreaPx = nameAreaPx + numAreaPx;
              const sqInches = totalRosterAreaPx / 2500;
              const rawRosterViewCost = sqInches * 1.00;
              inkCoveragePrice = (trimmedName || trimmedNum) ? Math.max(30.00, rawRosterViewCost) : 0;
              const nonRosterExtraCost = (pricingDetails?.image || 0) + (pricingDetails?.ai || 0) + (pricingDetails?.extra || 0);
              calculatedPrice = baseGarmentPrice + nonRosterExtraCost + inkCoveragePrice;
            }

            return {
              ...updated,
              inkCoveragePrice: parseFloat(inkCoveragePrice.toFixed(2)),
              calculatedPrice: parseFloat(calculatedPrice.toFixed(2)),
            };
          })
        );
      }
    }
  }, [rosterDesignMode, activePreviewIndex, pricingDetails, rosterPlacementSide]);

  const clearRosterTextLayers = (canvas, view) => {
    if (!canvas || typeof canvas.getObjects !== "function") return;

    // Collect all text strings present in the roster to catch unflagged initial/ghost objects
    const rosterValues = new Set();
    if (Array.isArray(roster)) {
      roster.forEach((r) => {
        if (r.playerName) rosterValues.add(r.playerName.trim().toUpperCase());
        if (r.playerNumber) rosterValues.add(r.playerNumber.trim());
        if (r.frontPlayerName) rosterValues.add(r.frontPlayerName.trim().toUpperCase());
        if (r.frontPlayerNumber) rosterValues.add(r.frontPlayerNumber.trim());
      });
    }
    if (jerseyPlayerName) rosterValues.add(jerseyPlayerName.trim().toUpperCase());
    if (jerseyPlayerNumber) rosterValues.add(jerseyPlayerNumber.trim());

    const rosterObjects = canvas.getObjects().filter((obj) => {
      if (!obj) return false;
      // 1. Check explicit custom roster/jersey flags
      if (
        obj.isRosterName === true ||
        obj.isRosterNumber === true ||
        obj.isJerseyText === true ||
        obj.isJerseyName === true ||
        obj.isJerseyNumber === true
      ) {
        return true;
      }
      // 2. If bulk roster is active, also clear text objects matching roster text values to eliminate initial ghost objects
      if (isBulkRoster && (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text")) {
        const textVal = (obj.text || "").trim().toUpperCase();
        if (textVal && rosterValues.has(textVal)) {
          return true;
        }
      }
      return false;
    });

    if (rosterObjects.length === 0) return;
    rosterObjects.forEach((obj) => canvas.remove(obj));
    canvas.renderAll();
    if (view) manualTriggerSync?.(view);
  };

  const clearRosterObjectsFromCanvas = clearRosterTextLayers;

  const ensureRosterObjectsForCanvas = (cv, nameVal, numVal, view = "back", customNameStyle = null, customNumStyle = null) => {
    if (!cv || typeof cv.getObjects !== "function") return { nameObj: null, numObj: null };
    
    // Explicitly purge and destroy all existing active player text layers first
    clearRosterTextLayers(cv, view);

    const cx = cv.width ? cv.width / 2 : 150;
    const cy = cv.height ? cv.height / 2 : 200;

    const trimmedName = (nameVal || "").trim().toUpperCase();
    const trimmedNum = (numVal || "").trim();

    let nameObj = null;
    let numObj = null;

    // Fallback Hierarchy: In "Custom per Player" (individual) mode, fallback to clean base defaults if custom style is unset,
    // avoiding inheriting modified styles/scale factors from other players.
    const baseDefaultNameStyle = { scaleX: 1, scaleY: 1, fontSize: 28 };
    const baseDefaultNumStyle = { scaleX: 1, scaleY: 1, fontSize: 54 };

    const rawNameStyle = rosterDesignMode === "uniform"
      ? (sharedRosterStyle.nameStyle || baseDefaultNameStyle)
      : (customNameStyle || baseDefaultNameStyle);

    const rawNumStyle = rosterDesignMode === "uniform"
      ? (sharedRosterStyle.numStyle || baseDefaultNumStyle)
      : (customNumStyle || baseDefaultNumStyle);

    const effectiveNameStyle = { ...rawNameStyle };
    const effectiveNumStyle = { ...rawNumStyle };

    if (trimmedName) {
      const targetFontSize = effectiveNameStyle.fontSize || 28;
      const targetScaleX = effectiveNameStyle.scaleX !== undefined ? effectiveNameStyle.scaleX : 1;
      nameObj = new fabric.IText(trimmedName, {
        left: cx,
        top: trimmedNum ? cy - 45 : cy,
        originX: "center",
        originY: "center",
        fontFamily: "Impact",
        fontSize: targetFontSize,
        fill: "#000000",
        ...effectiveNameStyle,
        scaleX: targetScaleX,
        scaleY: 1,
        text: trimmedName,
        isRosterName: true,
        isJerseyText: true,
      });
      nameObj.set({
        scaleX: targetScaleX,
        scaleY: 1,
        fontSize: targetFontSize,
      });
      nameObj.setCoords();
      cv.add(nameObj);
      recalculateTextCurve(nameObj);
    }

    if (trimmedNum) {
      const targetFontSize = effectiveNumStyle.fontSize || 54;
      const targetScaleX = effectiveNumStyle.scaleX !== undefined ? effectiveNumStyle.scaleX : 1;
      numObj = new fabric.IText(trimmedNum, {
        left: cx,
        top: trimmedName ? cy + 45 : cy,
        originX: "center",
        originY: "center",
        fontFamily: "Impact",
        fontSize: targetFontSize,
        fill: "#000000",
        ...effectiveNumStyle,
        scaleX: targetScaleX,
        scaleY: 1,
        text: trimmedNum,
        isRosterNumber: true,
        isJerseyText: true,
      });
      numObj.set({
        scaleX: targetScaleX,
        scaleY: 1,
        fontSize: targetFontSize,
      });
      numObj.setCoords();
      cv.add(numObj);
      recalculateTextCurve(numObj);
    }

    cv.renderAll();
    if (view) manualTriggerSync?.(view);
    return { nameObj, numObj };
  };

  const syncRosterToCanvases = (player, side = rosterPlacementSide) => {
    // Purge existing roster text layers on all canvases first
    if (frontCanvas) clearRosterTextLayers(frontCanvas, "front");
    if (backCanvas) clearRosterTextLayers(backCanvas, "back");

    if (!player || !isBulkRoster) return;

    const backName = (player.playerName || "").trim();
    const backNum = (player.playerNumber || "").trim();

    const frontName = (player.frontPlayerName !== undefined && player.frontPlayerName !== null && player.frontPlayerName !== "")
      ? player.frontPlayerName.trim()
      : backName;
    const frontNum = (player.frontPlayerNumber !== undefined && player.frontPlayerNumber !== null && player.frontPlayerNumber !== "")
      ? player.frontPlayerNumber.trim()
      : backNum;

    const nameStyle = rosterDesignMode === "uniform"
      ? (sharedRosterStyle.nameStyle || player.nameStyle || null)
      : (player.nameStyle || null);
    const numStyle = rosterDesignMode === "uniform"
      ? (sharedRosterStyle.numStyle || player.numStyle || null)
      : (player.numStyle || null);

    if (side === "back") {
      if (backCanvas) {
        ensureRosterObjectsForCanvas(backCanvas, backName, backNum, "back", nameStyle, numStyle);
      }
    } else if (side === "front") {
      if (frontCanvas) {
        ensureRosterObjectsForCanvas(frontCanvas, frontName, frontNum, "front", nameStyle, numStyle);
      }
    } else if (side === "both") {
      if (frontCanvas) ensureRosterObjectsForCanvas(frontCanvas, frontName, frontNum, "front", nameStyle, numStyle);
      if (backCanvas) ensureRosterObjectsForCanvas(backCanvas, backName, backNum, "back", nameStyle, numStyle);
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
    const currentCv = selectedView === "front" ? frontCanvas : backCanvas;
    if (currentCv) {
      saveCanvasRosterStyle(currentCv);
    }

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

    setJerseyPlayerName(backName || frontName || "");
    setJerseyPlayerNumber(backNum || frontNum || "");
    setProductSize(sizeVal);
    if (rosterPlacementSide !== "both") {
      setSelectedView(rosterPlacementSide);
    }

    syncRosterToCanvases(player, rosterPlacementSide);

    const displayName = (rosterPlacementSide === "front" ? frontName : backName) || "Player";
    const displayNum = (rosterPlacementSide === "front" ? frontNum : backNum) || "";
    toast.success(`Previewing Player #${index + 1}: ${displayName} ${displayNum ? "#" + displayNum : ""}`);
  };

  const handleUpdateRosterRow = (index, field, value) => {
    setRoster((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [field]: value };
        if (["playerName", "playerNumber", "frontPlayerName", "frontPlayerNumber", "size"].includes(field)) {
          delete updated.calculatedPrice;
          delete updated.inkCoveragePrice;
        }
        return updated;
      })
    );

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

  const [mobileMainView, setMobileMainView] = useState("editor");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [showCostingModal, setShowCostingModal] = useState(false);
  const [showObjectInspectorModal, setShowObjectInspectorModal] = useState(false);
  const [mobileInspectedObject, setMobileInspectedObject] = useState(null);

  const handleMobileToggleView = () => {
    setMobileMainView((v) => (v === "editor" ? "preview" : "editor"));
    setMobileSheetOpen(false);
  };

  const handleMobileTabTap = (tabId) => {
    if (mobileSheetOpen && activeTab === tabId) {
      setMobileSheetOpen(false);
    } else {
      setActiveTab(tabId);
      setMobileSheetOpen(true);
      setMobileMainView("editor");
    }
  };

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

  useEffect(() => {
    if (selectedObject) {
      setMobileInspectedObject(selectedObject);
    }
  }, [selectedObject]);

  const { resetCanvases } = useCanvas();
  const resetHistory = useCustomizerStore((state) => state.resetHistory);

  const clearDesignerStorage = () => {
    const views = ["front", "back", "left", "right", "pocket", "hood"];
    views.forEach((v) => {
      try {
        localStorage.removeItem(`tshirt-designer-${v}`);
      } catch (e) { }
    });
  };

  const lastApparelIdRef = useRef(null);
  const lastCurrentProductRef = useRef(null);

  useEffect(() => {
    if (apparelId && lastApparelIdRef.current !== null && apparelId !== lastApparelIdRef.current) {
      clearDesignerStorage();
      resetCanvases();
      resetHistory();
      setJerseyPlayerName("");
      setJerseyPlayerNumber("");
    }
  }, [apparelId, resetCanvases, resetHistory, setJerseyPlayerName, setJerseyPlayerNumber]);

  useEffect(() => {
    const isInitial = lastApparelIdRef.current === null && lastCurrentProductRef.current === null;
    const apparelIdChanged = apparelId !== lastApparelIdRef.current;
    const currentProductChanged = currentProduct !== lastCurrentProductRef.current;

    if (isInitial) {
      if (apparelId && apparelConfig[apparelId] && apparelId !== currentProduct) {
        setCurrentProduct(apparelId);
        setSelectedView(apparelConfig[apparelId].supportedViews[0]);
      }
    } else {
      if (apparelIdChanged) {
        if (apparelId && apparelConfig[apparelId] && apparelId !== currentProduct) {
          setCurrentProduct(apparelId);
          setSelectedView(apparelConfig[apparelId].supportedViews[0]);
        }
      } else if (currentProductChanged) {
        if (currentProduct && currentProduct !== apparelId) {
          navigate(`/coustom-product-tshirt/${currentProduct}`, { replace: true });
        }
      }
    }

    lastApparelIdRef.current = apparelId;
    lastCurrentProductRef.current = currentProduct;
  }, [apparelId, currentProduct, navigate, setCurrentProduct, setSelectedView]);

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

  // Explicitly clear/re-render roster text layers when view (FRONT/BACK), active player, or roster placement changes
  useEffect(() => {
    if (!isBulkRoster) {
      if (frontCanvas) clearRosterTextLayers(frontCanvas, "front");
      if (backCanvas) clearRosterTextLayers(backCanvas, "back");
      return;
    }

    const activeIndex = activePreviewIndex !== null ? activePreviewIndex : 0;
    const activePlayer = roster[activeIndex];
    if (activePlayer) {
      syncRosterToCanvases(activePlayer, rosterPlacementSide);
    } else {
      if (frontCanvas) clearRosterTextLayers(frontCanvas, "front");
      if (backCanvas) clearRosterTextLayers(backCanvas, "back");
    }
  }, [
    selectedView,
    activePreviewIndex,
    rosterPlacementSide,
    isBulkRoster,
    roster.length,
    frontCanvas,
    backCanvas
  ]);

  // Save custom styling when a roster object modification finishes on canvas
  useEffect(() => {
    const handleCanvasObjectModified = (e) => {
      const cv = e.target?.canvas;
      if (cv) {
        const target = e.target;
        if (target && (target.isRosterName === true || target.isRosterNumber === true)) {
          const scaleY = target.scaleY || 1;
          const scaleX = target.scaleX || 1;
          if (scaleY !== 1) {
            const baseFontSize = target.fontSize || (target.isRosterName ? 28 : 54);
            const newFontSize = Math.max(8, Math.round(baseFontSize * scaleY));
            const newScaleX = scaleY !== 0 ? scaleX / scaleY : scaleX;
            target.set({
              fontSize: newFontSize,
              scaleX: newScaleX,
              scaleY: 1,
            });
            target.setCoords();
          }
          saveCanvasRosterStyle(cv);
        }
      }
    };

    if (frontCanvas) {
      frontCanvas.on("object:modified", handleCanvasObjectModified);
    }
    if (backCanvas) {
      backCanvas.on("object:modified", handleCanvasObjectModified);
    }

    return () => {
      if (frontCanvas) {
        frontCanvas.off("object:modified", handleCanvasObjectModified);
      }
      if (backCanvas) {
        backCanvas.off("object:modified", handleCanvasObjectModified);
      }
    };
  }, [frontCanvas, backCanvas, saveCanvasRosterStyle]);

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
        snapshot[v] = cv.getObjects().filter(o => o.selectable !== false).map(o => o.toJSON(["isRosterName", "isRosterNumber", "isJerseyText", "isJerseyName", "isJerseyNumber"]));
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
            objects.forEach((obj, idx) => {
              const item = data[idx];
              if (item) {
                if (item.isRosterName) obj.isRosterName = item.isRosterName;
                if (item.isRosterNumber) obj.isRosterNumber = item.isRosterNumber;
                if (item.isJerseyText) obj.isJerseyText = item.isJerseyText;
                if (item.isJerseyName) obj.isJerseyName = item.isJerseyName;
                if (item.isJerseyNumber) obj.isJerseyNumber = item.isJerseyNumber;
              }
              if (obj.type === "image") {
                obj.set({ crossOrigin: "anonymous" });
                const el = obj.getElement();
                if (el) el.crossOrigin = "anonymous";
              }
              cv.add(obj);
            });
            cv.renderAll();
            cv.fire("object:modified");
            if (manualTriggerSync) manualTriggerSync(v);
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
  }, [performUndo, frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas]);

  const handleRedo = useCallback(() => {
    const next = performRedo(getCanvasStateSnapshot);
    if (next) applySnapshot(next);
  }, [performRedo, frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeCanvas) return;
      const activeObj = activeCanvas.getActiveObject();

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
      return url;
    }
  };

  const createBlankCanvasDataUrl = (width = 400, height = 500) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    return canvas.toDataURL("image/png");
  };

  const exportCanvasViewDataUrl = (cv, backgroundColor = null, width = 600, height = 800) => {
    if (!cv) {
      return null;
    }

    try {
      if (cv.renderAll) {
        cv.renderAll();
      }

      let dataUrl = withGuidesHidden(cv, () =>
        cv.toDataURL({ format: "png", multiplier: 0.6 })
      );

      if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
        return null;
      }

      return dataUrl;
    } catch (err) {
      console.warn("Failed to export canvas view Data URL:", err);
      return null;
    }
  };

  const captureCustomizationForCurrentState = async () => {
    // 1. Build the design snapshot JSON
    const designSnapshot = getCanvasStateSnapshot();

    // 2. Generate 2D Fabric canvas preview images & production files
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

    for (const [view, cv] of Object.entries(canvasMap)) {
      const hasContent = cv && cv.getObjects().filter((o) => o.selectable !== false).length > 0;
      if (hasContent) {
        const dataUrl = exportCanvasViewDataUrl(cv, productColor || "#FFFFFF");
        if (dataUrl) previews[view] = dataUrl;
      }
    }

    productionFiles.frontPrintUrl = previews.front || createBlankCanvasDataUrl(productColor || "#FFFFFF");
    if (previews.back) productionFiles.backPrintUrl = previews.back;
    if (previews.left) productionFiles.leftSleevePrintUrl = previews.left;
    if (previews.right) productionFiles.rightSleevePrintUrl = previews.right;

    // 3D WebGL Canvas snapshot
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

    if (!previews.front || typeof previews.front !== "string" || !previews.front.startsWith("data:image/")) {
      const blankFront = createBlankCanvasDataUrl(productColor || "#FFFFFF");
      previews.front = blankFront;
      productionFiles.frontPrintUrl = blankFront;
    }

    // 3. Build print areas array
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
                width: Math.round(obj.width || 0),
                height: Math.round(obj.height || 0),
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

    return { designSnapshot, previews, productionFiles, printAreas };
  };

  const uploadAndSubmitCustomization = async ({
    designSnapshot,
    previews,
    productionFiles,
    printAreas,
    playerSize,
    rosterEntry,
    isBulk,
  }) => {
    const CLOTHING_TYPE_MAP = {
      "half-sleeve": "half_sleeve_t_shirt",
      "long-sleeve": "long_sleeve_t_shirt",
      oversized: "oversized_t_shirt",
      hoodie: "hoodie",
      "sports-jersey": "sports_jersey",
    };
    const clothingTypeKey = CLOTHING_TYPE_MAP[currentProduct] || currentProduct;

    const ensureDataUrl = async (str) => {
      if (!str || typeof str !== "string") return str;
      if (str.startsWith("blob:")) {
        try {
          const response = await fetch(str);
          const blob = await response.blob();
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.error("Failed to convert blob URL to Data URL:", e);
          return str;
        }
      }
      return str;
    };

    const isBase64DataUrl = (str) => {
      if (!str || typeof str !== "string") return false;
      return (
        str.startsWith("data:image/") ||
        str.startsWith("data:application/") ||
        str.startsWith("blob:") ||
        /^data:[a-zA-Z0-9+\/]+;base64,/.test(str)
      );
    };

    const uploadMap = new Map();

    const uploadBase64Parallel = async (base64Str, folder = "mojilo/previews") => {
      if (!isBase64DataUrl(base64Str)) return base64Str;

      if (!uploadMap.has(base64Str)) {
        const promise = (async () => {
          const dataUrl = await ensureDataUrl(base64Str);
          if (!dataUrl || typeof dataUrl !== "string" || (!dataUrl.startsWith("data:") && !dataUrl.startsWith("http"))) {
            console.warn("Skipping upload for invalid data URL:", dataUrl);
            return base64Str;
          }
          const res = await api.post("/uploads/base64", { base64: dataUrl, folder });
          const url = res.data?.data?.url || res.data?.url;
          if (url && typeof url === "string" && !isBase64DataUrl(url)) {
            return url;
          }
          throw new Error("Invalid Cloudinary URL returned");
        })().catch((err) => {
          console.error("Cloudinary Upload Error:", err);
          throw err;
        });
        uploadMap.set(base64Str, promise);
      }
      return uploadMap.get(base64Str);
    };

    const uploadTasks = [];

    // A. Previews
    const uploadedPreviews = { ...previews };
    for (const [key, val] of Object.entries(previews)) {
      if (isBase64DataUrl(val)) {
        uploadTasks.push(
          uploadBase64Parallel(val, "mojilo/previews").then((url) => {
            uploadedPreviews[key] = url;
          })
        );
      }
    }

    // B. Production Files
    const uploadedProductionFiles = { ...productionFiles };
    for (const [key, val] of Object.entries(productionFiles)) {
      if (isBase64DataUrl(val)) {
        uploadTasks.push(
          uploadBase64Parallel(val, "mojilo/production").then((url) => {
            uploadedProductionFiles[key] = url;
          })
        );
      }
    }

    // C. Print Areas Layer Images
    const uploadedPrintAreas = JSON.parse(JSON.stringify(printAreas));
    for (const area of uploadedPrintAreas) {
      if (Array.isArray(area.layers)) {
        for (const layer of area.layers) {
          if (layer.imageConfig) {
            if (isBase64DataUrl(layer.imageConfig.src)) {
              uploadTasks.push(
                uploadBase64Parallel(layer.imageConfig.src, "mojilo/layers").then((url) => {
                  layer.imageConfig.src = url;
                })
              );
            }
            if (isBase64DataUrl(layer.imageConfig.originalUrl)) {
              uploadTasks.push(
                uploadBase64Parallel(layer.imageConfig.originalUrl, "mojilo/layers").then((url) => {
                  layer.imageConfig.originalUrl = url;
                })
              );
            }
            if (isBase64DataUrl(layer.imageConfig.processedUrl)) {
              uploadTasks.push(
                uploadBase64Parallel(layer.imageConfig.processedUrl, "mojilo/layers").then((url) => {
                  layer.imageConfig.processedUrl = url;
                })
              );
            }
          }
        }
      }
    }

    // D. Design Snapshot JSON Assets
    const uploadedDesignSnapshot = designSnapshot ? JSON.parse(JSON.stringify(designSnapshot)) : null;
    if (uploadedDesignSnapshot && typeof uploadedDesignSnapshot === "object") {
      const traverseAndUpload = (target) => {
        if (!target || typeof target !== "object") return;
        if (Array.isArray(target)) {
          target.forEach((item) => traverseAndUpload(item));
          return;
        }
        for (const [key, val] of Object.entries(target)) {
          if (isBase64DataUrl(val)) {
            uploadTasks.push(
              uploadBase64Parallel(val, "mojilo/canvas_assets").then((url) => {
                target[key] = url;
              })
            );
          } else if (val && typeof val === "object") {
            traverseAndUpload(val);
          }
        }
      };
      traverseAndUpload(uploadedDesignSnapshot);
    }

    // Wait for all Cloudinary uploads for this customization
    if (uploadTasks.length > 0) {
      await Promise.all(uploadTasks);
    }

    // Send customization payload to backend
    const customRes = await api.post(
      "/customizations",
      {
        productId: null,
        variantId: null,
        selectedColor: productColor,
        selectedSize: playerSize,
        editableDesignJSON: uploadedDesignSnapshot,
        previews: uploadedPreviews,
        productionFiles: uploadedProductionFiles,
        printAreas: uploadedPrintAreas,
        baseTemplateId: currentProduct,
        productType: currentProduct,
        clothingType: productConfig.name,
        isBulkRoster: isBulk,
        roster: rosterEntry ? [rosterEntry] : [],
      },
      { timeout: 60000 }
    );

    const customizationId = customRes.data?.data?._id;
    if (!customizationId) {
      throw new Error("Failed to save customization design. Please try again.");
    }

    // Add custom template item to cart
    await addCustomTemplateToCart(
      customizationId,
      clothingTypeKey,
      playerSize || "M",
      productColor || "#FFFFFF",
      1
    );
  };

  // 🟢 STRICT BASE64 SANITIZATION & PARALLEL UPLOAD TO CLOUDINARY
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    if (addingToCart) return;
    setAddingToCart(true);

    try {
      if (isBulkRoster) {
        const cleanedRoster = roster
          .map((r) => ({
            playerName: (r.playerName || "").trim(),
            playerNumber: (r.playerNumber || "").trim(),
            size: r.size || productSize || "M",
            frontPlayerName: (r.frontPlayerName || "").trim(),
            frontPlayerNumber: (r.frontPlayerNumber || "").trim(),
            nameStyle: r.nameStyle || null,
            numStyle: r.numStyle || null,
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

        setCartLoaderState({
          isLoading: true,
          isSuccess: false,
          isError: false,
          message: `Preparing customized designs for ${cleanedRoster.length} roster players...`,
        });

        // 1. Loop through cleanedRoster, sync canvas text layers for each player, and capture customization data
        const playerCapturedPayloads = [];
        for (let i = 0; i < cleanedRoster.length; i++) {
          const player = cleanedRoster[i];
          setCartLoaderState({
            isLoading: true,
            isSuccess: false,
            isError: false,
            message: `Rendering player ${i + 1} of ${cleanedRoster.length}: ${player.playerName || 'Player ' + (i + 1)}...`,
          });

          // Sync player roster text layers onto canvas
          syncRosterToCanvases(player, rosterPlacementSide);

          // Await micro-tick / frame flush (80ms) so Fabric.js finishes updating text objects before exporting data URLs
          await new Promise((r) => setTimeout(r, 80));

          const captured = await captureCustomizationForCurrentState();
          playerCapturedPayloads.push({
            player,
            playerSize: player.size || productSize || "M",
            ...captured,
          });
        }

        // Restore canvas view to active preview player
        const activeIdx = activePreviewIndex !== null ? activePreviewIndex : 0;
        const activePlayer = roster[activeIdx] || cleanedRoster[0];
        if (activePlayer) syncRosterToCanvases(activePlayer, rosterPlacementSide);

        // 2. Upload assets and add each roster item to cart in parallel
        setCartLoaderState({
          isLoading: true,
          isSuccess: false,
          isError: false,
          message: `Uploading designs and adding ${playerCapturedPayloads.length} roster items to cart...`,
        });

        const uploadAndSubmitTasks = playerCapturedPayloads.map((item) =>
          uploadAndSubmitCustomization({
            designSnapshot: item.designSnapshot,
            previews: item.previews,
            productionFiles: item.productionFiles,
            printAreas: item.printAreas,
            playerSize: item.playerSize,
            rosterEntry: {
              playerName: item.player.playerName,
              playerNumber: item.player.playerNumber,
              size: item.playerSize,
            },
            isBulk: true,
          })
        );

        await Promise.all(uploadAndSubmitTasks);

        setCartLoaderState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          message: `Added ${playerCapturedPayloads.length} roster items to cart!`,
        });
        toast.success(`Successfully added ${playerCapturedPayloads.length} customized roster items to cart!`);
        window.setTimeout(() => navigate("/cart"), 1200);
      } else {
        // Standard single item customizer flow
        setCartLoaderState({
          isLoading: true,
          isSuccess: false,
          isError: false,
          message: "Preparing and uploading your custom design...",
        });

        const captured = await captureCustomizationForCurrentState();
        await uploadAndSubmitCustomization({
          designSnapshot: captured.designSnapshot,
          previews: captured.previews,
          productionFiles: captured.productionFiles,
          printAreas: captured.printAreas,
          playerSize: productSize || "M",
          rosterEntry: null,
          isBulk: false,
        });

        setCartLoaderState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          message: "Added to Cart!",
        });
        window.setTimeout(() => navigate("/cart"), 1200);
      }
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
  const presetTshirtColors = liveTemplate?.availableColors?.length
    ? liveTemplate.availableColors
    : FALLBACK_COLORS;
  const tshirtSizes = (liveTemplate?.sizes ?? FALLBACK_SIZES).filter((s) => s.enabled);

  const productConfig = apparelConfig[currentProduct] || apparelConfig["half-sleeve"];
  const ActiveModelMesh = productConfig.modelComponent;

  const shouldMountPreview = !isMobile || mobileMainView === "preview";
  const shouldMountEditor = true;
  const shouldMountTools = !isMobile || mobileSheetOpen;

  const viewLabel = (selectedView || "front").charAt(0).toUpperCase() + (selectedView || "front").slice(1);

  const toolTabContent = (
    <div key={activeTab} className="animate-in fade-in slide-in-from-left-2 duration-300">
      {activeTab === "apparel" && (
        <div className="space-y-5">
          <ProductSelector />

          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Palette className="h-4 w-4" /> Fabric Color
            </div>
            <div className="flex flex-wrap gap-2">
              {presetTshirtColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setProductColor(color)}
                  className={`w-7 h-7 rounded-full border shadow-inner transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${productColor === color
                    ? "border-[#997241] ring-2 ring-[#997241] ring-offset-1 dark:ring-offset-slate-800 dark:ring-[#997241] scale-110"
                    : "border-slate-200 dark:border-slate-600"
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Garment Size</div>
            <div className="flex flex-wrap gap-1.5">
              {tshirtSizes.map((sz) => {
                const sizeLabel = typeof sz === "string" ? sz : sz.size;
                const priceAddon = typeof sz === "object" ? (sz.priceAddon ?? 0) : 0;
                const isSelected = productSize === sizeLabel;
                return (
                  <button
                    key={sizeLabel}
                    onClick={() => setProductSize(sizeLabel)}
                    title={priceAddon > 0 ? `₹${priceAddon} for ${sizeLabel}` : sizeLabel}
                    className={`relative w-9 h-8 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95 ${isSelected
                        ? "bg-[#997241] border-[#997241] text-white shadow-md shadow-[#997241]/30"
                        : "bg-white border-slate-200 dark:bg-slate-700 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:border-[#997241]/50 hover:bg-[#997241]/5 dark:hover:bg-slate-600"
                      }`}
                  >
                    {sizeLabel}
                    {priceAddon > 0 && (
                      <span className="absolute -top-1.5 -right-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50 px-0.5 rounded leading-none">
                        {priceAddon}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#997241] shrink-0" />
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
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 dark:after:border-slate-600 peer-checked:bg-[#997241] transition-colors duration-300"></div>
              </label>
            </div>

            {isBulkRoster && (
              <div className="space-y-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#997241]">
                  <span>Roster List ({roster.length} Players)</span>
                  <span className="text-[10px] bg-[#997241]/10 dark:bg-[#997241]/20 text-[#997241] px-2 py-0.5 rounded font-mono font-bold">
                    Qty: {roster.length}
                  </span>
                </div>

                <div className="p-2 bg-[#997241]/5 dark:bg-[#997241]/10 border border-[#997241]/20 dark:border-[#997241]/30 rounded-lg space-y-2">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Design Styling Mode
                    </div>
                    <div className="grid grid-cols-2 gap-1 bg-white dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setRosterDesignMode("uniform");
                          const activeIdx = activePreviewIndex !== null ? activePreviewIndex : 0;
                          if (roster[activeIdx]) syncRosterToCanvases(roster[activeIdx], rosterPlacementSide);
                        }}
                        className={`py-1 px-1.5 text-[10px] font-bold rounded transition-all duration-200 cursor-pointer text-center ${rosterDesignMode === "uniform"
                            ? "bg-[#997241] text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        title="Apply same font, color, position & styling across all roster players (Default)"
                      >
                        Same for All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRosterDesignMode("individual");
                          const activeIdx = activePreviewIndex !== null ? activePreviewIndex : 0;
                          if (roster[activeIdx]) syncRosterToCanvases(roster[activeIdx], rosterPlacementSide);
                        }}
                        className={`py-1 px-1.5 text-[10px] font-bold rounded transition-all duration-200 cursor-pointer text-center ${rosterDesignMode === "individual"
                            ? "bg-[#997241] text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        title="Allow custom font, color & styling per individual player"
                      >
                        Custom per T-shirt
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Print Placement
                    </div>
                    <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleSetRosterSide("back")}
                        className={`py-1 px-2 text-[10px] font-bold rounded transition-all duration-200 cursor-pointer ${rosterPlacementSide === "back"
                            ? "bg-[#997241] text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                      >
                        Back Side
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {roster.map((player, idx) => {
                    const isPreviewing = activePreviewIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg space-y-2 text-xs relative group shadow-sm transition-all duration-300 border ${isPreviewing
                            ? "bg-[#997241]/5 dark:bg-[#997241]/10 border-[#997241] ring-1 ring-[#997241]/30"
                            : "bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600"
                          }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span className="flex items-center gap-1.5">
                            T-shirt  #{idx + 1}
                            {/* {isPreviewing && (
                              // <span className="bg-[#997241] text-white text-[8px] px-1.5 py-0.2 rounded font-semibold tracking-normal uppercase animate-in fade-in duration-300">
                              //   Active Preview
                              // </span>
                            )} */}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePreviewPlayer(idx)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${isPreviewing
                                  ? "bg-[#997241] text-white shadow-sm"
                                  : "bg-slate-100 hover:bg-[#997241]/10 dark:bg-slate-800 dark:hover:bg-[#997241]/15 text-slate-600 dark:text-slate-300 hover:text-[#997241]"
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
                                className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-0.5 rounded transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                                title="Remove player"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {rosterPlacementSide === "both" ? (
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-12 gap-1.5 items-center">
                              <div className="col-span-2 text-[9px] font-bold text-[#997241] uppercase">Back:</div>
                              <div className="col-span-4">
                                <input
                                  type="text"
                                  placeholder="Back Name (Opt)"
                                  value={player.playerName || ""}
                                  onChange={(e) => handleUpdateRosterRow(idx, "playerName", e.target.value)}
                                  className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium transition-colors duration-200 focus:border-[#997241] outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <div className="col-span-3">
                                <input
                                  type="text"
                                  placeholder="No. (#)"
                                  value={player.playerNumber || ""}
                                  onChange={(e) => handleUpdateRosterRow(idx, "playerNumber", e.target.value.slice(0, 3))}
                                  className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold transition-colors duration-200 focus:border-[#997241] outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <div className="col-span-3">
                                <select
                                  value={player.size || productSize || "M"}
                                  onChange={(e) => handleUpdateRosterRow(idx, "size", e.target.value)}
                                  className="w-full h-7 px-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold transition-colors duration-200 focus:border-[#997241] outline-none text-slate-800 dark:text-slate-100"
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

                            <div className="grid grid-cols-12 gap-1.5 items-center">
                              <div className="col-span-2 text-[9px] font-bold text-[#997241] uppercase">Front:</div>
                              <div className="col-span-5">
                                <input
                                  type="text"
                                  placeholder="Front Name (Opt)"
                                  value={player.frontPlayerName ?? ""}
                                  onChange={(e) => handleUpdateRosterRow(idx, "frontPlayerName", e.target.value)}
                                  className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium transition-colors duration-200 focus:border-[#997241] outline-none text-slate-800 dark:text-slate-100"
                                />
                              </div>
                              <div className="col-span-5">
                                <input
                                  type="text"
                                  placeholder="Front No. (#) (Opt)"
                                  value={player.frontPlayerNumber ?? ""}
                                  onChange={(e) => handleUpdateRosterRow(idx, "frontPlayerNumber", e.target.value.slice(0, 3))}
                                  className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold transition-colors duration-200 focus:border-[#997241] outline-none text-slate-800 dark:text-slate-100"
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
                                className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium transition-colors duration-200 focus:border-[#997241] outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="text"
                                placeholder="No. (#)"
                                value={rosterPlacementSide === "front" ? (player.frontPlayerNumber ?? player.playerNumber ?? "") : (player.playerNumber ?? "")}
                                onChange={(e) => handleUpdateRosterRow(idx, rosterPlacementSide === "front" ? "frontPlayerNumber" : "playerNumber", e.target.value.slice(0, 3))}
                                className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold transition-colors duration-200 focus:border-[#997241] outline-none text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div className="col-span-4">
                              <select
                                value={player.size || productSize || "M"}
                                onChange={(e) => handleUpdateRosterRow(idx, "size", e.target.value)}
                                className="w-full h-7 px-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold transition-colors duration-200 focus:border-[#997241] outline-none text-slate-800 dark:text-slate-100"
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
                  className="w-full py-2 bg-[#997241]/10 dark:bg-[#997241]/15 hover:bg-[#997241]/20 dark:hover:bg-[#997241]/25 border border-[#997241]/30 dark:border-[#997241]/40 rounded-lg text-xs font-bold text-[#7c5c34] dark:text-[#c2a274] flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" /> + Add T-shirt to Roster
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

  const [authBannerDismissed, setAuthBannerDismissed] = useState(false);
  const showAuthBanner = !isAuthenticated && !authBannerDismissed;

  return (
    <div className={`h-screen flex flex-col font-sans antialiased overflow-hidden ${isDarkMode ? "bg-slate-900 text-slate-100 dark" : "bg-slate-50 text-slate-800"
      }`}>
      <style>{`
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 4px 14px rgba(153,114,65,0.25); }
          50%       { box-shadow: 0 4px 22px rgba(153,114,65,0.5); }
        }
        @keyframes tabIndicatorIn {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      {showAuthBanner && (
        <div
          role="alert"
          className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5
            bg-gradient-to-r from-amber-800 via-orange-800 to-amber-800
            text-white text-xs font-semibold shadow-md z-50
            animate-[slideDown_0.35s_cubic-bezier(0.16,1,0.3,1)_both]"
        >
          <style>{`
            @keyframes slideDown {
              from { transform: translateY(-110%); opacity: 0; }
              to   { transform: translateY(0);     opacity: 1; }
            }
          `}</style>

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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:bg-white/40
                border border-white/30 rounded-lg text-[11px] font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </button>
            <button
              onClick={() => setAuthBannerDismissed(true)}
              aria-label="Dismiss login reminder"
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/20 active:bg-white/30 transition-all duration-200 hover:rotate-90 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className="h-14 border-b shrink-0 flex items-center justify-between gap-2 px-2 sm:px-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-30 shadow-sm transition-colors overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => navigate("/custom")}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-[#997241]/10 hover:text-[#997241] border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 transition-all duration-200 hover:-translate-x-0.5 cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div className="min-w-0 ">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider truncate">Design Studio</h1>
            <p className="text-[10px] font-bold text-[#997241] uppercase tracking-widest leading-none mt-0.5 truncate">Mojilo Customizer</p>
          </div>
        </div>
        <Link to="/" className="flex justify-start lg:justify-center" onClick={() => setActiveTab('Home')}>
          <img
            src={logo}
            alt="Mojilo"
            className="h-7 sm:h-8 w-auto transition-all duration-200 hover:opacity-80 hover:scale-105"
          />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-[#997241]/10 hover:text-[#997241] dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer shrink-0"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleRedo}
            title="Redo (Ctrl+Y)"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-[#997241]/10 hover:text-[#997241] dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer shrink-0"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {isMobile && mobileMainView === "editor" && (
        <div className="lg:hidden shrink-0 flex items-center justify-between gap-1 px-3 py-2 border-b bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-20">
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
            {(productConfig.supportedViews || ["front", "back"]).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedView === view
                    ? "bg-[#997241] text-white shadow-xs scale-105"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      )}

      {isMobile && mobileMainView === "editor" && (
        <div className="lg:hidden shrink-0 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-[#997241] shrink-0 animate-pulse" />
          <span className="text-xs font-bold text-[#997241] uppercase tracking-wider">
            {viewLabel} Print Area
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden z-10 pb-14 lg:pb-0">
        <div className="hidden lg:flex shrink-0 relative z-30 w-auto h-full border-r bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all overflow-hidden">
          <div className="w-[60px] border-r flex flex-col items-center py-4 gap-4 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shrink-0 overflow-y-auto">
            {TOOL_TABS.map((tab) => {
              const isActive = activeTab === tab.id && leftSidebarOpen;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setLeftSidebarOpen(true);
                  }}
                  title={tab.label}
                  className="relative w-10 h-10 flex items-center justify-center shrink-0"
                >
                  {isActive && (
                    <span
                      className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#997241] origin-center"
                      style={{ animation: "tabIndicatorIn 0.25s ease-out both" }}
                    />
                  )}
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${isActive
                      ? "bg-[#997241] text-white shadow-md shadow-[#997241]/30 scale-[1.05]"
                      : "text-slate-400 hover:bg-[#997241]/10 dark:hover:bg-slate-700 hover:text-[#997241] hover:scale-105"
                      }`}
                  >
                    {tab.icon}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className={`flex flex-col h-full bg-white dark:bg-slate-800 transition-all duration-300 overflow-hidden z-20 border-r border-slate-100 dark:border-slate-700 ${leftSidebarOpen ? "flex-1 lg:w-[380px]" : "w-0"
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

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 shrink-0 space-y-3 bg-white dark:bg-slate-800">
              <PriceCalculator
                isBulkRoster={isBulkRoster}
                rosterCount={roster?.length || 1}
                rosterDesignMode={rosterDesignMode}
                rosterGrandTotal={rosterGrandTotal}
              />
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                style={{ animation: addingToCart ? "none" : "ctaPulse 2.5s ease-in-out infinite" }}
                className="w-full h-11 bg-[#997241] hover:bg-[#7c5c34] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#997241]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Shirt className="h-4.5 w-4.5" />
                Add to Cart & Checkout
              </button>
            </div>
          </div>

          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-12 items-center justify-center rounded-r-xl border-y border-r bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-[#997241] hover:bg-[#997241]/5 z-10 shadow cursor-pointer focus:outline-none transition-all duration-200"
          >
            {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <section
          className={`${isMobile ? (mobileMainView === "preview" ? "block" : "hidden") : "block"
            } flex-1 min-w-0 lg:min-w-[320px] h-full relative z-10 lg:border-r border-slate-200 dark:border-slate-700`}
        >
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <span className="text-[11px] font-bold text-[#997241] bg-white hover:bg-[#997241]/10 dark:bg-[#997241]/15 border border-[#997241]/20 dark:border-[#997241]/30 px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors duration-200">
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
                dpr={isMobile ? [1, 1.5] : undefined}
              />
            </Suspense>
          ) : (
            <PanelSkeleton label="Preview paused" />
          )}
        </section>

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
            <div className="hidden lg:block w-full p-4 pt-0">
              <ObjectInspector />
            </div>
          </div>
        </aside>
      </div>

      <div className="lg:hidden shrink-0 fixed left-0 right-0 bottom-14 z-30 p-3 border-t bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCostingModal(true)}
            className="flex-1 h-11 min-w-0 flex items-center justify-center gap-2 rounded-xl border border-[#997241]/30 dark:border-[#997241]/40 bg-[#997241]/5 dark:bg-[#997241]/10 text-[#7c5c34] dark:text-[#c2a274] font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.97] transition-all duration-200"
          >
            <Calculator className="h-4 w-4" />
            View Costing
          </button>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="h-11 px-4 shrink-0 bg-[#997241] hover:bg-[#7c5c34] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#997241]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
          >
            <Shirt className="h-4.5 w-4.5" />
            Add
          </button>
        </div>
      </div>

      {showCostingModal && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex items-end justify-center bg-black/40 animate-in fade-in duration-200"
          onClick={() => setShowCostingModal(false)}
        >
          <div
            className="w-full max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] p-4 pb-6 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Estimation</span>
              <button
                onClick={() => setShowCostingModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-[#997241]/10 hover:text-[#997241] transition-all duration-200 hover:rotate-90 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <PriceCalculator
              isBulkRoster={isBulkRoster}
              rosterCount={roster?.length || 1}
              rosterDesignMode={rosterDesignMode}
              rosterGrandTotal={rosterGrandTotal}
            />
            <button
              onClick={() => {
                setShowCostingModal(false);
                handleAddToCart();
              }}
              disabled={addingToCart}
              className="w-full h-11 mt-4 bg-[#997241] hover:bg-[#7c5c34] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#997241]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
            >
              <Shirt className="h-4.5 w-4.5" />
              Add to Cart & Checkout
            </button>
          </div>
        </div>
      )}

      {isMobile && (selectedObject || mobileInspectedObject) && mobileMainView === "editor" && (
        <div className="lg:hidden fixed bottom-28 right-4 z-40 flex items-center gap-1.5 p-1 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur border border-slate-700/60 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const targetObj = selectedObject || activeCanvas?.getActiveObject() || mobileInspectedObject;
              if (targetObj) {
                setMobileInspectedObject(targetObj);
                if (activeCanvas && typeof activeCanvas.setActiveObject === "function") {
                  activeCanvas.setActiveObject(targetObj);
                  activeCanvas.renderAll();
                }
              }
              setShowObjectInspectorModal(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#997241] hover:bg-[#7c5c34] text-white rounded-full text-xs font-bold transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer shadow-md"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Inspect</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold uppercase truncate max-w-[80px]">
              {(selectedObject || mobileInspectedObject)?.type}
            </span>
          </button>
          <button
            onClick={() => {
              setMobileInspectedObject(null);
              if (activeCanvas?.discardActiveObject) {
                activeCanvas.discardActiveObject();
                activeCanvas.renderAll();
              }
            }}
            title="Deselect element"
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all duration-200 hover:rotate-90 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {showObjectInspectorModal && isMobile && (
        <div
          className="lg:hidden fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowObjectInspectorModal(false)}
        >
          <div
            className="w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.2)] p-4 pb-8 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <ObjectInspector 
              targetObject={mobileInspectedObject || selectedObject || activeCanvas?.getActiveObject()} 
              onClose={() => setShowObjectInspectorModal(false)} 
            />
          </div>
        </div>
      )}

      <div
        className={`lg:hidden fixed left-0 right-0 bottom-14 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out ${mobileSheetOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
        style={{ maxHeight: "70vh" }}
      >
        <button
          onClick={() => setMobileSheetOpen(false)}
          className="w-full flex flex-col items-center pt-2 pb-1 cursor-pointer"
        >
          <span className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
          <ChevronDown className="h-4 w-4 text-slate-400 mt-1" />
        </button>

        <div className="flex items-center gap-2 px-3 pb-2 overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-700">
          {TOOL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 ${activeTab === tab.id
                ? "bg-[#997241] text-white scale-[1.03] shadow-sm shadow-[#997241]/30"
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

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 z-50 flex items-stretch border-t bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
        <button
          onClick={handleMobileToggleView}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 ${mobileMainView === "preview" && !mobileSheetOpen
            ? "text-[#997241] scale-105"
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
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 ${active ? "text-[#997241] scale-105" : "text-slate-400 dark:text-slate-500"
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



// import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
// import toast from 'react-hot-toast';
// import { Link } from "react-router-dom";
// import logo from '../assets/Logo.png';
// import * as fabric from "fabric";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Layers,
//   Sparkles,
//   Undo2,
//   Redo2,
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   ChevronDown,
//   LayoutGrid ,
//   Shirt,
//   Palette,
//   Maximize2,
//   QrCode,
//   Type,
//   ImagePlus,
//   Wrench,
//   Boxes,
//   PencilRuler,
//   Wand2,
//   Grid3x3,
//   Ruler,
//   Box,
//   Calculator,
//   X,
//   Users,
//   UserPlus,
//   Trash2,
//   Plus,
//   Eye,
//   Move,
//   LogIn,
//   ShieldAlert,
//   Sliders
// } from "lucide-react";

// // Components
// import ThreeDViewer from "../components/ThreeDViewer";
// import CanvasEditor, { withGuidesHidden } from "../components/CanvasEditor";
// import PriceCalculator from "../components/PriceCalculator";
// import ObjectInspector from "../components/ObjectInspector";
// import AIImageGenerator from "../components/AIImageGenerator";
// import ProductSelector from "../components/ProductSelector";
// import QrCodeGenerator from "../components/QrCodeGenerator";
// import TypographyPanel from "../components/TypographyPanel";
// import StickersPanel from "../components/StickersPanel";
// import ShapesPanel from "../components/ShapesPanel";
// import ImageUploadPanel from "../components/ImageUploadPanel";
// import BackgroundRemovalPanel from "../components/BackgroundRemovalPanel";
// import { AddToCartLoader } from "../components/AddtoCartLoader";

// // Store & Context
// import { useCanvas } from "../context/CanvasContext";
// import { useCanvasTextureSync } from "../hooks/useCanvasTextureSync";
// import { useCustomizerStore } from "../store/useCustomizerStore";
// import { useCart } from "../context/CartContext";
// import { useAuth } from "../context/AuthContext";
// import { apparelConfig } from "../utils/apparelConfig";
// import { recalculateTextCurve } from "../utils/textCurveHelper";
// import api from "../lib/axios";

// function useIsMobile(breakpointPx = 1024) {
//   const [isMobile, setIsMobile] = useState(
//     () => typeof window !== "undefined" && window.innerWidth < breakpointPx
//   );

//   useEffect(() => {
//     const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
//     let raf = null;

//     const handleChange = () => {
//       if (raf) cancelAnimationFrame(raf);
//       raf = requestAnimationFrame(() => setIsMobile(mql.matches));
//     };

//     handleChange();
//     mql.addEventListener("change", handleChange);
//     return () => {
//       mql.removeEventListener("change", handleChange);
//       if (raf) cancelAnimationFrame(raf);
//     };
//   }, [breakpointPx]);

//   return isMobile;
// }

// function PanelSkeleton({ label, loading3D }) {
//   if (loading3D) {
//     return (
//       <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div
//             className="absolute inset-0 opacity-30"
//             style={{
//               background: "linear-gradient(105deg, transparent 40%, rgba(139,92,246,0.15) 50%, transparent 60%)",
//               animation: "skeletonShimmer 2s ease-in-out infinite",
//             }}
//           />
//         </div>

//         <div className="relative flex items-center justify-center mb-6">
//           <div
//             className="absolute rounded-full border-2 border-violet-400/20"
//             style={{ width: 110, height: 110, animation: "pingRing 2s ease-out infinite" }}
//           />
//           <div
//             className="absolute rounded-full border-2 border-violet-400/30"
//             style={{ width: 80, height: 80, animation: "pingRing 2s ease-out 0.5s infinite" }}
//           />
//           <div
//             className="absolute rounded-full"
//             style={{
//               width: 64,
//               height: 64,
//               border: "3px solid transparent",
//               borderTopColor: "#7c3aed",
//               borderRightColor: "#a78bfa",
//               animation: "spinArc 1s linear infinite",
//             }}
//           />
//           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
//             style={{ animation: "floatBox 3s ease-in-out infinite" }}
//           >
//             <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
//               <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
//             </svg>
//           </div>
//         </div>

//         <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 tracking-wide">
//           Loading 3D Model
//         </p>
//         <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
//           Preparing your garment…
//         </p>

//         <div className="flex gap-1.5 mt-4">
//           {[0, 1, 2].map((i) => (
//             <div
//               key={i}
//               className="w-1.5 h-1.5 rounded-full bg-violet-400"
//               style={{ animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
//             />
//           ))}
//         </div>

//         <style>{`
//           @keyframes skeletonShimmer {
//             0%   { transform: translateX(-100%); }
//             100% { transform: translateX(200%); }
//           }
//           @keyframes pingRing {
//             0%   { transform: scale(0.8); opacity: 0.7; }
//             80%  { transform: scale(1.2); opacity: 0; }
//             100% { transform: scale(1.2); opacity: 0; }
//           }
//           @keyframes spinArc {
//             to { transform: rotate(360deg); }
//           }
//           @keyframes floatBox {
//             0%, 100% { transform: translateY(0px) rotate(0deg); }
//             50%        { transform: translateY(-6px) rotate(3deg); }
//           }
//           @keyframes bounceDot {
//             0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
//             40%            { transform: scale(1.3); opacity: 1; }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs font-semibold uppercase tracking-widest">
//       {label}
//     </div>
//   );
// }

// const TOOL_TABS = [
//   { id: "apparel", label: "Apparel", icon: <Shirt className="h-5 w-5" /> },
//   { id: "upload", label: "Upload Image", icon: <ImagePlus className="h-5 w-5" /> },
//   { id: "text", label: "Text", icon: <Type className="h-5 w-5" /> },
//   { id: "graphics", label: "Stickers", icon: <LayoutGrid  className="h-5 w-5" /> },
//   { id: "ai", label: "AI Generator", icon: <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20" /> },
//   { id: "qr", label: "QR Code", icon: <QrCode  className="h-5 w-5" /> },
//   { id: "bg-remover", label: "BG Remover", icon: <Wand2 className="h-5 w-5 " /> },
// ];

// const MOBILE_QUICK_TABS = ["apparel", "text", "upload", "graphics"];

// export default function CoustomProductTshirt() {
//   const { apparelId } = useParams();
//   const navigate = useNavigate();
//   const isMobile = useIsMobile();

//   const currentProduct = useCustomizerStore((state) => state.currentProduct);
//   const setCurrentProduct = useCustomizerStore((state) => state.setCurrentProduct);
//   const productColor = useCustomizerStore((state) => state.productColor);
//   const setProductColor = useCustomizerStore((state) => state.setProductColor);
//   const productSize = useCustomizerStore((state) => state.productSize);
//   const setProductSize = useCustomizerStore((state) => state.setProductSize);
//   const selectedView = useCustomizerStore((state) => state.selectedView);
//   const setSelectedView = useCustomizerStore((state) => state.setSelectedView);
//   const isDarkMode = useCustomizerStore((state) => state.isDarkMode);
//   const setIsDarkMode = useCustomizerStore((state) => state.setIsDarkMode);
//   const apparelTemplates = useCustomizerStore((state) => state.apparelTemplates);

//   const performUndo = useCustomizerStore((state) => state.performUndo);
//   const performRedo = useCustomizerStore((state) => state.performRedo);

//   const jerseyPlayerName = useCustomizerStore((state) => state.jerseyPlayerName);
//   const setJerseyPlayerName = useCustomizerStore((state) => state.setJerseyPlayerName);
//   const jerseyPlayerNumber = useCustomizerStore((state) => state.jerseyPlayerNumber);
//   const setJerseyPlayerNumber = useCustomizerStore((state) => state.setJerseyPlayerNumber);

//   const [isBulkRoster, setIsBulkRoster] = useState(false);
//   const [rosterPlacementSide, setRosterPlacementSide] = useState("back");
//   const [rosterDesignMode, setRosterDesignMode] = useState("uniform"); // "uniform" = Same for all, "individual" = Custom per player
//   const [sharedRosterStyle, setSharedRosterStyle] = useState({
//     nameStyle: null,
//     numStyle: null,
//   });
//   const [activePreviewIndex, setActivePreviewIndex] = useState(null);
//   const [roster, setRoster] = useState([
//     { playerName: "", playerNumber: "", size: "M", nameStyle: null, numStyle: null }
//   ]);

//   const handleAddRosterRow = () => {
//     setRoster((prev) => [
//       ...prev,
//       { playerName: "", playerNumber: "", size: productSize || "M", nameStyle: null, numStyle: null }
//     ]);
//   };

//   const handleRemoveRosterRow = (index) => {
//     setRoster((prev) => prev.filter((_, i) => i !== index));
//     if (activePreviewIndex === index) {
//       setActivePreviewIndex(null);
//     }
//   };

//   const getRosterObjects = (cv) => {
//     if (!cv || typeof cv.getObjects !== "function") return { nameObj: null, numObj: null };
//     const all = cv.getObjects();
//     return {
//       nameObj: all.find((o) => o.isRosterName === true || o.isJerseyName === true) || null,
//       numObj: all.find((o) => o.isRosterNumber === true || o.isJerseyNumber === true) || null,
//     };
//   };

//   const saveCanvasRosterStyle = useCallback((cv) => {
//     if (!cv || typeof cv.getObjects !== "function") return;
//     const { nameObj, numObj } = getRosterObjects(cv);

//     const extractStyle = (obj) => {
//       if (!obj) return null;
//       const scaleFactor = obj.scaleY || obj.scaleX || 1;
//       const baseFontSize = obj.fontSize || 28;
//       const effectiveFontSize = Math.round(baseFontSize * scaleFactor);

//       const style = {};
//       const fields = [
//         "fontFamily", "fill", "stroke", "strokeWidth",
//         "fontWeight", "fontStyle", "textAlign", "letterSpacing", "charSpacing",
//         "left", "top", "angle", "originX", "originY",
//         "isCurved", "curvature", "radius", "arc"
//       ];
//       fields.forEach((f) => {
//         if (obj[f] !== undefined && obj[f] !== null) style[f] = obj[f];
//       });

//       style.fontSize = effectiveFontSize;
//       style.scaleX = 1;
//       style.scaleY = 1;
//       return style;
//     };

//     const newNameStyle = extractStyle(nameObj);
//     const newNumStyle = extractStyle(numObj);

//     if (rosterDesignMode === "uniform") {
//       if (newNameStyle || newNumStyle) {
//         setSharedRosterStyle((prev) => ({
//           nameStyle: newNameStyle ? { ...(prev.nameStyle || {}), ...newNameStyle } : prev.nameStyle,
//           numStyle: newNumStyle ? { ...(prev.numStyle || {}), ...newNumStyle } : prev.numStyle,
//         }));
//       }
//     } else {
//       const activeIdx = activePreviewIndex !== null ? activePreviewIndex : 0;
//       if (newNameStyle || newNumStyle) {
//         setRoster((prev) =>
//           prev.map((player, i) =>
//             i === activeIdx
//               ? {
//                   ...player,
//                   nameStyle: newNameStyle ? { ...(player.nameStyle || {}), ...newNameStyle } : player.nameStyle,
//                   numStyle: newNumStyle ? { ...(player.numStyle || {}), ...newNumStyle } : player.numStyle,
//                 }
//               : player
//           )
//         );
//       }
//     }
//   }, [rosterDesignMode, activePreviewIndex]);

//   const clearRosterTextLayers = (canvas, view) => {
//     if (!canvas || typeof canvas.getObjects !== "function") return;

//     // Collect all text strings present in the roster to catch unflagged initial/ghost objects
//     const rosterValues = new Set();
//     if (Array.isArray(roster)) {
//       roster.forEach((r) => {
//         if (r.playerName) rosterValues.add(r.playerName.trim().toUpperCase());
//         if (r.playerNumber) rosterValues.add(r.playerNumber.trim());
//         if (r.frontPlayerName) rosterValues.add(r.frontPlayerName.trim().toUpperCase());
//         if (r.frontPlayerNumber) rosterValues.add(r.frontPlayerNumber.trim());
//       });
//     }
//     if (jerseyPlayerName) rosterValues.add(jerseyPlayerName.trim().toUpperCase());
//     if (jerseyPlayerNumber) rosterValues.add(jerseyPlayerNumber.trim());

//     const rosterObjects = canvas.getObjects().filter((obj) => {
//       if (!obj) return false;
//       // 1. Check explicit custom roster/jersey flags
//       if (
//         obj.isRosterName === true ||
//         obj.isRosterNumber === true ||
//         obj.isJerseyText === true ||
//         obj.isJerseyName === true ||
//         obj.isJerseyNumber === true
//       ) {
//         return true;
//       }
//       // 2. If bulk roster is active, also clear text objects matching roster text values to eliminate initial ghost objects
//       if (isBulkRoster && (obj.type === "i-text" || obj.type === "textbox" || obj.type === "text")) {
//         const textVal = (obj.text || "").trim().toUpperCase();
//         if (textVal && rosterValues.has(textVal)) {
//           return true;
//         }
//       }
//       return false;
//     });

//     if (rosterObjects.length === 0) return;
//     rosterObjects.forEach((obj) => canvas.remove(obj));
//     canvas.renderAll();
//     if (view) manualTriggerSync?.(view);
//   };

//   const clearRosterObjectsFromCanvas = clearRosterTextLayers;

//   const ensureRosterObjectsForCanvas = (cv, nameVal, numVal, view = "back", customNameStyle = null, customNumStyle = null) => {
//     if (!cv || typeof cv.getObjects !== "function") return { nameObj: null, numObj: null };
    
//     // Explicitly purge and destroy all existing active player text layers first
//     clearRosterTextLayers(cv, view);

//     const cx = cv.width ? cv.width / 2 : 150;
//     const cy = cv.height ? cv.height / 2 : 200;

//     const trimmedName = (nameVal || "").trim().toUpperCase();
//     const trimmedNum = (numVal || "").trim();

//     let nameObj = null;
//     let numObj = null;

//     const effectiveNameStyle = rosterDesignMode === "uniform"
//       ? (sharedRosterStyle.nameStyle || {})
//       : (customNameStyle || sharedRosterStyle.nameStyle || {});

//     const effectiveNumStyle = rosterDesignMode === "uniform"
//       ? (sharedRosterStyle.numStyle || {})
//       : (customNumStyle || sharedRosterStyle.numStyle || {});

//     if (trimmedName) {
//       nameObj = new fabric.IText(trimmedName, {
//         left: cx,
//         top: trimmedNum ? cy - 45 : cy,
//         originX: "center",
//         originY: "center",
//         fontFamily: "Impact",
//         fontSize: 28,
//         fill: "#000000",
//         ...effectiveNameStyle,
//         scaleX: 1,
//         scaleY: 1,
//         text: trimmedName,
//         isRosterName: true,
//         isJerseyText: true,
//       });
//       cv.add(nameObj);
//       recalculateTextCurve(nameObj);
//     }

//     if (trimmedNum) {
//       numObj = new fabric.IText(trimmedNum, {
//         left: cx,
//         top: trimmedName ? cy + 45 : cy,
//         originX: "center",
//         originY: "center",
//         fontFamily: "Impact",
//         fontSize: 54,
//         fill: "#000000",
//         ...effectiveNumStyle,
//         scaleX: 1,
//         scaleY: 1,
//         text: trimmedNum,
//         isRosterNumber: true,
//         isJerseyText: true,
//       });
//       cv.add(numObj);
//       recalculateTextCurve(numObj);
//     }

//     cv.renderAll();
//     if (view) manualTriggerSync?.(view);
//     return { nameObj, numObj };
//   };

//   const syncRosterToCanvases = (player, side = rosterPlacementSide) => {
//     // Purge existing roster text layers on all canvases first
//     if (frontCanvas) clearRosterTextLayers(frontCanvas, "front");
//     if (backCanvas) clearRosterTextLayers(backCanvas, "back");

//     if (!player || !isBulkRoster) return;

//     const backName = (player.playerName || "").trim();
//     const backNum = (player.playerNumber || "").trim();

//     const frontName = (player.frontPlayerName !== undefined && player.frontPlayerName !== null && player.frontPlayerName !== "")
//       ? player.frontPlayerName.trim()
//       : backName;
//     const frontNum = (player.frontPlayerNumber !== undefined && player.frontPlayerNumber !== null && player.frontPlayerNumber !== "")
//       ? player.frontPlayerNumber.trim()
//       : backNum;

//     const nameStyle = player.nameStyle || null;
//     const numStyle = player.numStyle || null;

//     if (side === "back") {
//       if (backCanvas) {
//         ensureRosterObjectsForCanvas(backCanvas, backName, backNum, "back", nameStyle, numStyle);
//       }
//     } else if (side === "front") {
//       if (frontCanvas) {
//         ensureRosterObjectsForCanvas(frontCanvas, frontName, frontNum, "front", nameStyle, numStyle);
//       }
//     } else if (side === "both") {
//       if (frontCanvas) ensureRosterObjectsForCanvas(frontCanvas, frontName, frontNum, "front", nameStyle, numStyle);
//       if (backCanvas) ensureRosterObjectsForCanvas(backCanvas, backName, backNum, "back", nameStyle, numStyle);
//     }
//   };

//   const handleSetRosterSide = (side) => {
//     setRosterPlacementSide(side);
//     if (side === "front") setSelectedView("front");
//     if (side === "back") setSelectedView("back");

//     const activeIndex = activePreviewIndex !== null ? activePreviewIndex : 0;
//     const activePlayer = roster[activeIndex];
//     if (activePlayer) {
//       syncRosterToCanvases(activePlayer, side);
//     }
//   };

//   const handlePreviewPlayer = (index) => {
//     const currentCv = selectedView === "front" ? frontCanvas : backCanvas;
//     if (currentCv) {
//       saveCanvasRosterStyle(currentCv);
//     }

//     setActivePreviewIndex(index);
//     const player = roster[index];
//     if (!player) return;

//     const backName = (player.playerName || "").trim();
//     const backNum = (player.playerNumber || "").trim();
//     const frontName = (player.frontPlayerName !== undefined && player.frontPlayerName !== null && player.frontPlayerName !== "")
//       ? player.frontPlayerName.trim()
//       : backName;
//     const frontNum = (player.frontPlayerNumber !== undefined && player.frontPlayerNumber !== null && player.frontPlayerNumber !== "")
//       ? player.frontPlayerNumber.trim()
//       : backNum;
//     const sizeVal = player.size || productSize || "M";

//     setJerseyPlayerName(backName || frontName || "");
//     setJerseyPlayerNumber(backNum || frontNum || "");
//     setProductSize(sizeVal);
//     if (rosterPlacementSide !== "both") {
//       setSelectedView(rosterPlacementSide);
//     }

//     syncRosterToCanvases(player, rosterPlacementSide);

//     const displayName = (rosterPlacementSide === "front" ? frontName : backName) || "Player";
//     const displayNum = (rosterPlacementSide === "front" ? frontNum : backNum) || "";
//     toast.success(`Previewing Player #${index + 1}: ${displayName} ${displayNum ? "#" + displayNum : ""}`);
//   };

//   const handleUpdateRosterRow = (index, field, value) => {
//     setRoster((prev) =>
//       prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
//     );

//     if (activePreviewIndex === index) {
//       const updatedPlayer = { ...roster[index], [field]: value };
//       const activeName = (updatedPlayer.playerName || updatedPlayer.frontPlayerName || "").trim().toUpperCase();
//       const activeNum = (updatedPlayer.playerNumber || updatedPlayer.frontPlayerNumber || "").trim();

//       setJerseyPlayerName(activeName);
//       setJerseyPlayerNumber(activeNum);
//       if (field === "size") setProductSize(value);

//       syncRosterToCanvases(updatedPlayer, rosterPlacementSide);
//     }
//   };

//   const [activeTab, setActiveTab] = useState("apparel");
//   const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
//   const [addingToCart, setAddingToCart] = useState(false);
//   const [cartLoaderState, setCartLoaderState] = useState({
//     isLoading: false,
//     isSuccess: false,
//     isError: false,
//     message: "",
//   });
//   const [dbProduct, setDbProduct] = useState(null);
//   const { addCustomTemplateToCart } = useCart();
//   const { isAuthenticated } = useAuth();

//   const [mobileMainView, setMobileMainView] = useState("editor");
//   const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
//   const [showGrid, setShowGrid] = useState(false);
//   const [showRulers, setShowRulers] = useState(false);
//   const [showCostingModal, setShowCostingModal] = useState(false);
//   const [showObjectInspectorModal, setShowObjectInspectorModal] = useState(false);
//   const [mobileInspectedObject, setMobileInspectedObject] = useState(null);

//   const handleMobileToggleView = () => {
//     setMobileMainView((v) => (v === "editor" ? "preview" : "editor"));
//     setMobileSheetOpen(false);
//   };

//   const handleMobileTabTap = (tabId) => {
//     if (mobileSheetOpen && activeTab === tabId) {
//       setMobileSheetOpen(false);
//     } else {
//       setActiveTab(tabId);
//       setMobileSheetOpen(true);
//       setMobileMainView("editor");
//     }
//   };

//   const {
//     frontCanvas,
//     backCanvas,
//     leftCanvas,
//     rightCanvas,
//     pocketCanvas,
//     hoodCanvas,
//     activeCanvas,
//     canvasLayers,
//     setSelectedObject,
//     selectedObject,
//     deleteLayer
//   } = useCanvas();

//   useEffect(() => {
//     if (selectedObject) {
//       setMobileInspectedObject(selectedObject);
//     }
//   }, [selectedObject]);

//   const { resetCanvases } = useCanvas();
//   const resetHistory = useCustomizerStore((state) => state.resetHistory);

//   const clearDesignerStorage = () => {
//     const views = ["front", "back", "left", "right", "pocket", "hood"];
//     views.forEach((v) => {
//       try {
//         localStorage.removeItem(`tshirt-designer-${v}`);
//       } catch (e) { }
//     });
//   };

//   const lastApparelIdRef = useRef(null);
//   const lastCurrentProductRef = useRef(null);

//   useEffect(() => {
//     if (apparelId && lastApparelIdRef.current !== null && apparelId !== lastApparelIdRef.current) {
//       clearDesignerStorage();
//       resetCanvases();
//       resetHistory();
//       setJerseyPlayerName("");
//       setJerseyPlayerNumber("");
//     }
//   }, [apparelId, resetCanvases, resetHistory, setJerseyPlayerName, setJerseyPlayerNumber]);

//   useEffect(() => {
//     const isInitial = lastApparelIdRef.current === null && lastCurrentProductRef.current === null;
//     const apparelIdChanged = apparelId !== lastApparelIdRef.current;
//     const currentProductChanged = currentProduct !== lastCurrentProductRef.current;

//     if (isInitial) {
//       if (apparelId && apparelConfig[apparelId] && apparelId !== currentProduct) {
//         setCurrentProduct(apparelId);
//         setSelectedView(apparelConfig[apparelId].supportedViews[0]);
//       }
//     } else {
//       if (apparelIdChanged) {
//         if (apparelId && apparelConfig[apparelId] && apparelId !== currentProduct) {
//           setCurrentProduct(apparelId);
//           setSelectedView(apparelConfig[apparelId].supportedViews[0]);
//         }
//       } else if (currentProductChanged) {
//         if (currentProduct && currentProduct !== apparelId) {
//           navigate(`/coustom-product-tshirt/${currentProduct}`, { replace: true });
//         }
//       }
//     }

//     lastApparelIdRef.current = apparelId;
//     lastCurrentProductRef.current = currentProduct;
//   }, [apparelId, currentProduct, navigate, setCurrentProduct, setSelectedView]);

//   const {
//     designTextureFront,
//     designTextureBack,
//     designTextureLeft,
//     designTextureRight,
//     designTexturePocket,
//     designTextureHood,
//     manualTriggerSync
//   } = useCanvasTextureSync({
//     frontCanvas,
//     backCanvas,
//     leftCanvas,
//     rightCanvas,
//     pocketCanvas,
//     hoodCanvas,
//     selectedView,
//   });

//   // Explicitly clear/re-render roster text layers when view (FRONT/BACK), active player, or roster placement changes
//   useEffect(() => {
//     if (!isBulkRoster) {
//       if (frontCanvas) clearRosterTextLayers(frontCanvas, "front");
//       if (backCanvas) clearRosterTextLayers(backCanvas, "back");
//       return;
//     }

//     const activeIndex = activePreviewIndex !== null ? activePreviewIndex : 0;
//     const activePlayer = roster[activeIndex];
//     if (activePlayer) {
//       syncRosterToCanvases(activePlayer, rosterPlacementSide);
//     } else {
//       if (frontCanvas) clearRosterTextLayers(frontCanvas, "front");
//       if (backCanvas) clearRosterTextLayers(backCanvas, "back");
//     }
//   }, [
//     selectedView,
//     activePreviewIndex,
//     rosterPlacementSide,
//     isBulkRoster,
//     roster.length,
//     frontCanvas,
//     backCanvas
//   ]);

//   // Save custom styling when a roster object modification finishes on canvas
//   useEffect(() => {
//     const handleCanvasObjectModified = (e) => {
//       const cv = e.target?.canvas;
//       if (cv) {
//         const obj = e.target;
//         if (obj && (obj.isRosterName === true || obj.isRosterNumber === true)) {
//           saveCanvasRosterStyle(cv);
//         }
//       }
//     };

//     if (frontCanvas) {
//       frontCanvas.on("object:modified", handleCanvasObjectModified);
//     }
//     if (backCanvas) {
//       backCanvas.on("object:modified", handleCanvasObjectModified);
//     }

//     return () => {
//       if (frontCanvas) {
//         frontCanvas.off("object:modified", handleCanvasObjectModified);
//       }
//       if (backCanvas) {
//         backCanvas.off("object:modified", handleCanvasObjectModified);
//       }
//     };
//   }, [frontCanvas, backCanvas, saveCanvasRosterStyle]);

//   const getCanvasStateSnapshot = () => {
//     const snapshot = {};
//     const views = ["front", "back", "left", "right", "pocket", "hood"];
//     const canvasMap = {
//       front: frontCanvas,
//       back: backCanvas,
//       left: leftCanvas,
//       right: rightCanvas,
//       pocket: pocketCanvas,
//       hood: hoodCanvas,
//     };
//     views.forEach((v) => {
//       const cv = canvasMap[v];
//       if (cv) {
//         snapshot[v] = cv.getObjects().filter(o => o.selectable !== false).map(o => o.toJSON(["isRosterName", "isRosterNumber", "isJerseyText", "isJerseyName", "isJerseyNumber"]));
//       } else {
//         const stored = localStorage.getItem(`tshirt-designer-${v}`);
//         snapshot[v] = stored ? JSON.parse(stored) : [];
//       }
//     });
//     return snapshot;
//   };

//   const applySnapshot = (snapshot) => {
//     if (!snapshot) return;
//     const views = ["front", "back", "left", "right", "pocket", "hood"];
//     const canvasMap = {
//       front: frontCanvas,
//       back: backCanvas,
//       left: leftCanvas,
//       right: rightCanvas,
//       pocket: pocketCanvas,
//       hood: hoodCanvas,
//     };

//     views.forEach((v) => {
//       const cv = canvasMap[v];
//       const data = snapshot[v] || [];
//       localStorage.setItem(`tshirt-designer-${v}`, JSON.stringify(data));

//       if (cv) {
//         const toRemove = cv.getObjects().filter(o => o.selectable !== false);
//         toRemove.forEach(o => cv.remove(o));

//         fabric.util.enlivenObjects(data)
//           .then((objects) => {
//             objects.forEach((obj, idx) => {
//               const item = data[idx];
//               if (item) {
//                 if (item.isRosterName) obj.isRosterName = item.isRosterName;
//                 if (item.isRosterNumber) obj.isRosterNumber = item.isRosterNumber;
//                 if (item.isJerseyText) obj.isJerseyText = item.isJerseyText;
//                 if (item.isJerseyName) obj.isJerseyName = item.isJerseyName;
//                 if (item.isJerseyNumber) obj.isJerseyNumber = item.isJerseyNumber;
//               }
//               if (obj.type === "image") {
//                 obj.set({ crossOrigin: "anonymous" });
//                 const el = obj.getElement();
//                 if (el) el.crossOrigin = "anonymous";
//               }
//               cv.add(obj);
//             });
//             cv.renderAll();
//             cv.fire("object:modified");
//             if (manualTriggerSync) manualTriggerSync(v);
//           })
//           .catch((err) => {
//             console.error("Error enlivening objects during snapshot application:", err);
//           });
//       }
//     });
//   };

//   const handleUndo = useCallback(() => {
//     const prev = performUndo(getCanvasStateSnapshot);
//     if (prev) applySnapshot(prev);
//   }, [performUndo, frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas]);

//   const handleRedo = useCallback(() => {
//     const next = performRedo(getCanvasStateSnapshot);
//     if (next) applySnapshot(next);
//   }, [performRedo, frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas]);

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (!activeCanvas) return;
//       const activeObj = activeCanvas.getActiveObject();

//       if (
//         document.activeElement.tagName === "INPUT" ||
//         document.activeElement.tagName === "TEXTAREA" ||
//         document.activeElement.isContentEditable
//       ) {
//         return;
//       }

//       const nudge = e.shiftKey ? 5 : 1;

//       if (e.key === "ArrowUp") {
//         if (activeObj) {
//           e.preventDefault();
//           activeObj.set("top", activeObj.top - nudge);
//           activeObj.setCoords();
//           activeCanvas.renderAll();
//           activeCanvas.fire("object:modified");
//         }
//       } else if (e.key === "ArrowDown") {
//         if (activeObj) {
//           e.preventDefault();
//           activeObj.set("top", activeObj.top + nudge);
//           activeObj.setCoords();
//           activeCanvas.renderAll();
//           activeCanvas.fire("object:modified");
//         }
//       } else if (e.key === "ArrowLeft") {
//         if (activeObj) {
//           e.preventDefault();
//           activeObj.set("left", activeObj.left - nudge);
//           activeObj.setCoords();
//           activeCanvas.renderAll();
//           activeCanvas.fire("object:modified");
//         }
//       } else if (e.key === "ArrowRight") {
//         if (activeObj) {
//           e.preventDefault();
//           activeObj.set("left", activeObj.left + nudge);
//           activeObj.setCoords();
//           activeCanvas.renderAll();
//           activeCanvas.fire("object:modified");
//         }
//       } else if (e.key === "Delete" || e.key === "Backspace") {
//         if (activeObj) {
//           e.preventDefault();
//           deleteLayer(activeObj);
//         }
//       } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
//         if (activeObj) {
//           e.preventDefault();
//           activeObj.clone((cloned) => {
//             cloned.set({
//               left: activeObj.left + 20,
//               top: activeObj.top + 20,
//             });
//             activeCanvas.add(cloned);
//             activeCanvas.setActiveObject(cloned);
//             activeCanvas.renderAll();
//             activeCanvas.fire("object:modified");
//           });
//         }
//       } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
//         e.preventDefault();
//         if (e.shiftKey) {
//           handleRedo();
//         } else {
//           handleUndo();
//         }
//       } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
//         e.preventDefault();
//         handleRedo();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [activeCanvas, deleteLayer, handleUndo, handleRedo]);

//   useEffect(() => {
//     const fetchDbProduct = async () => {
//       try {
//         const nameKeywords = {
//           'half-sleeve': 'half',
//           'long-sleeve': 'long',
//           'oversized': 'oversized',
//           'hoodie': 'hoodie',
//           'sports-jersey': 'jersey',
//         };
//         const keyword = nameKeywords[currentProduct];
//         if (!keyword) return;
//         const res = await api.get(`/products?search=${keyword}&limit=1`);
//         const products = res.data?.data?.products || res.data?.data || [];
//         if (products.length > 0) {
//           setDbProduct(products[0]);
//         }
//       } catch (err) {
//         console.warn('Could not fetch matching DB product for customizer:', err.message);
//       }
//     };
//     fetchDbProduct();
//   }, [currentProduct]);

//   const ensurePermanentUrl = async (url) => {
//     if (!url || !url.startsWith("blob:")) return url;
//     try {
//       const response = await fetch(url);
//       const blob = await response.blob();
//       return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//       });
//     } catch (err) {
//       console.error("Failed to convert blob URL to Base64 Data URL:", err);
//       return url;
//     }
//   };

//   const createBlankCanvasDataUrl = (width = 400, height = 500) => {
//     const canvas = document.createElement("canvas");
//     canvas.width = width;
//     canvas.height = height;
//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, width, height);
//     return canvas.toDataURL("image/png");
//   };

//   const exportCanvasViewDataUrl = (cv, backgroundColor = null, width = 600, height = 800) => {
//     if (!cv) {
//       return null;
//     }

//     try {
//       if (cv.renderAll) {
//         cv.renderAll();
//       }

//       let dataUrl = withGuidesHidden(cv, () =>
//         cv.toDataURL({ format: "png", multiplier: 0.6 })
//       );

//       if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
//         return null;
//       }

//       return dataUrl;
//     } catch (err) {
//       console.warn("Failed to export canvas view Data URL:", err);
//       return null;
//     }
//   };

//   // 🟢 STRICT BASE64 SANITIZATION & PARALLEL UPLOAD TO CLOUDINARY
//   const handleAddToCart = async () => {
//     if (!isAuthenticated) {
//       toast.error("Please log in to add items to your cart.");
//       navigate("/login");
//       return;
//     }
//     if (addingToCart) return;
//     setAddingToCart(true);
//     setCartLoaderState({
//       isLoading: true,
//       isSuccess: false,
//       isError: false,
//       message: "Preparing and uploading your custom design...",
//     });

//     try {
//       // 1. Build the design snapshot JSON
//       const designSnapshot = getCanvasStateSnapshot();

//       // 2. Generate 2D Fabric canvas preview images & production files
//       const previews = {};
//       const productionFiles = {};
//       const canvasMap = {
//         front: frontCanvas,
//         back: backCanvas,
//         left: leftCanvas,
//         right: rightCanvas,
//         pocket: pocketCanvas,
//         hood: hoodCanvas,
//       };

//       for (const [view, cv] of Object.entries(canvasMap)) {
//         const hasContent = cv && cv.getObjects().filter((o) => o.selectable !== false).length > 0;
//         if (hasContent) {
//           const dataUrl = exportCanvasViewDataUrl(cv, productColor || "#FFFFFF");
//           if (dataUrl) previews[view] = dataUrl;
//         }
//       }

//       productionFiles.frontPrintUrl = previews.front || createBlankCanvasDataUrl(productColor || "#FFFFFF");
//       if (previews.back) productionFiles.backPrintUrl = previews.back;
//       if (previews.left) productionFiles.leftSleevePrintUrl = previews.left;
//       if (previews.right) productionFiles.rightSleevePrintUrl = previews.right;

//       // 3D WebGL Canvas snapshot
//       const allCanvases = Array.from(document.querySelectorAll("canvas"));
//       const threeDCanvas = allCanvases.find((c) => {
//         try {
//           return c.getContext("webgl") || c.getContext("webgl2") || c.getContext("experimental-webgl");
//         } catch (e) {
//           return false;
//         }
//       }) || allCanvases[allCanvases.length - 1];

//       if (threeDCanvas) {
//         try {
//           const threeDDataUrl = threeDCanvas.toDataURL("image/jpeg", 0.75);
//           if (threeDDataUrl && threeDDataUrl.startsWith("data:image/")) {
//             previews.mockup = threeDDataUrl;
//           }
//         } catch (e) {
//           console.warn("Could not capture 3D canvas snapshot:", e);
//         }
//       }

//       if (!previews.front || typeof previews.front !== "string" || !previews.front.startsWith("data:image/")) {
//         const blankFront = createBlankCanvasDataUrl(productColor || "#FFFFFF");
//         previews.front = blankFront;
//         productionFiles.frontPrintUrl = blankFront;
//       }

//       // 3. Build print areas array
//       const printAreas = [];
//       for (const [view, cv] of Object.entries(canvasMap)) {
//         if (cv) {
//           if (cv.renderAll) cv.renderAll();
//           const objects = cv.getObjects().filter((o) => o.selectable !== false);
//           if (objects.length > 0) {
//             const layers = await Promise.all(
//               objects.map(async (obj, i) => {
//                 const isText = obj.type === "i-text" || obj.type === "textbox";
//                 let layerData = {
//                   id: obj.id || `layer-${view}-${i}`,
//                   type: isText ? "text" : "image",
//                   zIndex: i,
//                   x: Math.round(obj.left || 0),
//                   y: Math.round(obj.top || 0),
//                   width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
//                   height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
//                   scaleX: obj.scaleX || 1,
//                   scaleY: obj.scaleY || 1,
//                   rotation: obj.angle || 0,
//                 };

//                 if (isText) {
//                   layerData.textConfig = {
//                     text: obj.text,
//                     fontFamily: obj.fontFamily,
//                     fontSize: obj.fontSize,
//                     fill: obj.fill,
//                     fontWeight: obj.fontWeight,
//                     fontStyle: obj.fontStyle,
//                     textAlign: obj.textAlign,
//                   };
//                 } else {
//                   const rawSrc = obj.getSrc ? obj.getSrc() : (obj.src || obj.originalSrc);
//                   const rawOriginal = obj.originalSrc || obj.src;
//                   const rawProcessed = obj.src || obj.originalSrc;

//                   const [permanentSrc, permanentOriginal, permanentProcessed] = await Promise.all([
//                     ensurePermanentUrl(rawSrc),
//                     ensurePermanentUrl(rawOriginal),
//                     ensurePermanentUrl(rawProcessed),
//                   ]);

//                   layerData.imageConfig = {
//                     src: permanentSrc,
//                     originalUrl: permanentOriginal,
//                     processedUrl: permanentProcessed,
//                   };
//                 }

//                 return layerData;
//               })
//             );

//             printAreas.push({ areaName: view, layers });
//           }
//         }
//       }

//       const CLOTHING_TYPE_MAP = {
//         "half-sleeve": "half_sleeve_t_shirt",
//         "long-sleeve": "long_sleeve_t_shirt",
//         oversized: "oversized_t_shirt",
//         hoodie: "hoodie",
//         "sports-jersey": "sports_jersey",
//       };
//       const clothingTypeKey = CLOTHING_TYPE_MAP[currentProduct] || currentProduct;

//       let finalQuantity = 1;
//       let cleanedRoster = [];

//       if (isBulkRoster) {
//         cleanedRoster = roster
//           .map((r) => ({
//             playerName: (r.playerName || "").trim(),
//             playerNumber: (r.playerNumber || "").trim(),
//             size: r.size || productSize || "M",
//           }))
//           .filter((r) => r.playerName !== "" || r.playerNumber !== "");

//         if (cleanedRoster.length === 0) {
//           setCartLoaderState({
//             isLoading: false,
//             isSuccess: false,
//             isError: true,
//             message: "Please add at least one player name or number to your roster before adding to cart.",
//           });
//           toast.error("Please add at least one player name or number to your roster before adding to cart.");
//           setAddingToCart(false);
//           return;
//         }

//         finalQuantity = cleanedRoster.length;
//       }

//       // 🟢 PARALLEL UPLOAD & STRICT BASE64 REPLACEMENT PIPELINE
//       const ensureDataUrl = async (str) => {
//         if (!str || typeof str !== "string") return str;
//         if (str.startsWith("blob:")) {
//           try {
//             const response = await fetch(str);
//             const blob = await response.blob();
//             return await new Promise((resolve, reject) => {
//               const reader = new FileReader();
//               reader.onloadend = () => resolve(reader.result);
//               reader.onerror = reject;
//               reader.readAsDataURL(blob);
//             });
//           } catch (e) {
//             console.error("Failed to convert blob URL to Data URL:", e);
//             return str;
//           }
//         }
//         return str;
//       };

//       const isBase64DataUrl = (str) => {
//         if (!str || typeof str !== "string") return false;
//         return (
//           str.startsWith("data:image/") ||
//           str.startsWith("data:application/") ||
//           str.startsWith("blob:") ||
//           /^data:[a-zA-Z0-9+\/]+;base64,/.test(str)
//         );
//       };

//       const uploadMap = new Map();

//       const uploadBase64Parallel = async (base64Str, folder = "mojilo/previews") => {
//         if (!isBase64DataUrl(base64Str)) return base64Str;

//         if (!uploadMap.has(base64Str)) {
//           const promise = (async () => {
//             const dataUrl = await ensureDataUrl(base64Str);
//             if (!dataUrl || typeof dataUrl !== "string" || (!dataUrl.startsWith("data:") && !dataUrl.startsWith("http"))) {
//               console.warn("Skipping upload for invalid data URL:", dataUrl);
//               return base64Str;
//             }
//             const res = await api.post("/uploads/base64", { base64: dataUrl, folder });
//             const url = res.data?.data?.url || res.data?.url;
//             if (url && typeof url === "string" && !isBase64DataUrl(url)) {
//               return url;
//             }
//             throw new Error("Invalid Cloudinary URL returned");
//           })().catch(err => {
//             console.error("Cloudinary Upload Error:", err);
//             throw err;
//           });
//           uploadMap.set(base64Str, promise);
//         }
//         return uploadMap.get(base64Str);
//       };

//       const uploadTasks = [];

//       // A. Previews
//       const uploadedPreviews = { ...previews };
//       for (const [key, val] of Object.entries(previews)) {
//         if (isBase64DataUrl(val)) {
//           uploadTasks.push(
//             uploadBase64Parallel(val, "mojilo/previews").then((url) => {
//               uploadedPreviews[key] = url;
//             })
//           );
//         }
//       }

//       // B. Production Files
//       const uploadedProductionFiles = { ...productionFiles };
//       for (const [key, val] of Object.entries(productionFiles)) {
//         if (isBase64DataUrl(val)) {
//           uploadTasks.push(
//             uploadBase64Parallel(val, "mojilo/production").then((url) => {
//               uploadedProductionFiles[key] = url;
//             })
//           );
//         }
//       }

//       // C. Print Areas Layer Images
//       const uploadedPrintAreas = JSON.parse(JSON.stringify(printAreas));
//       for (const area of uploadedPrintAreas) {
//         if (Array.isArray(area.layers)) {
//           for (const layer of area.layers) {
//             if (layer.imageConfig) {
//               if (isBase64DataUrl(layer.imageConfig.src)) {
//                 uploadTasks.push(
//                   uploadBase64Parallel(layer.imageConfig.src, "mojilo/layers").then((url) => {
//                     layer.imageConfig.src = url;
//                   })
//                 );
//               }
//               if (isBase64DataUrl(layer.imageConfig.originalUrl)) {
//                 uploadTasks.push(
//                   uploadBase64Parallel(layer.imageConfig.originalUrl, "mojilo/layers").then((url) => {
//                     layer.imageConfig.originalUrl = url;
//                   })
//                 );
//               }
//               if (isBase64DataUrl(layer.imageConfig.processedUrl)) {
//                 uploadTasks.push(
//                   uploadBase64Parallel(layer.imageConfig.processedUrl, "mojilo/layers").then((url) => {
//                     layer.imageConfig.processedUrl = url;
//                   })
//                 );
//               }
//             }
//           }
//         }
//       }

//       // D. Design Snapshot JSON Assets
//       const uploadedDesignSnapshot = designSnapshot ? JSON.parse(JSON.stringify(designSnapshot)) : null;
//       if (uploadedDesignSnapshot && typeof uploadedDesignSnapshot === "object") {
//         const traverseAndUpload = (target) => {
//           if (!target || typeof target !== "object") return;
//           if (Array.isArray(target)) {
//             target.forEach((item) => traverseAndUpload(item));
//             return;
//           }
//           for (const [key, val] of Object.entries(target)) {
//             if (isBase64DataUrl(val)) {
//               uploadTasks.push(
//                 uploadBase64Parallel(val, "mojilo/canvas_assets").then((url) => {
//                   target[key] = url;
//                 })
//               );
//             } else if (val && typeof val === "object") {
//               traverseAndUpload(val);
//             }
//           }
//         };
//         traverseAndUpload(uploadedDesignSnapshot);
//       }

//       // Wait for all Cloudinary uploads to complete
//       if (uploadTasks.length > 0) {
//         await Promise.all(uploadTasks);
//       }

//       // 4. Send clean payload containing ONLY Cloudinary HTTPS URLs
//       const customRes = await api.post("/customizations", {
//         productId: null,
//         variantId: null,
//         selectedColor: productColor,
//         selectedSize: productSize,
//         editableDesignJSON: uploadedDesignSnapshot,
//         previews: uploadedPreviews,
//         productionFiles: uploadedProductionFiles,
//         printAreas: uploadedPrintAreas,
//         baseTemplateId: currentProduct,
//         productType: currentProduct,
//         clothingType: productConfig.name,
//         isBulkRoster,
//         roster: cleanedRoster,
//       }, { timeout: 60000 });

//       const customizationId = customRes.data?.data?._id;
//       if (!customizationId) {
//         throw new Error("Failed to save customization design. Please try again.");
//       }

//       // 5. Add to Cart
//       await addCustomTemplateToCart(
//         customizationId,
//         clothingTypeKey,
//         productSize || "M",
//         productColor || "#FFFFFF",
//         finalQuantity
//       );

//       setCartLoaderState({
//         isLoading: false,
//         isSuccess: true,
//         isError: false,
//         message: "Added to Cart!",
//       });
//       window.setTimeout(() => navigate("/cart"), 1200);
//     } catch (err) {
//       console.error("Failed to add customized product to cart:", err);
//       setCartLoaderState({
//         isLoading: false,
//         isSuccess: false,
//         isError: true,
//         message: err.message || "Failed to add to cart. Please try again.",
//       });
//       toast.error(err.message || "Failed to add to cart. Please try again.");
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const FALLBACK_COLORS = [
//     "#FFFFFF", "#000000", "#EF4444", "#3B82F6", "#10B981",
//     "#1E3A8A", "#F59E0B", "#6B7280", "#F97316", "#8B5CF6",
//   ];
//   const FALLBACK_SIZES = [
//     { size: "XS", enabled: true, priceAddon: 0 },
//     { size: "S", enabled: true, priceAddon: 0 },
//     { size: "M", enabled: true, priceAddon: 0 },
//     { size: "L", enabled: true, priceAddon: 0 },
//     { size: "XL", enabled: true, priceAddon: 0 },
//     { size: "XXL", enabled: true, priceAddon: 0 },
//     { size: "3XL", enabled: false, priceAddon: 0 },
//   ];

//   const liveTemplate = apparelTemplates?.[currentProduct] ?? null;
//   const presetTshirtColors = liveTemplate?.availableColors?.length
//     ? liveTemplate.availableColors
//     : FALLBACK_COLORS;
//   const tshirtSizes = (liveTemplate?.sizes ?? FALLBACK_SIZES).filter((s) => s.enabled);

//   const productConfig = apparelConfig[currentProduct] || apparelConfig["half-sleeve"];
//   const ActiveModelMesh = productConfig.modelComponent;

//   const shouldMountPreview = !isMobile || mobileMainView === "preview";
//   const shouldMountEditor = true;
//   const shouldMountTools = !isMobile || mobileSheetOpen;

//   const viewLabel = (selectedView || "front").charAt(0).toUpperCase() + (selectedView || "front").slice(1);

//   const toolTabContent = (
//     <div>
//       {activeTab === "apparel" && (
//         <div className="space-y-5">
//           <ProductSelector />

//           <div className="space-y-2">
//             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
//               <Palette className="h-4 w-4" /> Fabric Color
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {presetTshirtColors.map((color) => (
//                 <button
//                   key={color}
//                   onClick={() => setProductColor(color)}
//                   className={`w-7 h-7 rounded-full border shadow-inner transition-all hover:scale-110 cursor-pointer ${productColor === color
//                     ? "border-[#997241] ring-2 ring-[#997241] dark:ring-[#997241]"
//                     : "border-slate-200 dark:border-slate-600"
//                     }`}
//                   style={{ backgroundColor: color }}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="space-y-2">
//             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Garment Size</div>
//             <div className="flex flex-wrap gap-1.5">
//               {tshirtSizes.map((sz) => {
//                 const sizeLabel = typeof sz === "string" ? sz : sz.size;
//                 const priceAddon = typeof sz === "object" ? (sz.priceAddon ?? 0) : 0;
//                 const isSelected = productSize === sizeLabel;
//                 return (
//                   <button
//                     key={sizeLabel}
//                     onClick={() => setProductSize(sizeLabel)}
//                     title={priceAddon > 0 ? `+₹${priceAddon} for ${sizeLabel}` : sizeLabel}
//                     className={`relative w-9 h-8 rounded-lg text-xs font-bold transition-all border cursor-pointer ${isSelected
//                         ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 dark:border-white"
//                         : "bg-white border-slate-200 dark:bg-slate-700 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
//                       }`}
//                   >
//                     {sizeLabel}
//                     {priceAddon > 0 && (
//                       <span className="absolute -top-1.5 -right-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50 px-0.5 rounded leading-none">
//                         +{priceAddon}
//                       </span>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
//                 <div>
//                   <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Team Roster / Bulk Order</span>
//                   <span className="text-[10px] text-slate-400 block">Names, numbers & sizes for teamwear</span>
//                 </div>
//               </div>
//               <label className="relative inline-flex items-center cursor-pointer shrink-0">
//                 <input
//                   type="checkbox"
//                   checked={isBulkRoster}
//                   onChange={(e) => setIsBulkRoster(e.target.checked)}
//                   className="sr-only peer"
//                 />
//                 <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-[#997241]"></div>
//               </label>
//             </div>

//             {isBulkRoster && (
//               <div className="space-y-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700">
//                 <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
//                   <span>Roster List ({roster.length} Players)</span>
//                   <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
//                     Qty: {roster.length}
//                   </span>
//                 </div>

//                 <div className="p-2 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-lg space-y-2">
//                   <div className="space-y-1">
//                     <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//                       Design Styling Mode
//                     </div>
//                     <div className="grid grid-cols-2 gap-1 bg-white dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setRosterDesignMode("uniform");
//                           const activeIdx = activePreviewIndex !== null ? activePreviewIndex : 0;
//                           if (roster[activeIdx]) syncRosterToCanvases(roster[activeIdx], rosterPlacementSide);
//                         }}
//                         className={`py-1 px-1.5 text-[10px] font-bold rounded transition-all cursor-pointer text-center ${rosterDesignMode === "uniform"
//                             ? "bg-indigo-600 text-white shadow-xs"
//                             : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
//                           }`}
//                         title="Apply same font, color, position & styling across all roster players (Default)"
//                       >
//                         Same for All
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setRosterDesignMode("individual");
//                           const activeIdx = activePreviewIndex !== null ? activePreviewIndex : 0;
//                           if (roster[activeIdx]) syncRosterToCanvases(roster[activeIdx], rosterPlacementSide);
//                         }}
//                         className={`py-1 px-1.5 text-[10px] font-bold rounded transition-all cursor-pointer text-center ${rosterDesignMode === "individual"
//                             ? "bg-indigo-600 text-white shadow-xs"
//                             : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
//                           }`}
//                         title="Allow custom font, color & styling per individual player"
//                       >
//                         Custom per Player
//                       </button>
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//                       Print Placement
//                     </div>
//                     <div className="grid grid-cols-3 gap-1 bg-white dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
//                       <button
//                         type="button"
//                         onClick={() => handleSetRosterSide("back")}
//                         className={`py-1 px-2 text-[10px] font-bold rounded transition-all cursor-pointer ${rosterPlacementSide === "back"
//                             ? "bg-indigo-600 text-white shadow-xs"
//                             : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
//                           }`}
//                       >
//                         Back Side
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
//                   {roster.map((player, idx) => {
//                     const isPreviewing = activePreviewIndex === idx;
//                     return (
//                       <div
//                         key={idx}
//                         className={`p-2.5 rounded-lg space-y-2 text-xs relative group shadow-sm transition-all border ${isPreviewing
//                             ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-300 dark:ring-indigo-800"
//                             : "bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600"
//                           }`}
//                       >
//                         <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
//                           <span className="flex items-center gap-1.5">
//                             Player #{idx + 1}
//                             {isPreviewing && (
//                               <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.2 rounded font-semibold tracking-normal uppercase">
//                                 Active Preview
//                               </span>
//                             )}
//                           </span>
//                           <div className="flex items-center gap-1.5">
//                             <button
//                               type="button"
//                               onClick={() => handlePreviewPlayer(idx)}
//                               className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${isPreviewing
//                                   ? "bg-indigo-600 text-white shadow-sm"
//                                   : "bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
//                                 }`}
//                               title="Preview on 3D/2D garment & edit position"
//                             >
//                               <Eye className="h-3 w-3" />
//                               {isPreviewing ? "Active" : "Preview"}
//                             </button>
//                             {roster.length > 1 && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleRemoveRosterRow(idx)}
//                                 className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
//                                 title="Remove player"
//                               >
//                                 <Trash2 className="h-3.5 w-3.5" />
//                               </button>
//                             )}
//                           </div>
//                         </div>

//                         {rosterPlacementSide === "both" ? (
//                           <div className="space-y-1.5">
//                             <div className="grid grid-cols-12 gap-1.5 items-center">
//                               <div className="col-span-2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Back:</div>
//                               <div className="col-span-4">
//                                 <input
//                                   type="text"
//                                   placeholder="Back Name (Opt)"
//                                   value={player.playerName || ""}
//                                   onChange={(e) => handleUpdateRosterRow(idx, "playerName", e.target.value)}
//                                   className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
//                                 />
//                               </div>
//                               <div className="col-span-3">
//                                 <input
//                                   type="text"
//                                   placeholder="No. (#)"
//                                   value={player.playerNumber || ""}
//                                   onChange={(e) => handleUpdateRosterRow(idx, "playerNumber", e.target.value.slice(0, 3))}
//                                   className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
//                                 />
//                               </div>
//                               <div className="col-span-3">
//                                 <select
//                                   value={player.size || productSize || "M"}
//                                   onChange={(e) => handleUpdateRosterRow(idx, "size", e.target.value)}
//                                   className="w-full h-7 px-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
//                                 >
//                                   {(tshirtSizes.length > 0 ? tshirtSizes : ["S", "M", "L", "XL", "XXL", "3XL"]).map((s) => {
//                                     const label = typeof s === "string" ? s : s.size;
//                                     return (
//                                       <option key={label} value={label}>
//                                         {label}
//                                       </option>
//                                     );
//                                   })}
//                                 </select>
//                               </div>
//                             </div>

//                             <div className="grid grid-cols-12 gap-1.5 items-center">
//                               <div className="col-span-2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Front:</div>
//                               <div className="col-span-5">
//                                 <input
//                                   type="text"
//                                   placeholder="Front Name (Opt)"
//                                   value={player.frontPlayerName ?? ""}
//                                   onChange={(e) => handleUpdateRosterRow(idx, "frontPlayerName", e.target.value)}
//                                   className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
//                                 />
//                               </div>
//                               <div className="col-span-5">
//                                 <input
//                                   type="text"
//                                   placeholder="Front No. (#) (Opt)"
//                                   value={player.frontPlayerNumber ?? ""}
//                                   onChange={(e) => handleUpdateRosterRow(idx, "frontPlayerNumber", e.target.value.slice(0, 3))}
//                                   className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="grid grid-cols-12 gap-1.5">
//                             <div className="col-span-5">
//                               <input
//                                 type="text"
//                                 placeholder={rosterPlacementSide === "front" ? "Front Name (Opt)" : "Back Name (Opt)"}
//                                 value={rosterPlacementSide === "front" ? (player.frontPlayerName ?? player.playerName ?? "") : (player.playerName ?? "")}
//                                 onChange={(e) => handleUpdateRosterRow(idx, rosterPlacementSide === "front" ? "frontPlayerName" : "playerName", e.target.value)}
//                                 className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
//                               />
//                             </div>
//                             <div className="col-span-3">
//                               <input
//                                 type="text"
//                                 placeholder="No. (#)"
//                                 value={rosterPlacementSide === "front" ? (player.frontPlayerNumber ?? player.playerNumber ?? "") : (player.playerNumber ?? "")}
//                                 onChange={(e) => handleUpdateRosterRow(idx, rosterPlacementSide === "front" ? "frontPlayerNumber" : "playerNumber", e.target.value.slice(0, 3))}
//                                 className="w-full h-7 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
//                               />
//                             </div>
//                             <div className="col-span-4">
//                               <select
//                                 value={player.size || productSize || "M"}
//                                 onChange={(e) => handleUpdateRosterRow(idx, "size", e.target.value)}
//                                 className="w-full h-7 px-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs font-bold focus:border-indigo-500 outline-none text-slate-800 dark:text-slate-100"
//                               >
//                                 {(tshirtSizes.length > 0 ? tshirtSizes : ["S", "M", "L", "XL", "XXL", "3XL"]).map((s) => {
//                                   const label = typeof s === "string" ? s : s.size;
//                                   return (
//                                     <option key={label} value={label}>
//                                       {label}
//                                     </option>
//                                   );
//                                 })}
//                               </select>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleAddRosterRow}
//                   className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
//                 >
//                   <UserPlus className="h-3.5 w-3.5" /> + Add Player to Roster
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       {activeTab === "upload" && <ImageUploadPanel />}
//       {activeTab === "text" && <TypographyPanel manualSync={manualTriggerSync} />}
//       {activeTab === "graphics" && <StickersPanel manualSync={manualTriggerSync} />}
//       {activeTab === "shapes" && <ShapesPanel manualSync={manualTriggerSync} />}
//       {activeTab === "ai" && <AIImageGenerator />}
//       {activeTab === "qr" && <QrCodeGenerator />}
//       {activeTab === "bg-remover" && <BackgroundRemovalPanel />}
//     </div>
//   );

//   const tabHeaderLabel = {
//     apparel: "Product Settings",
//     upload: "Upload Images",
//     text: "Typography Panel",
//     graphics: "Stickers & Clipart",
//     shapes: "Shapes Library",
//     ai: "AI Image Maker",
//     qr: "QR Generator",
//     "bg-remover": "Background Remover",
//   }[activeTab];

//   const [authBannerDismissed, setAuthBannerDismissed] = useState(false);
//   const showAuthBanner = !isAuthenticated && !authBannerDismissed;

//   return (
//     <div className={`h-screen flex flex-col font-sans antialiased overflow-hidden ${isDarkMode ? "bg-slate-900 text-slate-100 dark" : "bg-slate-50 text-slate-800"
//       }`}>
//       {showAuthBanner && (
//         <div
//           role="alert"
//           className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5
//             bg-gradient-to-r from-amber-800 via-orange-800 to-amber-800
//             text-white text-xs font-semibold shadow-md z-50
//             animate-[slideDown_0.35s_cubic-bezier(0.16,1,0.3,1)_both]"
//         >
//           <style>{`
//             @keyframes slideDown {
//               from { transform: translateY(-110%); opacity: 0; }
//               to   { transform: translateY(0);     opacity: 1; }
//             }
//           `}</style>

//           <div className="flex items-center gap-2 min-w-0">
//             <ShieldAlert className="h-4 w-4 shrink-0 text-white/90" />
//             <span className="truncate">
//               You're browsing as a guest. Please&nbsp;
//               <button
//                 onClick={() => navigate("/login")}
//                 className="underline underline-offset-2 font-bold hover:text-white/80 transition-colors cursor-pointer"
//               >
//                 log in
//               </button>
//               &nbsp;to save your design or add to cart.
//             </span>
//           </div>

//           <div className="flex items-center gap-2 shrink-0">
//             <button
//               onClick={() => navigate("/login")}
//               className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 active:bg-white/40
//                 border border-white/30 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
//             >
//               <LogIn className="h-3.5 w-3.5" />
//               Login
//             </button>
//             <button
//               onClick={() => setAuthBannerDismissed(true)}
//               aria-label="Dismiss login reminder"
//               className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/20 active:bg-white/30 transition-colors cursor-pointer"
//             >
//               <X className="h-3.5 w-3.5" />
//             </button>
//           </div>
//         </div>
//       )}

//       <header className="h-14 border-b shrink-0 flex items-center justify-between gap-2 px-2 sm:px-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-30 shadow-sm transition-colors overflow-x-auto scrollbar-hide">
//         <div className="flex items-center gap-2 sm:gap-3 shrink-0">
//           <button
//             onClick={() => navigate("/custom")}
//             className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
//           >
//             <ArrowLeft className="h-4.5 w-4.5" />
//           </button>
//           <div className="min-w-0 ">
//             <h1 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider truncate">Design Studio</h1>
//             <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none mt-0.5 truncate">Mojilo Customizer</p>
//           </div>
//         </div>
//         <Link to="/" className="flex justify-start lg:justify-center" onClick={() => setActiveTab('Home')}>
//           <img
//             src={logo}
//             alt="Mojilo"
//             className="h-7 sm:h-8 w-auto transition-opacity duration-200 hover:opacity-80"
//           />
//         </Link>
//         <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
//           <button
//             onClick={handleUndo}
//             title="Undo (Ctrl+Z)"
//             className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 cursor-pointer shrink-0"
//           >
//             <Undo2 className="h-4 w-4" />
//           </button>
//           <button
//             onClick={handleRedo}
//             title="Redo (Ctrl+Y)"
//             className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 cursor-pointer shrink-0"
//           >
//             <Redo2 className="h-4 w-4" />
//           </button>
//         </div>
//       </header>

//       {isMobile && mobileMainView === "editor" && (
//         <div className="lg:hidden shrink-0 flex items-center justify-between gap-1 px-3 py-2 border-b bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-20">
//           <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
//             {(productConfig.supportedViews || ["front", "back"]).map((view) => (
//               <button
//                 key={view}
//                 onClick={() => setSelectedView(view)}
//                 className={`px-3 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer ${
//                   selectedView === view
//                     ? "bg-[#997241] text-white shadow-xs"
//                     : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
//                 }`}
//               >
//                 {view}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {isMobile && mobileMainView === "editor" && (
//         <div className="lg:hidden shrink-0 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700">
//           <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0" />
//           <span className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider">
//             {viewLabel} Print Area
//           </span>
//         </div>
//       )}

//       <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden z-10 pb-14 lg:pb-0">
//         <div className="hidden lg:flex shrink-0 relative z-30 w-auto h-full border-r bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all overflow-hidden">
//           <div className="w-[60px] border-r flex flex-col items-center py-4 gap-4 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shrink-0 overflow-y-auto">
//             {TOOL_TABS.map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => {
//                   setActiveTab(tab.id);
//                   setLeftSidebarOpen(true);
//                 }}
//                 title={tab.label}
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${activeTab === tab.id && leftSidebarOpen
//                   ? "bg-[#997241] text-[#FFF] shadow-md scale-[1.05]"
//                   : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200"
//                   }`}
//               >
//                 {tab.icon}
//               </button>
//             ))}
//           </div>

//           <div
//             className={`flex flex-col h-full bg-white dark:bg-slate-800 transition-all overflow-hidden z-20 border-r border-slate-100 dark:border-slate-700 ${leftSidebarOpen ? "flex-1 lg:w-[300px]" : "w-0"
//               }`}
//           >
//             <div className="flex-1 overflow-y-auto p-4 space-y-5">
//               <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//                   {tabHeaderLabel}
//                 </span>
//               </div>
//               {toolTabContent}
//             </div>

//             <div className="p-4 border-t border-slate-200 dark:border-slate-700 shrink-0 space-y-3 bg-white dark:bg-slate-800">
//               <PriceCalculator />
//               <button
//                 onClick={handleAddToCart}
//                 disabled={addingToCart}
//                 className="w-full h-11 bg-[#997241] hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Shirt className="h-4.5 w-4.5" />
//                 Add to Cart & Checkout
//               </button>
//             </div>
//           </div>

//           <button
//             onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
//             className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-12 items-center justify-center rounded-r-xl border-y border-r bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10 shadow cursor-pointer focus:outline-none"
//           >
//             {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//           </button>
//         </div>

//         <section
//           className={`${isMobile ? (mobileMainView === "preview" ? "block" : "hidden") : "block"
//             } flex-1 min-w-0 lg:min-w-[320px] h-full relative z-10 lg:border-r border-slate-200 dark:border-slate-700`}
//         >
//           <div className="absolute top-4 right-4 z-20 flex gap-2">
//             <span className="text-[11px] font-bold text-[#997241] bg-[#fff] hover:bg-indigo-200 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-md uppercase tracking-wider">
//               {productConfig.name}
//             </span>
//           </div>

//           {shouldMountPreview ? (
//             <Suspense fallback={<PanelSkeleton loading3D />}>
//               <ThreeDViewer
//                 modelComponent={ActiveModelMesh}
//                 tshirtColor={productColor}
//                 designTexture={designTextureFront}
//                 designTextureBack={designTextureBack}
//                 designTextureLeft={designTextureLeft}
//                 designTextureRight={designTextureRight}
//                 designTexturePocket={designTexturePocket}
//                 designTextureHood={designTextureHood}
//                 onViewChange={(view) => setSelectedView(view)}
//                 dpr={isMobile ? [1, 1.5] : undefined}
//               />
//             </Suspense>
//           ) : (
//             <PanelSkeleton label="Preview paused" />
//           )}
//         </section>

//         <aside
//           className={`${isMobile ? (mobileMainView === "editor" ? "flex" : "hidden") : "flex"
//             } w-full lg:w-[500px] scrollbar-hide h-full bg-slate-50 dark:bg-slate-900 flex-col shrink-0 relative overflow-hidden z-20`}
//         >
//           <div className="flex-1 overflow-y-auto flex flex-col justify-start items-stretch">
//             <div className="w-full flex justify-center h-fit">
//               <CanvasEditor
//                 manualSync={manualTriggerSync}
//                 showGrid={showGrid}
//                 showRulers={showRulers}
//               />
//             </div>
//             <div className="hidden lg:block w-full p-4 pt-0">
//               <ObjectInspector />
//             </div>
//           </div>
//         </aside>
//       </div>

//       <div className="lg:hidden shrink-0 fixed left-0 right-0 bottom-14 z-30 p-3 border-t bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setShowCostingModal(true)}
//             className="flex-1 h-11 min-w-0 flex items-center justify-center gap-2 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-bold text-xs uppercase tracking-wider cursor-pointer active:scale-[0.99] transition-transform"
//           >
//             <Calculator className="h-4 w-4" />
//             View Costing
//           </button>
//           <button
//             onClick={handleAddToCart}
//             disabled={addingToCart}
//             className="h-11 px-4 shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Shirt className="h-4.5 w-4.5" />
//             Add
//           </button>
//         </div>
//       </div>

//       {showCostingModal && (
//         <div
//           className="lg:hidden fixed inset-0 z-[60] flex items-end justify-center bg-black/40"
//           onClick={() => setShowCostingModal(false)}
//         >
//           <div
//             className="w-full max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] p-4 pb-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between mb-3">
//               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Estimation</span>
//               <button
//                 onClick={() => setShowCostingModal(false)}
//                 className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 cursor-pointer"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//             <PriceCalculator />
//             <button
//               onClick={() => {
//                 setShowCostingModal(false);
//                 handleAddToCart();
//               }}
//               disabled={addingToCart}
//               className="w-full h-11 mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Shirt className="h-4.5 w-4.5" />
//               Add to Cart & Checkout
//             </button>
//           </div>
//         </div>
//       )}

//       {isMobile && (selectedObject || mobileInspectedObject) && mobileMainView === "editor" && (
//         <div className="lg:hidden fixed bottom-28 right-4 z-40 flex items-center gap-1.5 p-1 bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur border border-slate-700/60 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
//           <button
//             onMouseDown={(e) => e.preventDefault()}
//             onTouchStart={(e) => e.stopPropagation()}
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               const targetObj = selectedObject || activeCanvas?.getActiveObject() || mobileInspectedObject;
//               if (targetObj) {
//                 setMobileInspectedObject(targetObj);
//                 if (activeCanvas && typeof activeCanvas.setActiveObject === "function") {
//                   activeCanvas.setActiveObject(targetObj);
//                   activeCanvas.renderAll();
//                 }
//               }
//               setShowObjectInspectorModal(true);
//             }}
//             className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-md"
//           >
//             <Sliders className="h-3.5 w-3.5" />
//             <span>Inspect</span>
//             <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold uppercase truncate max-w-[80px]">
//               {(selectedObject || mobileInspectedObject)?.type}
//             </span>
//           </button>
//           <button
//             onClick={() => {
//               setMobileInspectedObject(null);
//               if (activeCanvas?.discardActiveObject) {
//                 activeCanvas.discardActiveObject();
//                 activeCanvas.renderAll();
//               }
//             }}
//             title="Deselect element"
//             className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
//           >
//             <X className="h-3.5 w-3.5" />
//           </button>
//         </div>
//       )}

//       {showObjectInspectorModal && isMobile && (
//         <div
//           className="lg:hidden fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
//           onClick={() => setShowObjectInspectorModal(false)}
//         >
//           <div
//             className="w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.2)] p-4 pb-8"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <ObjectInspector 
//               targetObject={mobileInspectedObject || selectedObject || activeCanvas?.getActiveObject()} 
//               onClose={() => setShowObjectInspectorModal(false)} 
//             />
//           </div>
//         </div>
//       )}

//       <div
//         className={`lg:hidden fixed left-0 right-0 bottom-14 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out ${mobileSheetOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
//           }`}
//         style={{ maxHeight: "70vh" }}
//       >
//         <button
//           onClick={() => setMobileSheetOpen(false)}
//           className="w-full flex flex-col items-center pt-2 pb-1 cursor-pointer"
//         >
//           <span className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />
//           <ChevronDown className="h-4 w-4 text-slate-400 mt-1" />
//         </button>

//         <div className="flex items-center gap-2 px-3 pb-2 overflow-x-auto scrollbar-hide border-b border-slate-100 dark:border-slate-700">
//           {TOOL_TABS.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${activeTab === tab.id
//                 ? "bg-violet-600 text-white"
//                 : "bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
//                 }`}
//             >
//               {tab.icon}
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(70vh - 60px)" }}>
//           {shouldMountTools && toolTabContent}
//         </div>
//       </div>

//       <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 z-50 flex items-stretch border-t bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
//         <button
//           onClick={handleMobileToggleView}
//           className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${mobileMainView === "preview" && !mobileSheetOpen
//             ? "text-violet-600 dark:text-violet-400"
//             : "text-slate-400 dark:text-slate-500"
//             }`}
//         >
//           {mobileMainView === "preview" ? <PencilRuler className="h-5 w-5" /> : <Box className="h-5 w-5" />}
//           <span className="text-[10px] font-bold uppercase tracking-wide">
//             {mobileMainView === "preview" ? "View 2D" : "View 3D"}
//           </span>
//         </button>

//         {MOBILE_QUICK_TABS.map((tabId) => {
//           const tab = TOOL_TABS.find((t) => t.id === tabId);
//           const active = mobileSheetOpen && activeTab === tabId;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => handleMobileTabTap(tab.id)}
//               className={`flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${active ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
//                 }`}
//             >
//               {tab.icon}
//               <span className="text-[10px] font-bold uppercase tracking-wide">{tab.label}</span>
//             </button>
//           );
//         })}
//       </nav>

//       <AddToCartLoader
//         isLoading={cartLoaderState.isLoading}
//         isSuccess={cartLoaderState.isSuccess}
//         isError={cartLoaderState.isError}
//         message={cartLoaderState.message}
//         onRetry={() => handleAddToCart()}
//       />
//     </div>
//   );
// }
// export { CoustomProductTshirt };