import React, { useEffect, useState } from "react";
import { useCustomizerStore } from "../store/useCustomizerStore";
import { apparelConfig } from "../utils/apparelConfig";
import { Shirt } from "lucide-react";
import { useCanvas } from "../context/CanvasContext";
import api from "../lib/axios";

/**
 * ProductSelector — driven by live admin panel data.
 *
 * Fetches GET /api/apparel-templates on mount and exposes:
 *   - Up-to-date base prices set by the admin
 *   - Per-product available colors (used by the apparel panel in CoustomProductTshirt)
 *   - Per-product enabled sizes (ditto)
 *
 * Falls back to `apparelConfig` static values if the API is unavailable,
 * so the page never breaks when the backend is offline.
 *
 * The fetched data is written into the `apparelTemplates` Zustand slice so
 * every component (PriceCalculator, size picker, color picker) can read it
 * without prop-drilling.
 */
export default function ProductSelector() {
  const currentProduct   = useCustomizerStore((s) => s.currentProduct);
  const setCurrentProduct = useCustomizerStore((s) => s.setCurrentProduct);
  const setApparelTemplates = useCustomizerStore((s) => s.setApparelTemplates);
  const apparelTemplates = useCustomizerStore((s) => s.apparelTemplates);
  const { resetCanvases } = useCanvas();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const res = await api.get("/apparel-templates");
        const data = res.data?.data || [];
        if (!cancelled && data.length > 0) {
          // Convert array → keyed map for O(1) lookups: { 'half-sleeve': {...}, ... }
          const map = {};
          data.forEach((t) => { map[t.key] = t; });
          setApparelTemplates(map);
        }
      } catch (err) {
        console.warn("[ProductSelector] Could not fetch apparel templates from API, using defaults:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTemplates();
    return () => { cancelled = true; };
  }, [setApparelTemplates]);

  // Show all products that exist in the local config (3D models, print areas etc.)
  // but overlay price from the live admin data when available.
  const products = Object.entries(apparelConfig).map(([key, cfg]) => {
    const live = apparelTemplates?.[key];
    return {
      key,
      name: live?.name ?? cfg.name,
      basePrice: live?.basePrice ?? cfg.basePrice,
      isActive: live?.isActive ?? true,
    };
  }).filter((p) => p.isActive);

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Select Product
      </div>

      {loading && products.length === 0 ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {products.map(({ key, name, basePrice }) => {
            const isSelected = currentProduct === key;
            return (
              <button
                key={key}
                onClick={() => {
                  if (key !== currentProduct) {
                    resetCanvases();
                    setCurrentProduct(key);
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shirt
                    className={`h-4.5 w-4.5 ${isSelected ? "text-amber-400" : "text-slate-400"}`}
                  />
                  <span className="text-xs font-bold">{name}</span>
                </div>
                <span
                  className={`text-[10px] font-bold ${
                    isSelected ? "text-amber-300" : "text-slate-400"
                  }`}
                >
                  ₹{typeof basePrice === "number" ? basePrice.toFixed(2) : basePrice}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
