import React, { useState, useEffect } from "react";
import * as fabric from "fabric";
import { useCanvas } from "../context/CanvasContext";
import api from "../lib/axios";
import { Loader2, Search, Sparkles, Layers, Image as ImageIcon } from "lucide-react";
import { loadCorsSafeImage } from "../utils/imageUtils";

const STICKER_TEMPLATES = [
  { id: "star", name: "Retro Star", url: "https://img.icons8.com/fluency/96/star--v1.png" },
  { id: "heart", name: "Love Badge", url: "https://img.icons8.com/fluency/96/hearts.png" },
  { id: "smile", name: "Happy Face", url: "https://img.icons8.com/fluency/96/smiling-mouth.png" },
  { id: "lightning", name: "Energy Bolt", url: "https://img.icons8.com/fluency/96/flash-on.png" },
  { id: "rocket", name: "Space Bound", url: "https://img.icons8.com/fluency/96/rocket.png" },
  { id: "fire", name: "Flame", url: "https://img.icons8.com/fluency/96/fire-element.png" },
  { id: "cool_face", name: "Sunglasses Face", url: "https://img.icons8.com/fluency/96/cool.png" },
  { id: "skull", name: "Retro Skull", url: "https://img.icons8.com/fluency/96/skull.png" },
  { id: "crown", name: "King Crown", url: "https://img.icons8.com/fluency/96/crown.png" },
  { id: "pizza", name: "Pizza Slice", url: "https://img.icons8.com/fluency/96/pizza.png" },
  { id: "donut", name: "Glazed Donut", url: "https://img.icons8.com/fluency/96/doughnut.png" },
  { id: "burger", name: "Fast Burger", url: "https://img.icons8.com/fluency/96/hamburger.png" }
];

export default function StickersPanel({ manualSync }) {
  const { activeCanvas } = useCanvas();
  const [cliparts, setCliparts] = useState([]);
  const [customDesigns, setCustomDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'custom', 'clipart'
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const [designsRes, clipartsRes] = await Promise.allSettled([
          api.get('/designs/public'),
          api.get('/cliparts')
        ]);

        // Process Custom Studio Designs
        let loadedDesigns = [];
        if (designsRes.status === 'fulfilled' && designsRes.value?.data) {
          const resData = designsRes.value.data;
          loadedDesigns = resData.data || (Array.isArray(resData) ? resData : []);
        }
        
        // If public returns empty, attempt /designs endpoint fallback
        if (!loadedDesigns || loadedDesigns.length === 0) {
          try {
            const fallbackRes = await api.get('/designs');
            loadedDesigns = fallbackRes.data?.data || (Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
          } catch (e) {
            // Keep empty array
          }
        }
        setCustomDesigns(loadedDesigns);

        // Process Cliparts
        if (clipartsRes.status === 'fulfilled' && clipartsRes.value?.data) {
          const resData = clipartsRes.value.data;
          if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            setCliparts(resData.data);
          } else if (Array.isArray(resData)) {
            setCliparts(resData);
          } else {
            setCliparts(STICKER_TEMPLATES);
          }
        } else {
          setCliparts(STICKER_TEMPLATES);
        }
      } catch (err) {
        console.error("Failed to load graphics assets:", err);
        setCliparts(STICKER_TEMPLATES);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const getProxyUrl = (imgUrl) => {
    if (!imgUrl || typeof imgUrl !== 'string') return '';
    if (imgUrl.startsWith('data:') || imgUrl.includes('/uploads/proxy')) {
      return imgUrl;
    }
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (imgUrl.startsWith('/')) {
      return `${backendUrl}${imgUrl}`;
    }
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + '/api';
      return `${apiBase}/uploads/proxy?url=${encodeURIComponent(imgUrl)}`;
    }
    return imgUrl;
  };

  const handleAddSticker = async (rawImgUrl) => {
    if (!activeCanvas || !rawImgUrl) return;

    try {
      const imgElement = await loadCorsSafeImage(rawImgUrl);
      const fabricImg = new fabric.Image(imgElement, {
        left: activeCanvas.width / 2,
        top: activeCanvas.height / 2,
        originX: "center",
        originY: "center",
        originalSrc: rawImgUrl,
      });

      fabricImg.scaleToWidth(120);

      activeCanvas.add(fabricImg);
      activeCanvas.setActiveObject(fabricImg);
      activeCanvas.renderAll();
      activeCanvas.fire("object:modified");

      if (manualSync) manualSync();
    } catch (err) {
      console.error("Failed to add sticker to canvas:", err);
    }
  };

  const filteredDesigns = customDesigns.filter((d) =>
    (d.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCliparts = cliparts.filter((c) =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#936A3B]" />
        <span className="text-[10px] text-slate-400">Loading custom designs & graphics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 font-sans">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
        <input
          type="text"
          placeholder="Search designs & stickers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#936A3B] focus:bg-white transition-all"
        />
      </div>

      {/* Tab Filter Pills */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-1 px-2 rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
        >
          All ({customDesigns.length + cliparts.length})
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'custom' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Sparkles size={10} /> Studio ({customDesigns.length})
        </button>
        <button
          onClick={() => setActiveTab("clipart")}
          className={`flex-1 py-1 px-2 rounded-lg transition-all ${activeTab === 'clipart' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Cliparts ({cliparts.length})
        </button>
      </div>

      {/* SECTION 1: CUSTOM STUDIO DESIGNS */}
      {(activeTab === 'all' || activeTab === 'custom') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold text-indigo-650 flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-500" /> Custom Studio Designs
            </span>
            <span className="text-[9px] text-slate-400 font-medium">{filteredDesigns.length} items</span>
          </div>

          {filteredDesigns.length === 0 ? (
            <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400 font-medium">
              No custom studio designs found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {filteredDesigns.map((design) => {
                const designUrl = design.previewImage?.url || design.previewUrl || design.imageUrl || design.url;
                return (
                  <button
                    key={design._id || design.id}
                    onClick={() => handleAddSticker(designUrl)}
                    className="p-2.5 bg-indigo-50/40 border border-indigo-100 hover:border-indigo-300 rounded-xl flex flex-col items-center justify-center gap-1.5 group transition-all duration-200 active:scale-95 text-center relative overflow-hidden cursor-pointer"
                  >
                    <span className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                      Design
                    </span>
                    <div className="w-14 h-14 aspect-square flex items-center justify-center p-1">
                      {designUrl ? (
                        <img
                          src={designUrl}
                          alt={design.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                        />
                      ) : (
                        <ImageIcon className="text-indigo-300" size={24} />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 group-hover:text-indigo-600 truncate max-w-full px-1">
                      {design.name || 'Custom Design'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: POPULAR GRAPHICS / CLIPARTS */}
      {(activeTab === 'all' || activeTab === 'clipart') && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold text-gray-700">Popular Graphics & Cliparts</span>
            <span className="text-[9px] text-slate-400 font-medium">{filteredCliparts.length} items</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {filteredCliparts.map((sticker) => {
              const stickerUrl = sticker.imageUrl || sticker.url;
              return (
                <button
                  key={sticker._id || sticker.id}
                  onClick={() => handleAddSticker(stickerUrl)}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-amber-50/40 hover:border-amber-200 group transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <img
                    src={stickerUrl}
                    alt={sticker.name}
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="text-[10px] font-medium text-gray-600 group-hover:text-[#936A3B] truncate max-w-full px-1">
                    {sticker.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}