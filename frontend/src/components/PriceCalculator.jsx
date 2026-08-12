import React from "react";
import { Info, Calculator, Tag, Sparkles, Image as ImageIcon, Type, Layers, Users } from "lucide-react";
import { useCustomizerStore } from "../store/useCustomizerStore";

export default function PriceCalculator({
  isBulkRoster = false,
  rosterCount = 1,
  rosterDesignMode = "uniform",
  rosterGrandTotal = null, // Ensure this prop is passed from parent component
}) {
  const pricingDetails = useCustomizerStore((state) => state.pricingDetails);

  // Extract values with safe fallbacks
  const basePrice = pricingDetails?.base ?? 0;
  const textCost = pricingDetails?.text ?? 0;
  const imageCost = pricingDetails?.image ?? 0;
  const aiCost = pricingDetails?.ai ?? 0;
  const areaCost = pricingDetails?.area ?? 0;
  const extraCost = pricingDetails?.extra ?? 0;
  const totalCost = pricingDetails?.total ?? 0;
  const elements = pricingDetails?.elements || [];

  const isBulkActive = isBulkRoster && rosterCount > 1;

  let grandTotalValue = 0;
  let breakdownText = "";

  if (isBulkActive) {
    if (typeof rosterGrandTotal === "number" && rosterGrandTotal > 0) {
      grandTotalValue = rosterGrandTotal;
    } else {
      grandTotalValue = totalCost * rosterCount;
    }
    breakdownText = `(Sum of ${rosterCount} T-Shirts)`;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4.5 w-4.5 text-slate-800 dark:text-slate-200" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Price Estimation</h4>
        </div>
        {isBulkActive && (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-[#997241]/10 text-[#997241] px-2 py-0.5 rounded-full font-mono">
            <Users className="h-3 w-3" />
            {rosterCount} Shirts
          </span>
        )}
      </div>

      {/* Breakdowns List */}
      <div className="space-y-2.5 text-xs">
        
        {/* Base Price */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            Base Garment
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">₹{basePrice.toFixed(2)}</span>
        </div>

        {/* Individual Design Elements Breakdown */}
        {Array.isArray(elements) && elements.length > 0 ? (
          elements.map((el, idx) => (
            <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 truncate max-w-[210px]" title={`${el.label} (${el.dimensions})`}>
                {el.type === "ai" ? (
                  <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                ) : el.type === "image" ? (
                  <ImageIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                ) : (
                  <Type className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                )}
                <span className="truncate font-medium text-slate-700 dark:text-slate-300">{el.label}</span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">({el.dimensions})</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">+ ₹{el.price.toFixed(2)}</span>
            </div>
          ))
        ) : (
          areaCost > 0 && (
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                Ink Coverage Area
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">+ ₹{areaCost.toFixed(2)}</span>
            </div>
          )
        )}

        {/* Extra Placement Charge */}
        {extraCost > 0 && (
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              Extra Placements
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">+ ₹{extraCost.toFixed(2)}</span>
          </div>
        )}

        {/* Total Price Row */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 mt-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isBulkActive ? "Price Per Shirt (Active Preview)" : "Total Price"}
          </span>
          <span className={`font-extrabold ${isBulkActive ? "text-slate-800 dark:text-slate-200 text-sm" : "text-[#997241] text-base"}`}>
            ₹{totalCost.toFixed(2)}
          </span>
        </div>

        {/* Grand Total Row for Bulk Roster */}
        {isBulkActive && (
          <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-700 pt-2.5 mt-1">
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block">Grand Total</span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {breakdownText}
              </span>
            </div>
            <span className="text-lg font-black text-[#997241]">
              ₹{grandTotalValue.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-3.5 p-2.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 rounded-lg flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
          This price is an estimate based on graphic layers and surface dimensions. Final price is confirmed in cart checkout.
        </p>
      </div>
    </div>
  );
}