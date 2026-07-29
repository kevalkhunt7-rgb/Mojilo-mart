import React, { useEffect, useState } from "react";
import { useCanvas } from "../context/CanvasContext";
import { Move, Layers, Lock, Unlock, Copy, Trash2, Sliders, Ruler, X } from "lucide-react";

export default function ObjectInspector({ onClose, targetObject: propTargetObject }) {
  const { activeCanvas, getActiveCanvas, selectedObject: contextSelectedObject, deleteLayer } = useCanvas();
  const canvas = activeCanvas || getActiveCanvas();

  // Resolve target object: propTargetObject > contextSelectedObject > canvas.getActiveObject()
  const targetObject = propTargetObject || contextSelectedObject || (canvas?.getActiveObject ? canvas.getActiveObject() : null);

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [lockAspect, setLockAspect] = useState(true);

  // Sync state with selected canvas object
  useEffect(() => {
    if (!targetObject) return;

    // Ensure activeCanvas keeps targetObject as selected active object
    if (activeCanvas && typeof activeCanvas.setActiveObject === "function") {
      if (activeCanvas.getActiveObject() !== targetObject) {
        activeCanvas.setActiveObject(targetObject);
        activeCanvas.renderAll();
      }
    }

    const updateInspectorState = () => {
      setCoords({
        x: Math.round(targetObject.left),
        y: Math.round(targetObject.top),
      });
      setDims({
        w: Math.round(targetObject.getScaledWidth ? targetObject.getScaledWidth() : targetObject.width * (targetObject.scaleX || 1)),
        h: Math.round(targetObject.getScaledHeight ? targetObject.getScaledHeight() : targetObject.height * (targetObject.scaleY || 1)),
      });
      setRotation(Math.round(targetObject.angle || 0));
      setOpacity(targetObject.opacity ?? 1);
      setLockAspect(targetObject.lockUniScaling || false);
    };

    // Update coordinates while items move/scale
    targetObject.on("moving", updateInspectorState);
    targetObject.on("scaling", updateInspectorState);
    targetObject.on("rotating", updateInspectorState);

    // Initial load
    updateInspectorState();

    return () => {
      targetObject.off("moving", updateInspectorState);
      targetObject.off("scaling", updateInspectorState);
      targetObject.off("rotating", updateInspectorState);
    };
  }, [targetObject, activeCanvas]);

  if (!targetObject || !activeCanvas) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Select an element on the canvas to inspect its properties.
      </div>
    );
  }

  // Handle properties change
  const handleCoordChange = (axis, val) => {
    const numVal = parseFloat(val) || 0;
    targetObject.set(axis === "x" ? "left" : "top", numVal);
    targetObject.setCoords();
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
    setCoords({ ...coords, [axis]: numVal });
  };

  const handleDimChange = (dimension, val) => {
    const numVal = parseFloat(val) || 1;
    if (dimension === "w") {
      const originalW = targetObject.width;
      const newScaleX = numVal / originalW;
      
      if (lockAspect) {
        const ratio = targetObject.scaleY / targetObject.scaleX;
        targetObject.set({
          scaleX: newScaleX,
          scaleY: newScaleX * ratio,
        });
      } else {
        targetObject.set("scaleX", newScaleX);
      }
    } else {
      const originalH = targetObject.height;
      const newScaleY = numVal / originalH;

      if (lockAspect) {
        const ratio = targetObject.scaleX / targetObject.scaleY;
        targetObject.set({
          scaleY: newScaleY,
          scaleX: newScaleY * ratio,
        });
      } else {
        targetObject.set("scaleY", newScaleY);
      }
    }
    
    targetObject.setCoords();
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
    
    setDims({
      w: Math.round(targetObject.getScaledWidth ? targetObject.getScaledWidth() : targetObject.width * (targetObject.scaleX || 1)),
      h: Math.round(targetObject.getScaledHeight ? targetObject.getScaledHeight() : targetObject.height * (targetObject.scaleY || 1)),
    });
  };

  const handleRotationChange = (val) => {
    const numVal = parseFloat(val) || 0;
    targetObject.set("angle", numVal);
    targetObject.setCoords();
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
    setRotation(numVal);
  };

  const handleOpacityChange = (val) => {
    const numVal = parseFloat(val);
    targetObject.set("opacity", numVal);
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
    setOpacity(numVal);
  };

  const toggleLockAspect = () => {
    const newLock = !lockAspect;
    targetObject.set({
      lockUniScaling: newLock,
      uniformScaling: newLock,
    });
    activeCanvas.renderAll();
    setLockAspect(newLock);
  };

  const duplicateObject = () => {
    targetObject.clone((clonedObj) => {
      clonedObj.set({
        left: targetObject.left + 20,
        top: targetObject.top + 20,
      });
      activeCanvas.add(clonedObj);
      activeCanvas.setActiveObject(clonedObj);
      activeCanvas.renderAll();
      activeCanvas.fire("object:modified");
    });
  };

  // Convert dimensions to physical inches (50px = 1 inch)
  const widthInches = (dims.w / 50).toFixed(1);
  const heightInches = (dims.h / 50).toFixed(1);
  const areaSqInches = (parseFloat(widthInches) * parseFloat(heightInches)).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
          Object Inspector
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase">
            {targetObject.type}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Coordinates (X, Y) */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Position (Pixels)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2 h-9">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-2">X</span>
            <input
              type="number"
              value={coords.x}
              onChange={(e) => handleCoordChange("x", e.target.value)}
              className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2 h-9">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-2">Y</span>
            <input
              type="number"
              value={coords.y}
              onChange={(e) => handleCoordChange("y", e.target.value)}
              className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Dimensions (W, H, Lock Aspect) with live inch readout */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Dimensions</label>
          <button 
            onClick={toggleLockAspect}
            className={`flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              lockAspect ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {lockAspect ? (
              <>
                <Lock className="h-3 w-3" /> Locked Ratio
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3" /> Free Scale
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Width */}
          <div className="space-y-0.5">
            <div className="flex items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2 h-9">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-2">W</span>
              <input
                type="number"
                value={dims.w}
                onChange={(e) => handleDimChange("w", e.target.value)}
                className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700 dark:text-slate-200"
              />
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 ml-1 whitespace-nowrap">px</span>
            </div>
            <div className="text-[10px] font-bold text-[#997241] dark:text-[#d4af37] text-center tracking-wide">
              {widthInches}"
            </div>
          </div>
          {/* Height */}
          <div className="space-y-0.5">
            <div className="flex items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2 h-9">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-2">H</span>
              <input
                type="number"
                value={dims.h}
                onChange={(e) => handleDimChange("h", e.target.value)}
                className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700 dark:text-slate-200"
              />
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 ml-1 whitespace-nowrap">px</span>
            </div>
            <div className="text-[10px] font-bold text-[#997241] dark:text-[#d4af37] text-center tracking-wide">
              {heightInches}"
            </div>
          </div>
        </div>
      </div>

      {/* Live Print Size Badge */}
      <div className="flex items-center justify-center gap-2 p-2.5 bg-[#f2ece6] dark:bg-amber-950/30 border border-violet-200/60 dark:border-amber-800/40 rounded-xl">
        <Ruler className="h-3.5 w-3.5 text-[#997241] dark:text-[#d4af37]" />
        <span className="text-[11px] font-extrabold text-[#997241] dark:text-[#d4af37] tracking-wide">
          {widthInches}" × {heightInches}"
        </span>
        <span className="text-[9px] font-semibold text-[#997241] dark:text-[#d4af37]">
          ({areaSqInches} in²)
        </span>
      </div>

      {/* Rotation & Opacity */}
      <div className="grid grid-cols-2 gap-3.5 pt-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Angle</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => handleRotationChange(e.target.value)}
            className="w-full accent-[#997241] cursor-pointer"
          />
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-right">{rotation}°</div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="w-full accent-[#997241] cursor-pointer"
          />
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-right">{Math.round(opacity * 100)}%</div>
        </div>
      </div>

      {/* Actions (Duplicate / Delete) */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
        <button
          onClick={duplicateObject}
          className="flex items-center justify-center gap-1.5 h-9 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-violet-600 hover:border-violet-100 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-slate-600/80 rounded-lg text-xs font-semibold transition-colors cursor-pointer active:scale-95"
        >
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </button>
        <button
          onClick={() => {
            deleteLayer(targetObject);
            if (onClose) onClose();
          }}
          className="flex items-center justify-center gap-1.5 h-9 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 hover:border-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

    </div>
  );
}

