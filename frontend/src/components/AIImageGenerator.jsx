import React, { useState } from "react";
import * as fabric from "fabric";
import { useCanvas } from "../context/CanvasContext";
import { Sparkles, Loader2, Plus, ArrowRight } from "lucide-react";
import { loadCorsSafeImage } from "../utils/imageUtils";

const MOCK_AI_GRAPHICS = {
  space: { name: "Nebula Astronaut", url: "https://img.icons8.com/fluency/144/rocket.png" },
  skull: { name: "Cyberpunk Skull", url: "https://img.icons8.com/fluency/144/skull.png" },
  cute: { name: "Cute Panda Bear", url: "https://img.icons8.com/fluency/144/panda.png" },
  fire: { name: "Flame Spark", url: "https://img.icons8.com/fluency/144/fire-element.png" },
  rainbow: { name: "Prism Rainbow", url: "https://img.icons8.com/fluency/144/rainbow.png" },
  default: { name: "Energy Flash Bolt", url: "https://img.icons8.com/fluency/144/flash-on.png" }
};

export default function AIImageGenerator() {
  const { activeCanvas } = useCanvas();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setResult(null);

    // Simulate AI generation lag
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      let matched = MOCK_AI_GRAPHICS.default;

      if (lowerPrompt.includes("space") || lowerPrompt.includes("astronaut") || lowerPrompt.includes("rocket")) {
        matched = MOCK_AI_GRAPHICS.space;
      } else if (lowerPrompt.includes("skull") || lowerPrompt.includes("punk") || lowerPrompt.includes("bone")) {
        matched = MOCK_AI_GRAPHICS.skull;
      } else if (lowerPrompt.includes("cute") || lowerPrompt.includes("panda") || lowerPrompt.includes("animal")) {
        matched = MOCK_AI_GRAPHICS.cute;
      } else if (lowerPrompt.includes("fire") || lowerPrompt.includes("flame") || lowerPrompt.includes("burn")) {
        matched = MOCK_AI_GRAPHICS.fire;
      } else if (lowerPrompt.includes("rainbow") || lowerPrompt.includes("prism") || lowerPrompt.includes("color")) {
        matched = MOCK_AI_GRAPHICS.rainbow;
      }

      setResult(matched);
      setGenerating(false);
    }, 2000);
  };

  const handleAddImage = async () => {
    if (!activeCanvas || !result) return;

    try {
      const imgElement = await loadCorsSafeImage(result.url);
      const fabricImg = new fabric.Image(imgElement, {
        left: activeCanvas.width / 2,
        top: activeCanvas.height / 2,
        originX: "center",
        originY: "center",
      });

      fabricImg.scaleToWidth(140);
      
      // 🏷️ Tag this object so that our custom Pricing Calculator identifies it as an AI-generated layer
      fabricImg.isAIImage = true;

      activeCanvas.add(fabricImg);
      activeCanvas.setActiveObject(fabricImg);
      activeCanvas.renderAll();
      activeCanvas.fire("object:modified");
    } catch (err) {
      console.error("Failed to add AI image to canvas:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Graphic Engine</p>
        <p className="text-[11px] text-slate-500 leading-normal">
          Describe the graphic you want to generate. Try "astronaut in space" or "neon cyberpunk skull".
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your design artwork ideas..."
          disabled={generating}
          className="w-full min-h-[70px] p-2.5 bg-slate-50 border border-slate-200 focus:border-violet-400 rounded-xl text-xs font-semibold text-slate-700 outline-none resize-none transition-colors"
        />
        <button
          type="submit"
          disabled={generating || !prompt.trim()}
          className="w-full h-9 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:cursor-not-allowed cursor-pointer"
        >
          {generating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rendering Art...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Generate Graphic
            </>
          )}
        </button>
      </form>

      {/* Generated Result display panel */}
      {result && (
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-3 animate-in fade-in duration-200">
          <div className="w-24 h-24 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-inner">
            <img src={result.url} alt={result.name} className="max-w-full max-h-full object-contain" />
          </div>
          <div className="text-center">
            <h5 className="text-xs font-bold text-slate-800">{result.name}</h5>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">AI Output ready</p>
          </div>
          <button
            onClick={handleAddImage}
            className="w-full h-8 bg-slate-900 hover:bg-violet-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Place on Canvas
          </button>
        </div>
      )}
      
    </div>
  );
}
