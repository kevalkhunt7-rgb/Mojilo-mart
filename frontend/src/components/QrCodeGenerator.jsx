import React, { useState } from "react";
import * as fabric from "fabric";
import { useCanvas } from "../context/CanvasContext";
import { QrCode, Plus } from "lucide-react";
import { canvasSyncManager } from "../utils/canvasSyncManager";

export default function QrCodeGenerator() {
  const { activeCanvas } = useCanvas();
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Use qrserver api to generate a neat QR code graphic
    const encoded = encodeURIComponent(text.trim());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
    setQrUrl(url);
  };

  const handleAddQrToCanvas = () => {
    if (!activeCanvas || !qrUrl) return;

    const imgElement = new Image();
    imgElement.crossOrigin = "anonymous";
    imgElement.src = qrUrl;

    imgElement.onload = () => {
      const fabricImg = new fabric.Image(imgElement, {
        left: activeCanvas.width / 2,
        top: activeCanvas.height / 2,
        originX: "center",
        originY: "center",
        crossOrigin: "anonymous",
      });

      fabricImg.set({ crossOrigin: "anonymous" });
      fabricImg.scaleToWidth(120);

      activeCanvas.add(fabricImg);
      activeCanvas.setActiveObject(fabricImg);
      activeCanvas.renderAll();
      activeCanvas.fire("object:modified");

      canvasSyncManager.getCanvasTexture(activeCanvas);
    };
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QR Code Tool</p>
        <p className="text-[11px] text-slate-500 leading-normal">
          Generate a custom QR code (e.g., linking to your website, social media, or a secret text) and place it on your apparel.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 focus:border-violet-400 rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-full h-9 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:cursor-not-allowed cursor-pointer"
        >
          <QrCode className="h-3.5 w-3.5" /> Generate QR Code
        </button>
      </form>

      {qrUrl && (
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-3 animate-in fade-in duration-200">
          <div className="w-28 h-28 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-inner">
            <img src={qrUrl} alt="Generated QR Code" className="w-full h-full object-contain" />
          </div>
          <button
            onClick={handleAddQrToCanvas}
            className="w-full h-8 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add QR to Design
          </button>
        </div>
      )}
    </div>
  );
}
