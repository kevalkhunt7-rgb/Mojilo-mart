import React, { useRef, useState, useEffect } from "react";
import toast from 'react-hot-toast';
import * as fabric from "fabric";
import { useCanvas } from "../context/CanvasContext";
import { Upload, ImagePlus, Trash2, Loader2, Sparkles, Wand2 } from "lucide-react";
import api from "../lib/axios";
import { removeBackground } from "@imgly/background-removal";

export default function ImageUploadPanel() {
  const {
    frontCanvas,
    backCanvas,
    leftCanvas,
    rightCanvas,
    pocketCanvas,
    hoodCanvas,
    activeCanvas
  } = useCanvas();
  const fileInputRef = useRef(null);
  const [uploads, setUploads] = useState([]); // { id, thumbnail, name }
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [bgRemovalLoadingId, setBgRemovalLoadingId] = useState(null);

  const token = localStorage.getItem("mojilo_accessToken");
  const isAuthenticated = !!token;

  // Load user uploads if logged in
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserUploads = async () => {
      setFetching(true);
      try {
        const response = await api.get("/uploads/my-uploads");
        if (response.data && response.data.success) {
          const formatted = response.data.data.map((item) => ({
            id: item._id || item.id,
            thumbnail: item.imageUrl,
            name: item.imageUrl.split("/").pop() || "Uploaded Clipart",
            isPersisted: true
          }));
          setUploads(formatted);
        }
      } catch (err) {
        console.error("Failed to load your uploads:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchUserUploads();
  }, [isAuthenticated]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const file = files[0]; // Process one file at a time for database persistency
    if (!file.type.startsWith("image/")) return;

    setLoading(true);

    try {
      if (isAuthenticated) {
        // Upload to database
        const formData = new FormData();
        formData.append("image", file);

        const response = await api.post("/uploads/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        if (response.data && response.data.success) {
          const newItem = response.data.data;
          setUploads((prev) => [
            {
              id: newItem.id || newItem._id,
              thumbnail: newItem.url,
              name: file.name,
              isPersisted: true
            },
            ...prev
          ]);
        }
      } else {
        // Fall back to local FileReader storage for guests
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          setUploads((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), thumbnail: dataUrl, name: file.name, isPersisted: false },
          ]);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("File upload failed:", err);
      toast.error(err.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleAddToCanvas = (dataUrl) => {
    if (!activeCanvas) return;

    const imgEl = new Image();
    imgEl.crossOrigin = "anonymous";
    imgEl.src = dataUrl;

    imgEl.onload = () => {
      const fabricImg = new fabric.Image(imgEl, {
        left: activeCanvas.width / 2,
        top: activeCanvas.height / 2,
        originX: "center",
        originY: "center",
        originalSrc: dataUrl,
      });

      fabricImg.scaleToWidth(Math.min(180, activeCanvas.width * 0.4));

      activeCanvas.add(fabricImg);
      activeCanvas.setActiveObject(fabricImg);
      activeCanvas.renderAll();
      activeCanvas.fire("object:modified");
    };
  };

  const handleRemoveUpload = async (id, isPersisted) => {
    if (isPersisted && isAuthenticated) {
      try {
        await api.delete(`/uploads/${id}`);
      } catch (err) {
        console.error("Failed to delete persisted upload:", err);
      }
    }
    setUploads((prev) => prev.filter((u) => u.id !== id));
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
              obj.originalSrc = newSrc;
              cv.renderAll();
              cv.fire("object:modified");
            };
          }
        }
      });
    });
  };

  const handleRemoveBackground = async (item) => {
    setBgRemovalLoadingId(item.id);
    const originalSrc = item.thumbnail;
    try {
      const processedBlob = await removeBackground(originalSrc);
      const transparentUrl = URL.createObjectURL(processedBlob);

      setUploads((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, thumbnail: transparentUrl } : u))
      );

      replaceCanvasImageSource(originalSrc, transparentUrl);
    } catch (err) {
      console.error("Background removal failed:", err);
      toast.error("Failed to remove background. Make sure the image has a clear foreground subject.");
    } finally {
      setBgRemovalLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Image Upload
        </p>
        <p className="text-[11px] text-slate-500 leading-normal">
          Upload images from your device and place them onto your design canvas.
          Supports PNG, JPG, SVG, and WEBP.
        </p>
      </div>

      {/* Guest warning banner */}
      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-amber-700 leading-normal font-medium">
            You are designing as a guest. <strong>Sign in</strong> to save your uploads permanently!
          </p>
        </div>
      )}

      {/* Upload button */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-[#936A3B] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#936A3B] transition-colors cursor-pointer bg-slate-50/50 hover:bg-[#936A3B]/5 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#936A3B]" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {loading ? "Uploading image..." : "Click to Upload Images"}
      </button>

      {/* Uploaded gallery */}
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#936A3B]" />
          <span className="text-[10px] text-slate-400">Loading uploads...</span>
        </div>
      ) : uploads.length > 0 ? (
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Your Uploads ({uploads.length})
          </div>
          <div className="grid grid-cols-2 gap-2">
            {uploads.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="aspect-square flex items-center justify-center p-2 bg-slate-50 relative">
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                  />
                  {bgRemovalLoadingId === item.id && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center z-20">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-600 mb-1" />
                      <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-wide">Removing BG...</span>
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                {bgRemovalLoadingId !== item.id && (
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleAddToCanvas(item.thumbnail)}
                      className="w-8 h-8 rounded-lg bg-[#936A3B] text-white flex items-center justify-center hover:bg-[#805B31] transition-colors cursor-pointer"
                      title="Add to canvas"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveBackground(item)}
                      className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors cursor-pointer"
                      title="Remove Background"
                    >
                      <Wand2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveUpload(item.id, item.isPersisted)}
                      className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* File name */}
                <div className="px-2 py-1.5 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-500 truncate">
                    {item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="p-6 text-center">
          <ImagePlus className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-[11px] text-slate-400 font-medium leading-normal">
            No images uploaded yet. Click the button above to add your custom
            artwork, logos, or photos.
          </p>
        </div>
      )}
    </div>
  );
}
