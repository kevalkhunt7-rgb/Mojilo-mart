import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useCanvas } from "../context/CanvasContext";
import { useCustomizerStore } from "../store/useCustomizerStore";
import { apparelConfig } from "../utils/apparelConfig";
import canvasStorageManager from "../utils/canvasStorageManager";
import { canvasSyncManager } from "../utils/canvasSyncManager";
import { recalculateTextCurve } from "../utils/textCurveHelper";
import { Grid, Maximize, Compass } from "lucide-react";


export function withGuidesHidden(canvas, captureFn) {
  if (!canvas || !canvas.getObjects) {
    return null;
  }

  const guideItems = canvas.getObjects().filter((o) => o.excludeFromExport).map((o) => ({
    obj: o,
    wasVisible: o.visible
  }));

  guideItems.forEach(({ obj }) => obj.set("visible", false));

  try {
    if (canvas.requestRenderAll) {
      canvas.requestRenderAll();
    }
    return captureFn();
  } finally {
    guideItems.forEach(({ obj, wasVisible }) => obj.set("visible", wasVisible));
    if (canvas.requestRenderAll) {
      canvas.requestRenderAll();
    }
  }
}

// ---------------------------------------------------------------------------
// Garment silhouette overlay — uses actual product SVG art from /assets
// ---------------------------------------------------------------------------
import tshirtFrontSvg from "../assets/tshirt_front.svg";
import tshirtBackSvg from "../assets/tshirt_back.svg";
import longSleeveFrontSvg from "../assets/long-sleeve-front-vector.svg";
import longSleeveBackSvg from "../assets/long-sleeve-back-vector.svg";
import hoodieFrontSvg from "../assets/hoodie-front-vector.svg";
import hoodieBackSvg from "../assets/hoodie-back-vector.svg";
import oversizedFrontSvg from "../assets/oversized-front-vector.svg";
import oversizedBackSvg from "../assets/oversized-back-vector.svg";
import sleeveSvg from "../assets/sleeve.svg";

// Map each product + view combination to the right SVG asset.
const GARMENT_SVGS = {
  "half-sleeve": { front: tshirtFrontSvg, back: tshirtBackSvg },
  "long-sleeve": { front: longSleeveFrontSvg, back: longSleeveBackSvg },
  "hoodie": { front: hoodieFrontSvg, back: hoodieBackSvg },
  "oversized": { front: oversizedFrontSvg, back: oversizedBackSvg },
  "sports-jersey": { front: tshirtFrontSvg, back: tshirtBackSvg, left: sleeveSvg, right: sleeveSvg },
};

function getGarmentSvg(product, view) {
  const productSvgs = GARMENT_SVGS[product] || GARMENT_SVGS["half-sleeve"];
  const v = (view || "").toLowerCase();
  if (v === "back") return productSvgs.back;
  if (v === "left" || v.includes("left")) return productSvgs.left || sleeveSvg;
  if (v === "right" || v.includes("right")) return productSvgs.right || sleeveSvg;
  return productSvgs.front;
}

function GarmentSilhouette({ product, view, width, height }) {
  const svgSrc = getGarmentSvg(product, view);
  const productColor = useCustomizerStore((state) => state.productColor) || "#FFFFFF";

  const isDarkColor = (color) => {
    if (!color) return false;
    let hex = color.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    }
    return false;
  };

  const dark = isDarkColor(productColor);

  return (
    <div
      className="absolute inset-0 z-[2] pointer-events-none flex items-center justify-center overflow-hidden"
      style={{ width, height }}
      aria-hidden="true"
    >
      {/* 1. Color Mask Fill: shapes solid t-shirt background in productColor */}
      <div
        className="w-full h-full transition-colors duration-300"
        style={{
          backgroundColor: productColor,
          WebkitMaskImage: `url(${svgSrc})`,
          maskImage: `url(${svgSrc})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
      />

      {/* 2. Vector Lines & Seams Overlay */}
      <img
        src={svgSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain select-none transition-all duration-300"
        style={{
          mixBlendMode: dark ? "screen" : "multiply",
          opacity: dark ? 0.75 : 0.85,
          filter: dark ? "invert(0.85)" : "none",
        }}
        draggable={false}
      />
    </div>
  );
}

// Ticks ruler component drawing inches (50px = 1 inch)
function CanvasRuler({ orientation, length, zoom }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Support Retina screens
    const ratio = window.devicePixelRatio || 1;
    if (orientation === "horizontal") {
      canvas.width = length * ratio;
      canvas.height = 24 * ratio;
      canvas.style.width = `${length}px`;
      canvas.style.height = `24px`;
    } else {
      canvas.width = 24 * ratio;
      canvas.height = length * ratio;
      canvas.style.width = `24px`;
      canvas.style.height = `${length}px`;
    }

    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, length, 24);
    ctx.strokeStyle = "#94a3b8"; // slate-400
    ctx.fillStyle = "#64748b"; // slate-500
    ctx.font = "9px sans-serif";
    ctx.lineWidth = 1;

    const inchPx = 50; // 50px = 1 inch
    const divisions = 5; // Ticks every 10px (0.2 inch)

    if (orientation === "horizontal") {
      ctx.beginPath();
      ctx.moveTo(0, 23);
      ctx.lineTo(length, 23);
      ctx.stroke();

      for (let i = 0; i <= length; i += inchPx / divisions) {
        const isInch = i % inchPx === 0;
        const tickHeight = isInch ? 14 : i % (inchPx / 2) === 0 ? 8 : 4;

        ctx.beginPath();
        ctx.moveTo(i, 24 - tickHeight);
        ctx.lineTo(i, 23);
        ctx.stroke();

        if (isInch && i > 0) {
          const val = i / inchPx;
          ctx.fillText(`${val}"`, i + 3, 11);
        }
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(23, 0);
      ctx.lineTo(23, length);
      ctx.stroke();

      for (let i = 0; i <= length; i += inchPx / divisions) {
        const isInch = i % inchPx === 0;
        const tickWidth = isInch ? 14 : i % (inchPx / 2) === 0 ? 8 : 4;

        ctx.beginPath();
        ctx.moveTo(24 - tickWidth, i);
        ctx.lineTo(23, i);
        ctx.stroke();

        if (isInch && i > 0) {
          const val = i / inchPx;
          ctx.save();
          ctx.translate(10, i + 3);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(`${val}"`, 0, 0);
          ctx.restore();
        }
      }
    }
  }, [orientation, length, zoom]);

  return <canvas ref={canvasRef} className="bg-slate-100" />;
}

// Single active canvas editor viewport wrapper
function SingleCanvasViewport({ view, printArea, manualSync, isSelected, currentProduct }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const {
    registerCanvas,
    unregisterCanvas,
    setActiveCanvas,
    setSelectedObject
  } = useCanvas();

  const gridVisible = useCustomizerStore((state) => state.gridVisible);
  const rulersVisible = useCustomizerStore((state) => state.rulersVisible);
  const canvasZoom = useCustomizerStore((state) => state.canvasZoom);
  const recalculatePrice = useCustomizerStore((state) => state.recalculatePrice);
  const pushSnapshot = useCustomizerStore((state) => state.pushSnapshot);

  // Pad canvas size by 50px around the print area box
  const padding = 50;
  const canvasWidth = printArea.width + padding * 2;
  const canvasHeight = printArea.height + padding * 2;

  const isSleeveView = (view || "").toLowerCase().includes("left") || (view || "").toLowerCase().includes("right");

  let boxLeft, boxTop, boxWidth, boxHeight;

  if (isSleeveView) {
    // Aligns precisely with sleeve.svg outline boundaries
    boxLeft = padding + 180; // 230
    boxTop = padding + 200;  // 250
    boxWidth = 240;
    boxHeight = 380;
  } else {
    const defaultBoxWidth = Math.floor(printArea.width * 0.8);
    const defaultBoxHeight = Math.floor(printArea.height * 0.8);
    const boxSize = Math.min(defaultBoxWidth, defaultBoxHeight);
    boxLeft = padding + (printArea.width - boxSize) / 2;
    boxTop = padding + (printArea.height - boxSize) / 2;
    boxWidth = boxSize;
    boxHeight = boxSize;
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug(
      `[CanvasEditor:${view}] printArea=${printArea.width}x${printArea.height} -> boxWidth=${boxWidth}, boxHeight=${boxHeight} (left:${boxLeft}, top:${boxTop})`
    );
  }

  useEffect(() => {
    if (!canvasRef.current) return;

    if (fabricCanvasRef.current) {
      try { fabricCanvasRef.current.dispose(); } catch (_) { }
      fabricCanvasRef.current = null;
    }

    // Initialize Fabric
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "transparent",
      preserveObjectStacking: true,
    });

    canvas.__canvas_id = `fabric_${view}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`🎨 [CanvasEditor] CREATED FABRIC CANVAS: view = ${view}, ID = ${canvas.__canvas_id}`);

    fabricCanvasRef.current = canvas;

    // Immediately register canvas into context and activate if this view is selected
    registerCanvas(view, canvas, isSelected);

    // Render print area dotted outline box
    const printAreaBox = new fabric.Rect({
      left: boxLeft,
      top: boxTop,
      width: boxWidth,
      height: boxHeight,
      fill: "transparent",
      stroke: "transparent",
      strokeWidth: 0,
      selectable: false,
      evented: false,
      excludeFromExport: true,
      visible: false,
    });

    canvas.add(printAreaBox);
    canvas.sendObjectToBack(printAreaBox);

    const triggerSync = () => {
      const stateDump = {};
      const views = ["front", "back", "left", "right", "pocket", "hood"];
      views.forEach((v) => {
        const stored = localStorage.getItem(`tshirt-designer-${v}`);
        stateDump[v] = stored ? JSON.parse(stored) : [];
      });
      stateDump[view] = canvas.getObjects().filter(o => o !== printAreaBox).map(o => o.toJSON(["isRosterName", "isRosterNumber", "isJerseyText", "isJerseyName", "isJerseyNumber"]));

      localStorage.setItem(`tshirt-designer-${view}`, JSON.stringify(stateDump[view]));

      recalculatePrice(stateDump);
      manualSync?.(view);
    };

    const pushStateSnapshot = canvasSyncManager.debounce(() => {
      const stateDump = {};
      ["front", "back", "left", "right", "pocket", "hood"].forEach((v) => {
        const stored = localStorage.getItem(`tshirt-designer-${v}`);
        stateDump[v] = stored ? JSON.parse(stored) : [];
      });
      stateDump[view] = canvas.getObjects().filter(o => o !== printAreaBox).map(o => o.toJSON(["isRosterName", "isRosterNumber", "isJerseyText", "isJerseyName", "isJerseyNumber"]));
      pushSnapshot(stateDump);
    }, 150);

    // Load initial objects from localStorage
    const stored = localStorage.getItem(`tshirt-designer-${view}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          fabric.util.enlivenObjects(parsed)
            .then((objects) => {
              objects.forEach((obj, idx) => {
                const item = parsed[idx];
                if (item) {
                  if (item.isRosterName) obj.isRosterName = item.isRosterName;
                  if (item.isRosterNumber) obj.isRosterNumber = item.isRosterNumber;
                  if (item.isJerseyText) obj.isJerseyText = item.isJerseyText;
                  if (item.isJerseyName) obj.isJerseyName = item.isJerseyName;
                  if (item.isJerseyNumber) obj.isJerseyNumber = item.isJerseyNumber;
                }
                canvas.add(obj);
              });
              canvas.renderAll();
              // Trigger sync after objects are loaded
              triggerSync();
            })
            .catch((err) => {
              console.error(`Error loading initial objects for ${view} canvas:`, err);
            });
        }
      } catch (e) {
        console.error(`Error parsing stored objects for ${view} canvas:`, e);
      }
    }

    // Boundary constraint logic (Restrict to the printable box)
    const clampPosition = (obj) => {
      if (!obj) return;
      const width = obj.getScaledWidth();
      const height = obj.getScaledHeight();

      if (!width || !height || !isFinite(width) || !isFinite(height)) return;

      let minX = boxLeft;
      let maxX = boxLeft + boxWidth - width;
      let minY = boxTop;
      let maxY = boxTop + boxHeight - height;

      if (obj.originX === "center") {
        minX += width / 2;
        maxX += width / 2;
      }
      if (obj.originY === "center") {
        minY += height / 2;
        maxY += height / 2;
      }

      if (isFinite(minX) && isFinite(maxX) && obj.left !== undefined && isFinite(obj.left)) {
        if (obj.left < minX) obj.left = minX;
        if (obj.left > maxX) obj.left = maxX;
      }
      if (isFinite(minY) && isFinite(maxY) && obj.top !== undefined && isFinite(obj.top)) {
        if (obj.top < minY) obj.top = minY;
        if (obj.top > maxY) obj.top = maxY;
      }
    };

    const handleObjectMoving = (e) => {
      const obj = e.target;
      if (!obj || obj === printAreaBox) return;

      if (obj.type === "activeSelection") {
        obj.getObjects().forEach((subObj) => {
          clampPosition(subObj);
        });
      } else {
        clampPosition(obj);
      }
      triggerSync();
    };

    const constrainToBox = (obj) => {
      if (!obj || !obj.width || !obj.height || !isFinite(obj.width) || !isFinite(obj.height)) return;
      const width = obj.getScaledWidth();
      const height = obj.getScaledHeight();

      if (width > boxWidth && obj.width > 0) {
        obj.scaleX = boxWidth / obj.width;
      }
      if (height > boxHeight && obj.height > 0) {
        obj.scaleY = boxHeight / obj.height;
      }

      clampPosition(obj);
    };

    const handleObjectScaling = (e) => {
      const obj = e.target;
      if (!obj || obj === printAreaBox) return;
      constrainToBox(obj);
      triggerSync();
    };

    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:scaling", handleObjectScaling);

    canvas.on("selection:created", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:updated", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:cleared", () => setSelectedObject(null));



    canvas.on("text:changed", (e) => {
      const obj = e.target;
      if (obj) {
        recalculateTextCurve(obj);
        canvas.renderAll();
      }
      triggerSync();
      pushStateSnapshot();
    });

    canvas.on("object:modified", () => {
      triggerSync();
      pushStateSnapshot();
    });
    canvas.on("object:added", (e) => {
      const obj = e.target;
      if (obj && obj !== printAreaBox && obj.name !== "guide-line") {
        console.log(`➕ [CanvasEditor:object:added] Added object to Canvas ID = ${canvas.__canvas_id}, view = ${view}, type = ${obj.type}, width = ${obj.width}, height = ${obj.height}, scaleX = ${obj.scaleX}, scaleY = ${obj.scaleY}, left = ${obj.left}, top = ${obj.top}`);
        constrainToBox(obj);
        canvas.requestRenderAll();
        triggerSync();
        pushStateSnapshot();
      }
    });
    canvas.on("object:removed", (e) => {
      if (e.target !== printAreaBox) {
        triggerSync();
        pushStateSnapshot();
      }
    });

    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
      e.preventDefault();
      if (!e.dataTransfer.files?.[0]) return;
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgObj = new Image();
        imgObj.crossOrigin = "anonymous";
        imgObj.src = event.target.result;
        imgObj.onload = () => {
          const image = new fabric.Image(imgObj, { crossOrigin: "anonymous" });
          image.scaleToWidth(150);
          image.set({
            left: boxLeft + (boxSize - 150) / 2,
            top: boxTop + (boxSize - image.getScaledHeight()) / 2,
            crossOrigin: "anonymous",
          });
          canvas.add(image);
          canvas.setActiveObject(image);
          canvas.renderAll();
          canvas.fire("object:modified");
          canvasSyncManager.getCanvasTexture(canvas);
        };
      };
      reader.readAsDataURL(file);
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener("dragover", handleDragOver);
    containerEl.addEventListener("drop", handleDrop);

    setTimeout(triggerSync, 200);

    return () => {
      containerEl.removeEventListener("dragover", handleDragOver);
      containerEl.removeEventListener("drop", handleDrop);
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:scaling", handleObjectScaling);
      unregisterCanvas(view);
      try { canvas.dispose(); } catch (_) { }
      fabricCanvasRef.current = null;
    };
  }, [view, printArea.width, printArea.height, registerCanvas, unregisterCanvas, isSelected]);

  useEffect(() => {
    if (isSelected && fabricCanvasRef.current) {
      setActiveCanvas(fabricCanvasRef.current);
    }
  }, [isSelected, setActiveCanvas]);

  const drawCenterGuides = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const existing = canvas.getObjects().filter(o => o.name === "guide-line");
    existing.forEach(o => canvas.remove(o));

    const guideStyle = {
      stroke: "#c084fc",
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      name: "guide-line",
      excludeFromExport: true,
    };

    const vert = new fabric.Line([boxLeft + boxWidth / 2, boxTop, boxLeft + boxWidth / 2, boxTop + boxHeight], guideStyle);
    const horiz = new fabric.Line([boxLeft, boxTop + boxHeight / 2, boxLeft + boxWidth, boxTop + boxHeight / 2], guideStyle);

    canvas.add(vert, horiz);
    canvas.renderAll();

    setTimeout(() => {
      canvas.remove(vert, horiz);
      canvas.renderAll();
    }, 2500);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center bg-white rounded-2xl border border-slate-200/80 shadow-sm -mb-[400px] p-4 select-none scrollbar-hide"
    >
      {/* Top Controls Toolbar */}
      <div className="sticky top-0 z-50 w-full flex items-center justify-between border-b border-slate-100 bg-white pb-3.5 mb-4">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="h-4.5 w-4.5 text-amber-500" />
          {view.toUpperCase()} Workspace
        </span>
        <button
          onClick={drawCenterGuides}
          className="px-3 h-8 bg-slate-50 border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-600 hover:text-violet-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95 cursor-pointer"
        >
          <Maximize className="h-3.5 w-3.5" /> Center Alignment Lines
        </button>
      </div>

      {/* Grid underlay background */}
      <div
        className="relative overflow-hidden border  border-gray-900 rounded-xl"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          transform: "scale(0.6)", // Explicitly sets the baseline window view zoom down to 60%
          transformOrigin: "center top",
        }}
      >
        {/* Horizontal Ruler */}
        {rulersVisible && (
          <div className="absolute top-0 left-[24px] right-0 h-[24px] z-20">
            <CanvasRuler orientation="horizontal" length={canvasWidth} zoom={canvasZoom} />
          </div>
        )}

        {/* Vertical Ruler */}
        {rulersVisible && (
          <div className="absolute top-[24px] left-0 bottom-0 w-[24px] z-20">
            <CanvasRuler orientation="vertical" length={canvasHeight} zoom={canvasZoom} />
          </div>
        )}

        {/* Dynamic Grid Dot Background */}
        <div
          className={`absolute inset-0 z-0 pointer-events-none transition-opacity ${gridVisible ? "opacity-100" : "opacity-0"
            }`}
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)",
            backgroundSize: "20px 20px",
            backgroundColor: "#fafafa",
          }}
        />

        {/* Garment silhouette background */}
        <GarmentSilhouette product={currentProduct} view={view} width={canvasWidth} height={canvasHeight} />

        <div className="relative z-10">
          <canvas
            ref={canvasRef}
            className="relative z-10 block"
          />
        </div>
      </div>
    </div>
  );
}

export default function CanvasEditor({ manualSync }) {
  const currentProduct = useCustomizerStore((state) => state.currentProduct);
  const selectedView = useCustomizerStore((state) => state.selectedView);
  const setSelectedView = useCustomizerStore((state) => state.setSelectedView);

  const gridVisible = useCustomizerStore((state) => state.gridVisible);
  const setGridVisible = useCustomizerStore((state) => state.setGridVisible);
  const rulersVisible = useCustomizerStore((state) => state.rulersVisible);
  const setRulersVisible = useCustomizerStore((state) => state.setRulersVisible);
  const canvasZoom = useCustomizerStore((state) => state.canvasZoom);
  const setCanvasZoom = useCustomizerStore((state) => state.setCanvasZoom);

  // Enforce a solid 100% (value of 1) layout scaling rule when this editor loads
  useEffect(() => {
    setCanvasZoom(1);
  }, [setCanvasZoom]);

  if (currentProduct && !apparelConfig[currentProduct]) {
    console.warn(
      `[CanvasEditor] currentProduct "${currentProduct}" has no matching entry in apparelConfig. ` +
      `Falling back to "half-sleeve". Check that apparelConfig's keys match the store's product identifiers exactly.`
    );
  }
  const productConfig = apparelConfig[currentProduct] || apparelConfig["half-sleeve"];

  return (
    <div className="flex flex-col flex flex-col gap-4 w-full h-full min-h-[500px] gap-4 w-full h-full min-h-[500px]" key={currentProduct}>


      {/* Aspect Switcher tabs for active product */}


      {/* Display active view canvas and hide inactive views */}
      <div className="flex-1 w-full overflow-hidden">
        {productConfig.supportedViews.map((viewKey) => {
          const isSelected = selectedView === viewKey;
          const printArea = productConfig.printAreas[viewKey] || { width: 600, height: 800 };

          return (
            <div
              key={`${currentProduct}-${viewKey}`}
              className={`w-full ${isSelected ? "block animate-in fade-in duration-200" : "hidden"}`}
            >
              <SingleCanvasViewport
                key={`${currentProduct}-${viewKey}`}
                view={viewKey}
                printArea={printArea}
                manualSync={manualSync}
                isSelected={isSelected}
                currentProduct={currentProduct}
              />
            </div>
          );
        })}
      </div>

    </div>
  );
}