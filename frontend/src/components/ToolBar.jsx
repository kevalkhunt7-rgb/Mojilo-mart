import { useDispatch, useSelector } from "react-redux";
import * as fabric from "fabric";
import { 
  ImagePlus, 
  Palette, 
  Trash2, 
  Type, 
  RefreshCw, 
  Smile, 
  Shapes,
  Check 
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CANVAS_CONFIG, TSHIRT_COLOR_CODES } from "../constants/designConstants";
import { setTshirtColor } from "../features/tshirtSlice";
import { useCanvas } from "../context/CanvasContext";
import canvasStorageManager from "../utils/canvasStorageManager";

const ToolBar = ({ 
  manualSync, 
  onToggleText, 
  onToggleStickers, 
  onToggleShapes, 
  activeSubPanel 
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const globalTshirtColor = useSelector((state) => state.tshirt.tshirtColor);

  const { activeCanvas, selectedObject } = useCanvas();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const buttonRef = useRef(null);
  const [popoverCoords, setPopoverCoords] = useState({ top: 0, left: 0 });

  // 📦 Local staging color state (Keeps edits decoupled from 3D model until Apply is hit)
  const [localTshirtColor, setLocalTshirtColor] = useState(globalTshirtColor);

  // Sync local color picker input when global Redux color changes out-of-band
  useEffect(() => {
    setLocalTshirtColor(globalTshirtColor);
  }, [globalTshirtColor]);

  useEffect(() => {
    if (isColorPickerOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopoverCoords({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 12,
      });
    }
  }, [isColorPickerOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) return;
      const portalContent = document.getElementById("garment-popover-portal");
      if (portalContent && !portalContent.contains(event.target)) {
        setIsColorPickerOpen(false);
      }
    };
    if (isColorPickerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isColorPickerOpen]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleAddImage = (e) => {
    if (!activeCanvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = () => {
        const image = new fabric.Image(imgObj);
        const maxWidth = CANVAS_CONFIG.width * 0.5;
        const maxHeight = CANVAS_CONFIG.height * 0.5;
        if (image.width > maxWidth || image.height > maxHeight) {
          const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
          image.scale(scale);
        }
        image.set({
          left: (activeCanvas.width - image.getScaledWidth()) / 2,
          top: (activeCanvas.height - image.getScaledHeight()) / 2,
        });
        activeCanvas.add(image);
        activeCanvas.setActiveObject(image);
        activeCanvas.renderAll();
      };
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = () => {
    if (!activeCanvas || !selectedObject) return;
    activeCanvas.remove(selectedObject);
    activeCanvas.discardActiveObject();
    activeCanvas.renderAll();
    manualSync();
  };

  const handleClearAll = () => {
    if (!activeCanvas) return;
    activeCanvas.clear();
    canvasStorageManager.clearCanvasStorage("all");
    activeCanvas.renderAll();
    manualSync();
  };

  // ⚡ INSTANT 2D WORKSPACE PREVIEW & 3D MODEL COLOR SYNC (Real-time update on slider/picker drag)
  const handleLiveColorPreview = (colorValue) => {
    setLocalTshirtColor(colorValue);
    dispatch(setTshirtColor(colorValue));
  };

  // 👕 3D T-SHIRT MODEL SYNC (Finalizes changes and syncs texture map updates)
  const handleApplyGarmentChanges = () => {
    dispatch(setTshirtColor(localTshirtColor));
    
    // Let the 3D model reload texture maps with the newly locked-in tone
    if (manualSync) {
      setTimeout(() => {
        manualSync();
      }, 50);
    }
    setIsColorPickerOpen(false);
  };

  const actionBtnClass =
    "flex flex-col items-center justify-center gap-1.5 h-16 w-full rounded-xl text-[11px] font-medium transition-all duration-200 border bg-white border-gray-100 text-gray-600 hover:text-violet-600 hover:border-violet-100 hover:bg-violet-50/40 active:scale-95 group focus:outline-none cursor-pointer";

  const dangerBtnClass =
    "flex flex-col items-center justify-center gap-1.5 h-16 w-full rounded-xl text-[11px] font-medium transition-all duration-200 border bg-white border-gray-100 text-gray-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/40 active:scale-95 group focus:outline-none cursor-pointer";

  return (
    <div className="w-full flex flex-col gap-4">
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAddImage} className="hidden" />

      <div className="grid grid-cols-2 gap-2">
        <button onClick={triggerFileInput} className={actionBtnClass}>
          <ImagePlus className="h-4.5 w-4.5 text-gray-400 group-hover:text-violet-500" />
          <span>Uploads</span>
        </button>

        <button
          onClick={onToggleText}
          className={`${actionBtnClass} ${activeSubPanel === 'text' ? 'bg-violet-50 border-violet-200 text-violet-600' : ''}`}
        >
          <Type className="h-4.5 w-4.5 text-gray-400 group-hover:text-violet-500" />
          <span>Text</span>
        </button>

        <button
          onClick={onToggleStickers}
          className={`${actionBtnClass} ${activeSubPanel === 'stickers' ? 'bg-violet-50 border-violet-200 text-violet-600' : ''}`}
        >
          <Smile className="h-4.5 w-4.5 text-gray-400 group-hover:text-violet-500" />
          <span>Stickers</span>
        </button>

        <button
          onClick={onToggleShapes}
          className={`${actionBtnClass} ${activeSubPanel === 'shapes' ? 'bg-violet-50 border-violet-200 text-violet-600' : ''}`}
        >
          <Shapes className="h-4.5 w-4.5 text-gray-400 group-hover:text-violet-500" />
          <span>Shapes</span>
        </button>

        {/* Garment Color System Popover Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
          className={`${actionBtnClass} ${isColorPickerOpen ? 'bg-violet-50 border-violet-200 text-violet-600' : ''}`}
        >
          <Palette className="h-4.5 w-4.5 text-gray-400 group-hover:text-violet-500" />
          <span>Colors</span>
        </button>

        {isColorPickerOpen && createPortal(
          <div
            id="garment-popover-portal"
            className="fixed z-[9999] w-64 p-4 rounded-xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{ top: `${popoverCoords.top}px`, left: `${popoverCoords.left}px` }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 mb-3">
              <h4 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">Garment Color</h4>
              <p className="text-[11px] text-gray-400 leading-normal">Drag spectrum picker or pick a preset fabric tone</p>
            </div>

            {/* Custom Color Drag Box */}
            <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 border border-slate-100 rounded-xl">
              <input
                type="color"
                value={localTshirtColor}
                onInput={(e) => handleLiveColorPreview(e.target.value)} // Interactive live freedom inside 2D Workspace
                onChange={(e) => handleLiveColorPreview(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200/60 cursor-pointer p-0 bg-transparent shrink-0"
              />
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] font-bold uppercase text-gray-400">Custom Spectrum</span>
                <span className="text-xs font-mono font-semibold text-gray-700 uppercase">{localTshirtColor}</span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="border-t border-gray-100 pt-3">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-2">Preset Samples</span>
              <div className="flex flex-wrap gap-2">
                {TSHIRT_COLOR_CODES.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border shadow-inner hover:scale-110 active:scale-95 transition-transform p-0 focus:outline-none cursor-pointer ${
                      localTshirtColor === color ? 'border-violet-600 ring-2 ring-violet-100' : 'border-gray-200/80'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleLiveColorPreview(color)}
                  />
                ))}
              </div>
            </div>

            {/* 👕 THE "APPLY TO T-SHIRT MODEL" CONFIRMATION BUTTON */}
            <button
              onClick={handleApplyGarmentChanges}
              className="w-full mt-4 h-9 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" /> Apply to T-Shirt Model
            </button>
          </div>,
          document.body
        )}
      </div>

      <hr className="border-gray-100 my-0.5" />

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleDelete} className={dangerBtnClass} disabled={!selectedObject}>
          <Trash2 className="h-4.5 w-4.5 text-gray-400 group-hover:text-rose-500" />
          <span>Delete</span>
        </button>
        <button onClick={handleClearAll} className={dangerBtnClass}>
          <RefreshCw className="h-4.5 w-4.5 text-gray-400 group-hover:text-rose-500" />
          <span>Reset all</span>
        </button>
      </div>
    </div>
  );
};

export default ToolBar;