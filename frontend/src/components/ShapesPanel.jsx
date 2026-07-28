import { useState, useEffect } from "react";
import * as fabric from "fabric";
import { useCanvas } from "../context/CanvasContext";
import { 
  Square, 
  Circle, 
  Triangle, 
  Minus, 
  Star, 
  Hexagon, 
  Heart,
  Pentagon,
  Check,
  Activity,
  Maximize2,
  Sliders
} from "lucide-react";

export default function ShapesPanel({ manualSync }) {
  const { activeCanvas } = useCanvas();
  const [selectedShape, setSelectedShape] = useState(null);

  // Dynamic Custom Polygon Sides Input State
  const [customSides, setCustomSides] = useState(8); // Default to Octagon

  // Staging local states for UI management (Prevents 3D Model Lag)
  const [tempShapeColor, setTempShapeColor] = useState("#3b82f6");
  const [tempBorderColor, setTempBorderColor] = useState("#000000");
  const [tempBorderWidth, setTempBorderWidth] = useState(0);

  // Sync state when active canvas selection updates
  useEffect(() => {
    if (!activeCanvas) return;

    const updateShapeControls = (e) => {
      let activeObj = e?.target || activeCanvas.getActiveObject();

      if (activeObj && activeObj.type === "activeSelection") {
        activeObj = activeObj.getObjects()[0];
      }
      
      if (!activeObj) {
        setSelectedShape(null);
        return;
      }

      const isText = activeObj.type === "textbox" || activeObj.type === "text" || activeObj.isType?.("Text") || activeObj.isType?.("Textbox");

      if (activeObj && !isText) {
        setSelectedShape(activeObj);
        
        const isLineType = activeObj.type === "line" || activeObj.isType?.("Line");
        if (isLineType) {
          setTempShapeColor(activeObj.get("stroke") || "#3b82f6");
        } else {
          setTempShapeColor(activeObj.get("fill") || "#3b82f6");
        }
        setTempBorderColor(activeObj.get("stroke") || "#000000");
        setTempBorderWidth(activeObj.get("strokeWidth") || 0);
      } else {
        setSelectedShape(null);
      }
    };

    activeCanvas.on("selection:created", updateShapeControls);
    activeCanvas.on("selection:updated", updateShapeControls);
    activeCanvas.on("selection:cleared", () => setSelectedShape(null));
    activeCanvas.on("canvas:cleared", () => setSelectedShape(null));

    const currentActive = activeCanvas.getActiveObject();
    if (currentActive) {
      updateShapeControls({ target: currentActive });
    }

    return () => {
      activeCanvas.off("selection:created", updateShapeControls);
      activeCanvas.off("selection:updated", updateShapeControls);
    };
  }, [activeCanvas]);

  // 🛠️ Dynamic Shape Engine (Supports native presets + Custom Math generation)
  const addShape = (shapeType) => {
    if (!activeCanvas) return;

    let shapeObj;
    const baseConfig = {
      left: activeCanvas.width / 2,
      top: activeCanvas.height / 2,
      fill: "#3b82f6",
      stroke: "#000000",
      strokeWidth: 0,
      originX: "center",
      originY: "center",
    };

    switch (shapeType) {
      case "rect":
        shapeObj = new fabric.Rect({ ...baseConfig, width: 80, height: 80 });
        break;
      case "circle":
        shapeObj = new fabric.Circle({ ...baseConfig, radius: 40 });
        break;
      case "triangle":
        shapeObj = new fabric.Triangle({ ...baseConfig, width: 80, height: 80 });
        break;
      case "line":
        shapeObj = new fabric.Line([50, 50, 150, 50], {
          ...baseConfig,
          stroke: "#3b82f6",
          strokeWidth: 4,
          strokeLineCap: "round",
        });
        break;
      case "pentagon":
        shapeObj = new fabric.Polygon([
          { x: 40, y: 0 }, { x: 80, y: 30 }, { x: 65, y: 80 }, { x: 15, y: 80 }, { x: 0, y: 30 }
        ], baseConfig);
        break;
      case "hexagon":
        shapeObj = new fabric.Polygon([
          { x: 40, y: 0 }, { x: 80, y: 23 }, { x: 80, y: 68 }, { x: 40, y: 90 }, { x: 0, y: 68 }, { x: 0, y: 23 }
        ], baseConfig);
        break;
      case "star":
        shapeObj = new fabric.Polygon([
          { x: 40, y: 0 }, { x: 52, y: 25 }, { x: 80, y: 25 }, { x: 58, y: 43 }, 
          { x: 66, y: 70 }, { x: 40, y: 53 }, { x: 14, y: 70 }, { x: 22, y: 43 }, 
          { x: 0, y: 25 }, { x: 28, y: 25 }
        ], baseConfig);
        break;
      case "heart":
        const heartPath = "M 24 9 C 14 0 0 0 0 13 C 0 23 12 30 24 39 C 36 30 48 23 48 13 C 48 0 34 0 24 9 Z";
        shapeObj = new fabric.Path(heartPath, { ...baseConfig, scaleX: 1.8, scaleY: 1.8 });
        break;
      case "diamond":
        shapeObj = new fabric.Polygon([
          { x: 40, y: 0 }, { x: 80, y: 40 }, { x: 40, y: 80 }, { x: 0, y: 40 }
        ], baseConfig);
        break;
      case "cross":
        shapeObj = new fabric.Polygon([
          { x: 25, y: 0 }, { x: 55, y: 0 }, { x: 55, y: 25 }, { x: 80, y: 25 },
          { x: 80, y: 55 }, { x: 55, y: 55 }, { x: 55, y: 80 }, { x: 25, y: 80 },
          { x: 25, y: 55 }, { x: 0, y: 55 }, { x: 0, y: 25 }, { x: 25, y: 25 }
        ], baseConfig);
        break;
      
      // 📐 RADIAL GEOMETRY ENGINE: Automatically generates any n-sided custom shape
      case "custom_polygon":
        const points = [];
        const radius = 40; 
        const centerX = 40;
        const centerY = 40;
        
        for (let i = 0; i < customSides; i++) {
          const angle = (i * 2 * Math.PI) / customSides - Math.PI / 2;
          points.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          });
        }
        shapeObj = new fabric.Polygon(points, baseConfig);
        break;
        
      default:
        return;
    }

    activeCanvas.add(shapeObj);
    activeCanvas.setActiveObject(shapeObj);
    activeCanvas.renderAll();
    
    setSelectedShape(shapeObj); 
    setTempShapeColor("#3b82f6");
    setTempBorderColor("#000000");
    setTempBorderWidth(0);

    if (manualSync) manualSync();
  };

  // ⚡ INSTANT 2D WORKSPACE PREVIEW MODIFIERS
  const handleLiveColorChange = (value) => {
    if (!selectedShape || !activeCanvas) return;
    setTempShapeColor(value);
    if (selectedShape.type === "line" || selectedShape.isType?.("Line")) {
      selectedShape.set("stroke", value);
    } else {
      selectedShape.set("fill", value);
    }
    activeCanvas.requestRenderAll(); 
  };

  const handleLiveBorderWidthChange = (value) => {
    if (!selectedShape || !activeCanvas) return;
    setTempBorderWidth(value);
    selectedShape.set("strokeWidth", value);
    activeCanvas.requestRenderAll();
  };

  const handleLiveBorderColorChange = (value) => {
    if (!selectedShape || !activeCanvas) return;
    setTempBorderColor(value);
    selectedShape.set("stroke", value);
    activeCanvas.requestRenderAll();
  };

  // 👕 3D T-SHIRT MODEL SYNC DETECTOR
  const handleApplyChanges = () => {
    if (!selectedShape || !activeCanvas) return;
    if (manualSync) manualSync();
  };

  const shapeBtnClass = "p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-violet-50/30 hover:border-violet-100 text-gray-600 hover:text-violet-600 transition-all active:scale-95 text-xs font-medium cursor-pointer";

  return (
    <div className="space-y-5 h-full overflow-y-auto pr-1 max-h-[75vh]">
      
      {/* SHAPES SELECTION GRID */}
      <div className="space-y-2">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Geometric Presets</p>
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => addShape("rect")} className={shapeBtnClass}>
            <Square className="h-5 w-5 stroke-[1.5]" />
            <span>Rectangle</span>
          </button>
          <button onClick={() => addShape("circle")} className={shapeBtnClass}>
            <Circle className="h-5 w-5 stroke-[1.5]" />
            <span>Circle</span>
          </button>
          <button onClick={() => addShape("triangle")} className={shapeBtnClass}>
            <Triangle className="h-5 w-5 stroke-[1.5]" />
            <span>Triangle</span>
          </button>
          <button onClick={() => addShape("line")} className={shapeBtnClass}>
            <Minus className="h-5 w-5 stroke-[1.5]" />
            <span>Line</span>
          </button>
          <button onClick={() => addShape("pentagon")} className={shapeBtnClass}>
            <Pentagon className="h-5 w-5 stroke-[1.5]" />
            <span>Pentagon</span>
          </button>
          <button onClick={() => addShape("hexagon")} className={shapeBtnClass}>
            <Hexagon className="h-5 w-5 stroke-[1.5]" />
            <span>Hexagon</span>
          </button>
          <button onClick={() => addShape("star")} className={shapeBtnClass}>
            <Star className="h-5 w-5 stroke-[1.5]" />
            <span>Star</span>
          </button>
          <button onClick={() => addShape("heart")} className={shapeBtnClass}>
            <Heart className="h-5 w-5 stroke-[1.5]" />
            <span>Heart</span>
          </button>
          <button onClick={() => addShape("diamond")} className={shapeBtnClass}>
            <Maximize2 className="h-5 w-5 rotate-45 stroke-[1.5]" />
            <span>Diamond</span>
          </button>
          <button onClick={() => addShape("cross")} className={shapeBtnClass}>
            <Activity className="h-5 w-5 stroke-[1.5]" />
            <span>Badge Cross</span>
          </button>
        </div>
      </div>

      {/* 🚀 NEW SECTION: INTERACTIVE CUSTOM SHAPE GENERATOR */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Custom Shape Generator</p>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-600">Number of Sides ({customSides})</label>
            <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-1.5 py-0.5 rounded-md">
              {customSides === 8 ? "Octagon" : customSides === 10 ? "Decagon" : customSides === 12 ? "Dodecagon" : "Polygon"}
            </span>
          </div>
          
          <input 
            type="range" 
            min="5" 
            max="20" 
            step="1"
            value={customSides}
            onChange={(e) => setCustomSides(parseInt(e.target.value))}
            className="w-full accent-violet-600 cursor-pointer"
          />

          <button
            type="button"
            onClick={() => addShape("custom_polygon")}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5" /> Generate Shape
          </button>
        </div>
      </div>

      {/* SHAPE CUSTOMIZER PANEL */}
      {selectedShape ? (
        <div className="pt-4 border-t border-gray-200/80 space-y-4">
          <p className="text-[11px] text-violet-600 font-bold uppercase tracking-wider">Shape Customizer</p>

          {/* Color Fill Controls */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              {selectedShape.type === "line" ? "Line Color" : "Fill Color"}
            </label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1.5 bg-white">
              <input 
                type="color" 
                value={tempShapeColor} 
                onInput={(e) => handleLiveColorChange(e.target.value)}
                onChange={(e) => handleLiveColorChange(e.target.value)}
                className="w-7 h-7 rounded-md cursor-pointer border-0 bg-transparent" 
              />
              <span className="text-[11px] font-mono uppercase tracking-tight">{tempShapeColor}</span>
            </div>
          </div>

          {/* Border Customizations */}
          {selectedShape.type !== "line" && (
            <>
              {/* Border Thickness Slider */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <label className="text-xs font-medium text-gray-600">Border Thickness ({tempBorderWidth}px)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="1"
                  value={tempBorderWidth} 
                  onInput={(e) => handleLiveBorderWidthChange(parseInt(e.target.value))}
                  onChange={(e) => handleLiveBorderWidthChange(parseInt(e.target.value))} 
                  className="w-full h-8 accent-violet-600 cursor-pointer" 
                />
              </div>

              {/* Border Color Picker Panel */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-gray-600">Border Color</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1.5 bg-white">
                  <input 
                    type="color" 
                    value={tempBorderColor} 
                    onInput={(e) => handleLiveBorderColorChange(e.target.value)}
                    onChange={(e) => handleLiveBorderColorChange(e.target.value)}
                    className="w-7 h-7 rounded-md cursor-pointer border-0 bg-transparent" 
                  />
                  <span className="text-[11px] font-mono uppercase tracking-tight">{tempBorderColor}</span>
                </div>
              </div>
            </>
          )}

          {/* 👕 THE "APPLY TO 3D MODEL" BUTTON */}
          <button
            type="button"
            onClick={handleApplyChanges}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Check className="h-4 w-4" /> Apply to T-Shirt Model
          </button>
        </div>
      ) : (
        <div className="pt-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 italic">Select a canvas shape to modify its colors and boundaries</p>
        </div>
      )}
    </div>
  );
}