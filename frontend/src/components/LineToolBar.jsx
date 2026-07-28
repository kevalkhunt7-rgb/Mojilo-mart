import { useEffect, useState } from "react";
// 🟢 FIXED: Updated import path to read safely from the active provider context
import { useCanvas } from "../context/CanvasContext";

const LineToolBar = ({ manualSync }) => {
  const { selectedObject, activeCanvas } = useCanvas();
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);

  useEffect(() => {
    if (selectedObject && selectedObject.type === "line") {
      // In Fabric.js, lines primarily rely on stroke, but matching your state sync here
      setColor(selectedObject.stroke || selectedObject.fill || "#000000");
      setStrokeWidth(selectedObject.strokeWidth || 3);
    }
  }, [selectedObject]);

  // Only show for line objects
  if (!selectedObject || selectedObject.type !== "line") {
    return null;
  }

  const handleColorChange = (e) => {
    if (!selectedObject || !activeCanvas) return;
    const newColor = e.target.value;
    setColor(newColor);
    selectedObject.set("stroke", newColor);
    activeCanvas.renderAll();
    manualSync();
  };

  const handleStrokeWidthChange = (e) => {
    if (!selectedObject || !activeCanvas) return;
    const newSize = parseInt(e.target.value, 10);
    if (isNaN(newSize) || newSize < 1) return; // Prevent invalid input
    setStrokeWidth(newSize);
    selectedObject.set("strokeWidth", newSize);
    activeCanvas.renderAll();
    manualSync();
  };

  return (
    <div className="flex flex-col gap-3 mt-4 text-sm text-gray-700">
      <h3 className="text-lg font-bold text-gray-900">Edit Line</h3>
      
      {/* Custom Separator */}
      <div className="h-[1px] w-full bg-gray-200" />
      
      <label className="font-medium text-gray-900">Line Color</label>
      {/* Polished Color Picker container to keep it uniform */}
      <div className="w-[62px] h-9 relative overflow-hidden rounded-md border border-gray-200 shadow-sm cursor-pointer">
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className="absolute -inset-2 w-[150%] h-[150%] p-0 m-0 border-0 cursor-pointer bg-transparent"
        />
      </div>
      
      <label className="font-medium text-gray-900">Line Weight</label>
      <input
        type="number"
        value={strokeWidth}
        min="1"
        onChange={handleStrokeWidthChange}
        className="w-[80px] h-9 px-3 rounded-md border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default LineToolBar;