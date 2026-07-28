import React from "react";
import { Info, Calculator, Tag, Sparkles, Image as ImageIcon, Type, Layers } from "lucide-react";
import { useCustomizerStore } from "../store/useCustomizerStore";

export default function PriceCalculator() {
  const pricingDetails = useCustomizerStore((state) => state.pricingDetails);

  // Extract values with safe fallbacks
  const basePrice = pricingDetails?.base ?? 0;
  const textCost = pricingDetails?.text ?? 0;
  const imageCost = pricingDetails?.image ?? 0;
  const aiCost = pricingDetails?.ai ?? 0;
  const areaCost = pricingDetails?.area ?? 0;
  const extraCost = pricingDetails?.extra ?? 0;
  const totalCost = pricingDetails?.total ?? 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
        <Calculator className="h-4.5 w-4.5 text-slate-800" />
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Price Estimation</h4>
      </div>

      {/* Breakdowns List */}
      <div className="space-y-2.5 text-xs">
        
        {/* Base Price */}
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            Base Garment
          </span>
          <span className="font-semibold text-slate-800">₹{basePrice.toFixed(2)}</span>
        </div>

        {/* Text Elements */}
        {textCost > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-slate-400" />
              Text Layers
            </span>
            <span className="font-semibold text-slate-800">+ ₹{textCost.toFixed(2)}</span>
          </div>
        )}

        {/* Uploaded Images */}
        {imageCost > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
              Uploaded Graphics
            </span>
            <span className="font-semibold text-slate-800">+ ₹{imageCost.toFixed(2)}</span>
          </div>
        )}

        {/* AI Images */}
        {aiCost > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              AI Artworks
            </span>
            <span className="font-semibold text-slate-800">+ ₹{aiCost.toFixed(2)}</span>
          </div>
        )}

        {/* Print Area Size Charge */}
        {areaCost > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              Ink Coverage Area
            </span>
            <span className="font-semibold text-slate-800">+ ₹{areaCost.toFixed(2)}</span>
          </div>
        )}

        {/* Extra Sides (Sleeves / Hood / Pocket / Back) */}
        {extraCost > 0 && (
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              Extra Placements
            </span>
            <span className="font-semibold text-slate-800">+ ₹{extraCost.toFixed(2)}</span>
          </div>
        )}

        {/* Total Price Row */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
          <span className="text-sm font-bold text-slate-900">Total Price</span>
          <span className="text-base font-extrabold text-[#997241]">₹{totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-3.5 p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-normal">
          This price is an estimate based on graphic layers and surface dimensions. Final price is confirmed in cart checkout.
        </p>
      </div>
    </div>
  );
}