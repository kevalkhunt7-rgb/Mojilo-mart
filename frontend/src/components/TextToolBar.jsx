import { useEffect, useState } from "react";
import { FONT_OPTIONS } from "../constants/designConstants";

// 🟢 FIXED: Point the import to your central context file instead of the old hook folder
import { useCanvas } from "../context/CanvasContext";

const TextToolBar = ({ manualSync }) => {
  // Now successfully resolves values from your CanvasProvider context tree!
  const { activeCanvas, selectedObject } = useCanvas();

  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");
  const [font, setFont] = useState("arial");
  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    if (selectedObject && (selectedObject.type === "textbox" || selectedObject.type === "text" || selectedObject.type === "i-text")) {
      setText(selectedObject.text || "");
      setColor(selectedObject.fill || "#000000");
      setFont(selectedObject.fontFamily || "arial");
      setFontSize(selectedObject.fontSize || 20);
    }
  }, [selectedObject]);

  // Only show for text objects
  if (!selectedObject || (selectedObject.type !== "textbox" && selectedObject.type !== "text" && selectedObject.type !== "i-text")) {
    return null;
  }

  const handleColorChange = (e) => {
    if (!selectedObject || !activeCanvas) return;
    const newColor = e.target.value;
    setColor(newColor);
    selectedObject.set("fill", newColor);
    activeCanvas.renderAll();
    manualSync();
  };

  const handleTextChange = (e) => {
    if (!selectedObject || !activeCanvas) return;
    const newText = e.target.value;
    setText(newText);
    selectedObject.set("text", newText);
    activeCanvas.renderAll();
    manualSync();
  };

  const handleFontChange = (e) => {
    if (!selectedObject || !activeCanvas) return;
    const newFont = e.target.value;
    setFont(newFont);
    selectedObject.set("fontFamily", newFont);
    activeCanvas.renderAll();
    manualSync();
  };

  const handleFontSizeChange = (e) => {
    if (!selectedObject || !activeCanvas) return;
    const newSize = parseInt(e.target.value, 10);
    if (isNaN(newSize) || newSize < 1) return; // Prevent invalid input
    setFontSize(newSize);
    selectedObject.set("fontSize", newSize);
    activeCanvas.renderAll();
    manualSync();
  };

  return (
    <div className="flex flex-col gap-3 mt-4 text-sm text-gray-700">
      <h3 className="text-lg font-bold text-gray-900">Edit Text</h3>
      
      {/* Custom Separator */}
      <div className="h-[1px] w-full bg-gray-200" />
      
      <label className="font-medium text-gray-900">Your Text</label>
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        className="w-[110px] h-9 px-3 rounded-md border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      
      <label className="font-medium text-gray-900">Font Type</label>
      <div className="relative w-[110px]">
        <select
          value={font}
          onChange={handleFontChange}
          className="w-full h-9 pl-3 pr-8 rounded-md border border-gray-200 bg-white shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom Chevron Arrow for Select Element */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <div className="flex gap-2 items-center">
        <label className="w-16 font-medium text-gray-900">Font Size</label>
        <input
          type="number"
          value={fontSize}
          min="1"
          onChange={handleFontSizeChange}
          className="w-[62px] h-9 px-2 rounded-md border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex gap-2 items-center">
        <label className="w-16 font-medium text-gray-900">Font Color</label>
        <div className="w-[62px] h-9 relative overflow-hidden rounded-md border border-gray-200 shadow-sm cursor-pointer">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="absolute -inset-2 w-[150%] h-[150%] p-0 m-0 border-0 cursor-pointer bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default TextToolBar;