import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCanvas } from "../context/CanvasContext";
import { Wand2, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { canvasSyncManager } from "../utils/canvasSyncManager";

export default function BackgroundRemovalPanel() {
  const {
    frontCanvas,
    backCanvas,
    leftCanvas,
    rightCanvas,
    pocketCanvas,
    hoodCanvas,
    activeCanvas,
    selectedObject,
  } = useCanvas();

  const [loading, setLoading] = useState(false);
  const [selectedSrc, setSelectedSrc] = useState(null);

  useEffect(() => {
    if (selectedObject && selectedObject.type === "image") {
      const el = selectedObject.getElement();
      const src = selectedObject.originalSrc || (el ? el.src || el.currentSrc : null);
      setSelectedSrc(src);
    } else {
      setSelectedSrc(null);
    }
  }, [selectedObject]);

  const getProxyUrl = (imgUrl) => {
    if (!imgUrl) return "";
    if (imgUrl.startsWith("data:") || imgUrl.startsWith("blob:")) return imgUrl;
    if (imgUrl.includes("/uploads/proxy")) return imgUrl;
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (imgUrl.startsWith("/")) {
      return `${backendUrl}${imgUrl}`;
    }
    const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "") + "/api";
    return `${apiBase}/uploads/proxy?url=${encodeURIComponent(imgUrl)}`;
  };

  const replaceCanvasImageSource = (oldSrc, newSrc) => {
    const canvases = [frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas];
    canvases.forEach((cv) => {
      if (!cv) return;
      cv.getObjects().forEach((obj) => {
        if (obj.type === 'image') {
          const element = obj.getElement();
          const match = obj.originalSrc === oldSrc ||
            (element && (element.src === oldSrc || element.currentSrc === oldSrc)) ||
            (obj._originalElement && obj._originalElement.src === oldSrc);
          if (match) {
            const newImg = new Image();
            newImg.crossOrigin = "anonymous";
            newImg.src = newSrc;
            newImg.onload = () => {
              obj.setElement(newImg);
              obj.set({ crossOrigin: "anonymous" });
              obj.originalSrc = newSrc;
              cv.renderAll();
              cv.fire("object:modified");
              canvasSyncManager.getCanvasTexture(cv);
            };
          }
        }
      });
    });
  };

  const handleRemoveBackground = async () => {
    if (!selectedSrc) return;
    setLoading(true);
    try {
      // Use proxy URL for client-side download to avoid CORS fetch issues
      const proxiedSrc = getProxyUrl(selectedSrc);
      const processedBlob = await removeBackground(proxiedSrc);
      const transparentUrl = URL.createObjectURL(processedBlob);

      // Update canvas objects
      replaceCanvasImageSource(selectedSrc, transparentUrl);
      setSelectedSrc(transparentUrl);
    } catch (err) {
      console.error("Background removal failed:", err);
      toast.error("Failed to remove background. Please make sure the image has a clear foreground subject.");
    } finally {
      setLoading(false);
    }
  };

  const isImageSelected = selectedObject && selectedObject.type === "image" && selectedSrc;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          AI Background Remover
        </p>
        <p className="text-[11px] text-slate-500 leading-normal">
          Remove backgrounds from custom uploads, cliparts, or stickers instantly using client-side AI.
        </p>
      </div>

      {isImageSelected ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">

          <button
            disabled={loading}
            onClick={handleRemoveBackground}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {loading ? "Processing..." : "Remove Background"}
          </button>
        </div>
      ) : (
        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-[11px] text-slate-500 font-medium leading-normal">
            No image selected. Please click on a sticker, clipart, or custom image upload on the canvas workspace first.
          </p>
        </div>
      )}
    </div>
  );
}
