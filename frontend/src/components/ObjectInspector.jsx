import React, { useEffect, useState } from "react";
import { useCanvas } from "../context/CanvasContext";
import { Move, Layers, Lock, Unlock, Copy, Trash2, Sliders, Ruler } from "lucide-react";

export default function ObjectInspector() {
  const { activeCanvas, selectedObject, deleteLayer } = useCanvas();
  
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [lockAspect, setLockAspect] = useState(true);

  // Sync state with selected canvas object
  useEffect(() => {
    if (!selectedObject) return;

    const updateInspectorState = () => {
      setCoords({
        x: Math.round(selectedObject.left),
        y: Math.round(selectedObject.top),
      });
      setDims({
        w: Math.round(selectedObject.getScaledWidth()),
        h: Math.round(selectedObject.getScaledHeight()),
      });
      setRotation(Math.round(selectedObject.angle || 0));
      setOpacity(selectedObject.opacity || 1);
      setLockAspect(selectedObject.lockUniScaling || false);
    };

    // Update coordinates while items move/scale
    selectedObject.on("moving", updateInspectorState);
    selectedObject.on("scaling", updateInspectorState);
    selectedObject.on("rotating", updateInspectorState);

    // Initial load
    updateInspectorState();

    return () => {
      selectedObject.off("moving", updateInspectorState);
      selectedObject.off("scaling", updateInspectorState);
      selectedObject.off("rotating", updateInspectorState);
    };
  }, [selectedObject]);

  if (!selectedObject || !activeCanvas) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 text-center text-xs text-slate-400">
        Select an element on the canvas to inspect its properties.
      </div>
    );
  }

  // Handle properties change
  const handleCoordChange = (axis, val) => {
    const numVal = parseFloat(val) || 0;
    selectedObject.set(axis === "x" ? "left" : "top", numVal);
    selectedObject.setCoords();
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
    setCoords({ ...coords, [axis]: numVal });
  };

  const handleDimChange = (dimension, val) => {
    const numVal = parseFloat(val) || 1;
    if (dimension === "w") {
      const originalW = selectedObject.width;
      const newScaleX = numVal / originalW;
      
      if (lockAspect) {
        const ratio = selectedObject.scaleY / selectedObject.scaleX;
        selectedObject.set({
          scaleX: newScaleX,
          scaleY: newScaleX * ratio,
        });
      } else {
        selectedObject.set("scaleX", newScaleX);
      }
    } else {
      const originalH = selectedObject.height;
      const newScaleY = numVal / originalH;

      if (lockAspect) {
        const ratio = selectedObject.scaleX / selectedObject.scaleY;
        selectedObject.set({
          scaleY: newScaleY,
          scaleX: newScaleY * ratio,
        });
      } else {
        selectedObject.set("scaleY", newScaleY);
      }
    }
    
    selectedObject.setCoords();
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
    
    setDims({
      w: Math.round(selectedObject.getScaledWidth()),
      h: Math.round(selectedObject.getScaledHeight()),
    });
  };

  const handleRotationChange = (val) => {
    const numVal = parseFloat(val) || 0;
    selectedObject.set("angle", numVal);
    selectedObject.setCoords();
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
    setRotation(numVal);
  };

  const handleOpacityChange = (val) => {
    const numVal = parseFloat(val);
    selectedObject.set("opacity", numVal);
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
    setOpacity(numVal);
  };

  const toggleLockAspect = () => {
    const newLock = !lockAspect;
    selectedObject.set({
      lockUniScaling: newLock,
      uniformScaling: newLock,
    });
    activeCanvas.renderAll();
    setLockAspect(newLock);
  };

  const duplicateObject = () => {
    selectedObject.clone((clonedObj) => {
      clonedObj.set({
        left: selectedObject.left + 20,
        top: selectedObject.top + 20,
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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 w-full space-y-4 -mt-16 md:-mt-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="h-4.5 w-4.5 text-slate-700" />
          Object Inspector
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
          {selectedObject.type}
        </span>
      </div>

      {/* Coordinates (X, Y) */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Position (Pixels)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 h-9">
            <span className="text-[10px] font-bold text-slate-400 mr-2">X</span>
            <input
              type="number"
              value={coords.x}
              onChange={(e) => handleCoordChange("x", e.target.value)}
              className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700"
            />
          </div>
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 h-9">
            <span className="text-[10px] font-bold text-slate-400 mr-2">Y</span>
            <input
              type="number"
              value={coords.y}
              onChange={(e) => handleCoordChange("y", e.target.value)}
              className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Dimensions (W, H, Lock Aspect) with live inch readout */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dimensions</label>
          <button 
            onClick={toggleLockAspect}
            className={`flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
              lockAspect ? "text-violet-600" : "text-slate-400 hover:text-slate-600"
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
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 h-9">
              <span className="text-[10px] font-bold text-slate-400 mr-2">W</span>
              <input
                type="number"
                value={dims.w}
                onChange={(e) => handleDimChange("w", e.target.value)}
                className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700"
              />
              <span className="text-[9px] font-medium text-slate-400 ml-1 whitespace-nowrap">px</span>
            </div>
            <div className="text-[10px] font-bold text-[#997241] text-center tracking-wide">
              {widthInches}"
            </div>
          </div>
          {/* Height */}
          <div className="space-y-0.5">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 h-9">
              <span className="text-[10px] font-bold text-slate-400 mr-2">H</span>
              <input
                type="number"
                value={dims.h}
                onChange={(e) => handleDimChange("h", e.target.value)}
                className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700"
              />
              <span className="text-[9px] font-medium text-slate-400 ml-1 whitespace-nowrap">px</span>
            </div>
            <div className="text-[10px] font-bold text-[#997241] text-center tracking-wide">
              {heightInches}"
            </div>
          </div>
        </div>
      </div>

      {/* Live Print Size Badge */}
      <div className="flex items-center justify-center gap-2 p-2.5 bg-[#f2ece6] border border-violet-200/60 rounded-xl">
        <Ruler className="h-3.5 w-3.5 text-[#997241]" />
        <span className="text-[11px] font-extrabold text-[#997241] tracking-wide">
          {widthInches}" × {heightInches}"
        </span>
        <span className="text-[9px] font-semibold text-[#997241]">
          ({areaSqInches} in²)
        </span>
      </div>

      {/* Rotation & Opacity */}
      <div className="grid grid-cols-2 gap-3.5 pt-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Angle</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => handleRotationChange(e.target.value)}
            className="w-full accent-[#997241] cursor-pointer"
          />
          <div className="text-[10px] font-semibold text-slate-500 text-right">{rotation}°</div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="w-full accent-[#997241] cursor-pointer"
          />
          <div className="text-[10px] font-semibold text-slate-500 text-right">{Math.round(opacity * 100)}%</div>
        </div>
      </div>

      {/* Actions (Duplicate / Delete) */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
        <button
          onClick={duplicateObject}
          className="flex items-center justify-center gap-1.5 h-9 bg-slate-50 border border-slate-200 text-slate-600 hover:text-violet-600 hover:border-violet-100 hover:bg-violet-50/50 rounded-lg text-xs font-semibold transition-colors cursor-pointer active:scale-95"
        >
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </button>
        <button
          onClick={() => deleteLayer(selectedObject)}
          className="flex items-center justify-center gap-1.5 h-9 bg-rose-50 border border-rose-200 text-rose-600 hover:text-white hover:bg-rose-600 hover:border-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

    </div>
  );
}
