import React, { useRef, useState } from "react";
import * as fabric from "fabric";
import { useCanvas } from "../context/CanvasContext";
import { Sparkles, Loader2, Plus, AlertTriangle, RefreshCw } from "lucide-react";
import { loadCorsSafeImage } from "../utils/imageUtils";

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// Fixed API_BASE: fallback uses explicit IPv4 127.0.0.1 to prevent IPv6 localhost refusal
const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api").replace(/\/api$/, "");

export default function AIImageGenerator() {
  const { activeCanvas } = useCanvas();

  const promptRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState(null);

  const handleGenerate = async () => {
    const userPrompt = promptRef.current?.value?.trim() || prompt.trim();
    if (!userPrompt) return;

    setStatus(STATUS.LOADING);
    setGeneratedUrl(null);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE}/api/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("mojilo_accessToken") && {
            Authorization: `Bearer ${localStorage.getItem("mojilo_accessToken")}`,
          }),
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!response.ok) {
        let serverError = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          serverError = errData?.message || errData?.error || serverError;
        } catch (_) {}
        throw new Error(serverError);
      }

      const data = await response.json();

      // Extracts imageUrl from standard or wrapped ApiResponse ({ data: { imageUrl } })
      const finalUrl = data?.imageUrl || data?.data?.imageUrl;

      if (!finalUrl) {
        throw new Error("Backend did not return a valid imageUrl.");
      }

      setGeneratedUrl(finalUrl);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      console.error("[AIImageGenerator] Generation failed:", err);
      setErrorMsg(err.message || "Generation failed. Please try again.");
      setStatus(STATUS.ERROR);
    }
  };

  const handleAddToCanvas = async () => {
    if (!activeCanvas || !generatedUrl) return;

    try {
      const imgElement = await loadCorsSafeImage(generatedUrl);
      const fabricImg = new fabric.Image(imgElement, {
        left: activeCanvas.width / 2,
        top: activeCanvas.height / 2,
        originX: "center",
        originY: "center",
      });

      fabricImg.scaleToWidth(140);
      fabricImg.isAIImage = true;

      activeCanvas.add(fabricImg);
      activeCanvas.setActiveObject(fabricImg);
      activeCanvas.renderAll();
      activeCanvas.fire("object:modified");
    } catch (err) {
      console.error("[AIImageGenerator] Failed to place image on canvas:", err);
    }
  };

  const isLoading = status === STATUS.LOADING;
  const isSuccess = status === STATUS.SUCCESS;
  const isError   = status === STATUS.ERROR;
  const canSubmit = prompt.trim().length > 0 && !isLoading;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Graphic Engine</p>
        <p className="text-[11px] text-slate-500 leading-normal">
          Describe the graphic you want to generate. Try &quot;astronaut in space&quot; or &quot;neon cyberpunk skull&quot;.
        </p>
      </div>

      <div className="space-y-2">
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your design artwork ideas..."
          disabled={isLoading}
          rows={3}
          className={`w-full min-h-[70px] p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-700 outline-none resize-none transition-colors
            ${isLoading
              ? "border-slate-200 opacity-60 cursor-not-allowed"
              : "border-slate-200 focus:border-violet-400"
            }`}
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canSubmit}
          className="w-full h-9 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating...
            </>
          ) : isError ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Generate Graphic
            </>
          )}
        </button>
      </div>

      {isError && (
        <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl animate-in fade-in duration-200">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-[11px] font-semibold text-red-600 leading-normal">{errorMsg}</p>
        </div>
      )}

      {isSuccess && generatedUrl && (
        <div className="p-3 bg-slate-50 border border-violet-100 rounded-xl flex flex-col items-center gap-3 animate-in fade-in duration-200">
          <div className="relative w-full aspect-square max-h-48 bg-[#1e1e2e] border border-slate-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            <img
              src={generatedUrl}
              alt="AI Generated Graphic"
              className="max-w-full max-h-full object-contain"
            />
            <span className="absolute top-2 right-2 bg-violet-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              AI
            </span>
          </div>

          <div className="w-full text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI Output ready</p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate px-2">{prompt}</p>
          </div>

          <button
            type="button"
            onClick={handleAddToCanvas}
            className="w-full h-8 bg-slate-900 hover:bg-violet-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Place on Canvas
          </button>

          <button
            type="button"
            onClick={() => { setStatus(STATUS.IDLE); setGeneratedUrl(null); }}
            className="w-full h-7 text-slate-400 hover:text-violet-600 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Generate another
          </button>
        </div>
      )}
    </div>
  );
}