import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useCanvas } from "../context/CanvasContext";
import { DEFAULT_TEXT_CONFIG } from "../constants/designConstants";
import { recalculateTextCurve } from "../utils/textCurveHelper";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  ArrowUp,
  ArrowDown,
  Check,
  Search,
  ChevronDown,
  CaseSensitive,
  CaseUpper,
  CaseLower,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Font catalogue, grouped the way Canva groups its font picker.
// These are common OS/web-safe families since no custom font loader is wired
// up here. Swap in a Google Fonts loader later if you want real brand fonts.
// ---------------------------------------------------------------------------
const FONT_CATEGORIES = [
  {
    category: "Sans Serif",
    fonts: [
      { name: "Sans-Serif (Default)", value: "sans-serif" },
      { name: "Arial", value: "Arial" },
      { name: "Arial Black", value: "Arial Black" },
      { name: "Helvetica", value: "Helvetica" },
      { name: "Verdana", value: "Verdana" },
      { name: "Trebuchet MS", value: "Trebuchet MS" },
      { name: "Tahoma", value: "Tahoma" },
    ],
  },
  {
    category: "Serif",
    fonts: [
      { name: "Serif (Default)", value: "serif" },
      { name: "Playfair (Georgia)", value: "Georgia" },
      { name: "Times New Roman", value: "Times New Roman" },
      { name: "Garamond", value: "Garamond" },
      { name: "Cambria", value: "Cambria" },
    ],
  },
  {
    category: "Display / Bold",
    fonts: [
      { name: "Impact (Bold Pop)", value: "Impact" },
      { name: "Copperplate", value: "Copperplate" },
      { name: "Papyrus", value: "Papyrus" },
    ],
  },
  {
    category: "Handwriting",
    fonts: [
      { name: "Comic Sans", value: "Comic Sans MS" },
      { name: "Brush Script", value: "Brush Script MT" },
    ],
  },
  {
    category: "Monospace",
    fonts: [
      { name: "Monospace (Default)", value: "monospace" },
      { name: "Courier New", value: "Courier New" },
    ],
  },
];

const ALL_FONTS_FLAT = FONT_CATEGORIES.flatMap((c) =>
  c.fonts.map((f) => ({ ...f, category: c.category }))
);

const FONT_WEIGHTS = [
  { label: "Thin", value: "100" },
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Black", value: "900" },
];

const QUICK_SWATCHES = [
  "#000000",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

const EFFECT_STYLES = [
  { key: "none", label: "None" },
  { key: "shadow", label: "Shadow" },
  { key: "lift", label: "Lift" },
  { key: "hollow", label: "Hollow" },
  { key: "splice", label: "Splice" },
  { key: "neon", label: "Neon" },
  { key: "background", label: "Background" },
];

// Converts a #rrggbb hex string + 0-1 alpha into an rgba() string fabric.Shadow
// and textBackgroundColor are both happy to take.
function hexToRgba(hex, alpha = 1) {
  let h = (hex || "#000000").replace("#", "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function TypographyPanel({ manualSync }) {
  const { activeCanvas, getActiveCanvas } = useCanvas();
  const [selectedTextObject, setSelectedTextObject] = useState(null);

  // Core text staging state
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(34);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [textAlign, setTextAlign] = useState("left");

  // Font search combobox
  const [fontQuery, setFontQuery] = useState("");
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const fontBlurTimeout = useRef(null);

  // Style toggles
  const [fontWeightValue, setFontWeightValue] = useState("400");
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  // Spacing & case
  const [letterSpacing, setLetterSpacing] = useState(0); // fabric charSpacing units
  const [lineHeight, setLineHeight] = useState(1.16);
  const [textCase, setTextCase] = useState("none"); // none | uppercase | lowercase | capitalize

  // Effects
  const [effectStyle, setEffectStyle] = useState("none");
  const [effectColor, setEffectColor] = useState("#000000");
  const [effectIntensity, setEffectIntensity] = useState(30); // 0-100
  const [effectTransparency, setEffectTransparency] = useState(20); // 0-100

  // Curve settings
  const [curveRadius, setCurveRadius] = useState(0);
  const [curveDirection, setCurveDirection] = useState("up");

  // -------------------------------------------------------------------------
  // Track canvas selection and hydrate the panel from the selected object
  // -------------------------------------------------------------------------
  useEffect(() => {
    const canvas = activeCanvas || getActiveCanvas();
    if (!canvas) return;

    const updatePanelControls = (targetObject) => {
      if (targetObject && (targetObject.type === "textbox" || targetObject.type === "text" || targetObject.type === "i-text")) {
        setSelectedTextObject(targetObject);
        setTextColor(targetObject.get("fill") || "#000000");
        setFontSize(targetObject.get("fontSize") || 24);
        setFontFamily(targetObject.get("fontFamily") || "sans-serif");
        setFontQuery("");
        setTextAlign(targetObject.get("textAlign") || "left");

        const weight = String(targetObject.get("fontWeight") || "400");
        setFontWeightValue(
          FONT_WEIGHTS.some((w) => w.value === weight) ? weight : weight === "bold" ? "700" : weight === "normal" ? "400" : "400"
        );
        setIsItalic(targetObject.get("fontStyle") === "italic");
        setIsUnderline(targetObject.get("underline") || false);
        setIsStrikethrough(targetObject.get("linethrough") || false);

        setLetterSpacing(targetObject.get("charSpacing") || 0);
        setLineHeight(targetObject.get("lineHeight") || 1.16);
        setTextCase(targetObject.get("textCase") || "none");

        setEffectStyle(targetObject.get("effectStyle") || "none");
        setEffectColor(targetObject.get("effectColor") || "#000000");
        setEffectIntensity(
          targetObject.get("effectIntensity") !== undefined ? targetObject.get("effectIntensity") : 30
        );
        setEffectTransparency(
          targetObject.get("effectTransparency") !== undefined ? targetObject.get("effectTransparency") : 20
        );

        const savedRadius = targetObject.get("curveRadius") || 0;
        setCurveRadius(savedRadius);
        setCurveDirection(targetObject.get("curveDirection") || "up");
      } else {
        setSelectedTextObject(null);
      }
    };

    const handleSelectionCreated = (e) => {
      const selected = e.selected?.[0] || canvas.getActiveObject();
      updatePanelControls(selected);
    };

    const handleSelectionCleared = () => {
      setSelectedTextObject(null);
    };

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionCreated);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("canvas:cleared", handleSelectionCleared);

    const currentActive = canvas.getActiveObject();
    if (currentActive) updatePanelControls(currentActive);

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionCreated);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("canvas:cleared", handleSelectionCleared);
    };
  }, [activeCanvas, getActiveCanvas]);

  // 📝 Adds Text Only to 2D Canvas Workspace
  const addTextPreset = (sizeStyle) => {
    const canvas = activeCanvas || getActiveCanvas();
    if (!canvas) return;
    let textProps = { ...DEFAULT_TEXT_CONFIG };

    switch (sizeStyle) {
      case "heading":
        textProps = { ...textProps, fontSize: 34, fontWeight: "700", text: "Heading Text" };
        break;
      case "subheading":
        textProps = { ...textProps, fontSize: 22, fontWeight: "600", text: "Subheading Text" };
        break;
      default:
        textProps = { ...textProps, fontSize: 14, fontWeight: "400", text: "Body paragraph text" };
    }

    const textbox = new fabric.Textbox(textProps.text, {
      ...textProps,
      left: canvas.width / 2,
      top: canvas.height / 2,
      width: 250,
      originX: "center",
      originY: "center",
      editable: true,
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    setSelectedTextObject(textbox);
  };

  // ⚡ INSTANT 2D CANVAS WORKSPACE PREVIEW MODIFIER
  const updateLiveProp = (property, value) => {
    if (!selectedTextObject || !activeCanvas) return;
    selectedTextObject.set(property, value);
    activeCanvas.requestRenderAll();
  };

  // -------------------------------------------------------------------------
  // Text case (Aa / AA / aa) — non-destructive: keeps the last "typed" text
  // in _baseText so switching case never permanently mangles what was typed.
  // -------------------------------------------------------------------------
  const applyTextCase = (caseType) => {
    if (!selectedTextObject || !activeCanvas) return;
    const nextCase = textCase === caseType ? "none" : caseType;
    const base = selectedTextObject.get("_baseText") ?? selectedTextObject.text ?? "";

    let transformed = base;
    if (nextCase === "uppercase") transformed = base.toUpperCase();
    else if (nextCase === "lowercase") transformed = base.toLowerCase();
    else if (nextCase === "capitalize") {
      transformed = base.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase());
    }

    selectedTextObject.set("_baseText", base);
    selectedTextObject.set("text", transformed);
    selectedTextObject.set("textCase", nextCase);
    setTextCase(nextCase);
    activeCanvas.requestRenderAll();
  };

  // -------------------------------------------------------------------------
  // Effects: None / Shadow / Lift / Hollow / Splice / Neon / Background
  // Approximated on top of fabric's single-shadow model since a Textbox can't
  // carry multiple stacked shadows the way Canva's renderer does internally.
  // -------------------------------------------------------------------------
  const applyTextEffect = (style, overrides = {}) => {
    if (!selectedTextObject || !activeCanvas) return;

    const color = overrides.color ?? effectColor;
    const intensity = overrides.intensity ?? effectIntensity;
    const transparency = overrides.transparency ?? effectTransparency;
    const alpha = 1 - transparency / 100;

    const originalFill = selectedTextObject.get("_effectOriginalFill") || selectedTextObject.get("fill") || textColor;
    selectedTextObject.set("_effectOriginalFill", originalFill);

    // Reset effect-related props before applying the new one
    selectedTextObject.set({
      shadow: null,
      stroke: null,
      strokeWidth: 0,
      textBackgroundColor: null,
      fill: originalFill,
    });

    switch (style) {
      case "shadow": {
        const offset = 2 + intensity * 0.25;
        selectedTextObject.set(
          "shadow",
          new fabric.Shadow({
            color: hexToRgba(color, alpha),
            offsetX: offset,
            offsetY: offset,
            blur: intensity * 0.35,
          })
        );
        break;
      }
      case "lift": {
        selectedTextObject.set(
          "shadow",
          new fabric.Shadow({
            color: hexToRgba("#000000", 0.35 * alpha),
            offsetX: 0,
            offsetY: 1 + intensity * 0.12,
            blur: 10 + intensity * 0.3,
          })
        );
        break;
      }
      case "hollow": {
        selectedTextObject.set({
          fill: "transparent",
          stroke: color,
          strokeWidth: 1 + intensity * 0.06,
        });
        break;
      }
      case "splice": {
        const offset = 2 + intensity * 0.22;
        selectedTextObject.set(
          "shadow",
          new fabric.Shadow({
            color: hexToRgba(color, alpha),
            offsetX: offset,
            offsetY: offset,
            blur: 0,
          })
        );
        break;
      }
      case "neon": {
        selectedTextObject.set(
          "shadow",
          new fabric.Shadow({
            color: hexToRgba(color, alpha),
            offsetX: 0,
            offsetY: 0,
            blur: 6 + intensity * 0.5,
          })
        );
        selectedTextObject.set({ stroke: color, strokeWidth: 0.5 });
        break;
      }
      case "background": {
        selectedTextObject.set("textBackgroundColor", hexToRgba(color, alpha));
        break;
      }
      case "none":
      default:
        break;
    }

    selectedTextObject.set({
      effectStyle: style,
      effectColor: color,
      effectIntensity: intensity,
      effectTransparency: transparency,
    });

    setEffectStyle(style);
    setEffectColor(color);
    setEffectIntensity(intensity);
    setEffectTransparency(transparency);
    activeCanvas.requestRenderAll();
  };

  const handleLiveCurveChange = (radiusValue, direction = curveDirection) => {
    if (!selectedTextObject || !activeCanvas) return;

    setCurveRadius(radiusValue);
    setCurveDirection(direction);

    selectedTextObject.set("curveRadius", radiusValue);
    selectedTextObject.set("curveDirection", direction);

    recalculateTextCurve(selectedTextObject);
    activeCanvas.requestRenderAll();
  };

  // 👕 3D MODEL WORKSPACE EMITTER COUPLING (RELOADED)
  const handleApplyTypographyChanges = () => {
    if (!selectedTextObject || !activeCanvas) return;

    // 1. Force state changes to drop cache bindings
    selectedTextObject.setCoords();

    // 2. Clear out selections handles entirely so bounding boxes don't print on the 3D texture
    const currentActive = activeCanvas.getActiveObject();
    activeCanvas.discardActiveObject();

    // 3. 🚨 CRITICAL: Fire core Fabric canvas events that background sync systems rely on
    activeCanvas.fire("object:modified", { target: selectedTextObject });
    selectedTextObject.fire("modified");

    // 4. Force global canvas synchronization render passes
    activeCanvas.renderAll();

    // 5. Fire your explicit 3D sync function override loop
    if (manualSync) {
      manualSync();
    }

    // 6. Return active user selection highlights
    if (currentActive) {
      activeCanvas.setActiveObject(currentActive);
      activeCanvas.renderAll();
    }
  };

  const filteredFonts = fontQuery.trim()
    ? ALL_FONTS_FLAT.filter((f) => f.name.toLowerCase().includes(fontQuery.trim().toLowerCase()))
    : null;

  const activeFontLabel =
    ALL_FONTS_FLAT.find((f) => f.value === fontFamily)?.name || fontFamily;

  return (
    <div className="space-y-5 h-full overflow-y-auto pr-1 max-h-[75vh]">
      {/* SECTION 1: PRESETS */}
      <div className="space-y-2">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Click to add text</p>
        <button onClick={() => addTextPreset("heading")} className="w-full text-left p-3 border border-gray-100 rounded-xl hover:border-violet-200 bg-white shadow-sm font-bold text-xl cursor-pointer">Add Heading</button>
        <button onClick={() => addTextPreset("subheading")} className="w-full text-left p-3 border border-gray-100 rounded-xl hover:border-violet-200 bg-white shadow-sm font-semibold text-base text-gray-700 cursor-pointer">Add Subheading</button>
        <button onClick={() => addTextPreset("body")} className="w-full text-left p-3 border border-gray-100 rounded-xl hover:border-violet-200 bg-white shadow-sm text-sm text-gray-600 cursor-pointer">Add Body Text</button>
      </div>

      {/* SECTION 2: LIVE DESIGNS EDITOR */}
      {selectedTextObject ? (
        <div className="pt-4 border-t border-gray-200/80 space-y-4">
          <p className="text-[11px] text-violet-600 font-bold uppercase tracking-wider">Text Customizer</p>

          {/* Font Family — searchable combobox, grouped like Canva */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1"><Type className="h-3 w-3" /> Font Style</label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={fontMenuOpen ? fontQuery : activeFontLabel}
                onFocus={() => { setFontMenuOpen(true); setFontQuery(""); }}
                onChange={(e) => setFontQuery(e.target.value)}
                onBlur={() => {
                  fontBlurTimeout.current = setTimeout(() => setFontMenuOpen(false), 150);
                }}
                placeholder="Search fonts..."
                className="w-full text-xs pl-8 pr-8 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-violet-500 outline-none cursor-text"
                style={{ fontFamily }}
              />
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {fontMenuOpen && (
              <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-1.5">
                {(filteredFonts ? [{ category: "Results", fonts: filteredFonts }] : FONT_CATEGORIES).map((group) => (
                  <div key={group.category} className="mb-1.5 last:mb-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2 py-1">{group.category}</p>
                    {group.fonts.length === 0 && (
                      <p className="text-xs text-gray-400 px-2 py-1">No fonts match "{fontQuery}"</p>
                    )}
                    {group.fonts.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clearTimeout(fontBlurTimeout.current);
                          setFontFamily(f.value);
                          updateLiveProp("fontFamily", f.value);
                          setFontMenuOpen(false);
                          setFontQuery("");
                        }}
                        className={`w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-violet-50 cursor-pointer ${fontFamily === f.value ? "bg-violet-100 text-violet-700 font-medium" : "text-gray-700"}`}
                        style={{ fontFamily: f.value }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weight + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Weight</label>
              <select
                value={fontWeightValue}
                onChange={(e) => { setFontWeightValue(e.target.value); updateLiveProp("fontWeight", e.target.value); }}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-1 focus:ring-violet-500 outline-none cursor-pointer"
              >
                {FONT_WEIGHTS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Size</label>
              <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl p-1.5 bg-white">
                <button
                  type="button"
                  onClick={() => { const val = Math.max(6, fontSize - 1); setFontSize(val); updateLiveProp("fontSize", val); if (curveRadius > 0) handleLiveCurveChange(curveRadius); }}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-gray-600 cursor-pointer text-sm font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => { const val = parseInt(e.target.value) || 0; setFontSize(val); updateLiveProp("fontSize", val); if (curveRadius > 0) handleLiveCurveChange(curveRadius); }}
                  className="w-full text-xs text-center outline-none"
                />
                <button
                  type="button"
                  onClick={() => { const val = fontSize + 1; setFontSize(val); updateLiveProp("fontSize", val); if (curveRadius > 0) handleLiveCurveChange(curveRadius); }}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-gray-600 cursor-pointer text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <input
            type="range"
            min="6"
            max="200"
            value={fontSize}
            onInput={(e) => { const val = parseInt(e.target.value); setFontSize(val); updateLiveProp("fontSize", val); if (curveRadius > 0) handleLiveCurveChange(curveRadius); }}
            onChange={(e) => { const val = parseInt(e.target.value); setFontSize(val); updateLiveProp("fontSize", val); if (curveRadius > 0) handleLiveCurveChange(curveRadius); }}
            className="w-full h-6 accent-violet-600 cursor-pointer"
          />

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Text Color</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1.5 bg-white">
              <input
                type="color"
                value={textColor}
                onInput={(e) => { setTextColor(e.target.value); updateLiveProp("fill", e.target.value); }}
                onChange={(e) => { setTextColor(e.target.value); updateLiveProp("fill", e.target.value); }}
                className="w-7 h-7 rounded-md cursor-pointer border-0 bg-transparent"
              />
              <span className="text-[11px] font-mono uppercase tracking-tight">{textColor}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => { setTextColor(swatch); updateLiveProp("fill", swatch); }}
                  className={`w-6 h-6 rounded-full border cursor-pointer ${textColor === swatch ? "ring-2 ring-violet-500 ring-offset-1" : "border-gray-200"}`}
                  style={{ backgroundColor: swatch }}
                  title={swatch}
                />
              ))}
            </div>
          </div>

          {/* Typography Formatting */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Formatting</label>
            <div className="flex flex-wrap gap-1 bg-slate-50 p-1.5 rounded-xl border border-gray-100">
              <button onClick={() => { const next = fontWeightValue === "700" ? "400" : "700"; setFontWeightValue(next); updateLiveProp("fontWeight", next); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${fontWeightValue === "700" || fontWeightValue === "900" ? 'bg-violet-600 text-white' : 'hover:bg-slate-200 text-gray-600'}`}><Bold className="h-4 w-4" /></button>
              <button onClick={() => { setIsItalic(!isItalic); updateLiveProp("fontStyle", !isItalic ? "italic" : "normal"); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${isItalic ? 'bg-violet-600 text-white' : 'hover:bg-slate-200 text-gray-600'}`}><Italic className="h-4 w-4" /></button>
              <button onClick={() => { setIsUnderline(!isUnderline); updateLiveProp("underline", !isUnderline); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${isUnderline ? 'bg-violet-600 text-white' : 'hover:bg-slate-200 text-gray-600'}`}><Underline className="h-4 w-4" /></button>
              <button onClick={() => { setIsStrikethrough(!isStrikethrough); updateLiveProp("linethrough", !isStrikethrough); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${isStrikethrough ? 'bg-violet-600 text-white' : 'hover:bg-slate-200 text-gray-600'}`}><Strikethrough className="h-4 w-4" /></button>

              <div className="h-6 w-[1px] bg-gray-200 mx-2 self-center"></div>

              <button onClick={() => { setTextAlign("left"); updateLiveProp("textAlign", "left"); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${textAlign === "left" ? 'bg-violet-100 text-violet-700' : 'text-gray-500'}`}><AlignLeft className="h-4 w-4" /></button>
              <button onClick={() => { setTextAlign("center"); updateLiveProp("textAlign", "center"); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${textAlign === "center" ? 'bg-violet-100 text-violet-700' : 'text-gray-500'}`}><AlignCenter className="h-4 w-4" /></button>
              <button onClick={() => { setTextAlign("right"); updateLiveProp("textAlign", "right"); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${textAlign === "right" ? 'bg-violet-100 text-violet-700' : 'text-gray-500'}`}><AlignRight className="h-4 w-4" /></button>
              <button onClick={() => { setTextAlign("justify"); updateLiveProp("textAlign", "justify"); }} className={`p-2 rounded-lg transition-colors cursor-pointer ${textAlign === "justify" ? 'bg-violet-100 text-violet-700' : 'text-gray-500'}`}><AlignJustify className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Spacing & Case */}
          <div className="space-y-3 border-t border-slate-100 pt-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-600">Letter Spacing</label>
                <span className="text-[10px] font-bold text-violet-600">{letterSpacing}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="800"
                step="10"
                value={letterSpacing}
                onInput={(e) => { const val = parseInt(e.target.value); setLetterSpacing(val); updateLiveProp("charSpacing", val); }}
                onChange={(e) => { const val = parseInt(e.target.value); setLetterSpacing(val); updateLiveProp("charSpacing", val); }}
                className="w-full accent-violet-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-600">Line Height</label>
                <span className="text-[10px] font-bold text-violet-600">{lineHeight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={lineHeight}
                onInput={(e) => { const val = parseFloat(e.target.value); setLineHeight(val); updateLiveProp("lineHeight", val); }}
                onChange={(e) => { const val = parseFloat(e.target.value); setLineHeight(val); updateLiveProp("lineHeight", val); }}
                className="w-full accent-violet-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Text Case</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                <button type="button" onClick={() => applyTextCase("capitalize")} className={`flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg font-medium transition-all cursor-pointer ${textCase === "capitalize" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
                  <CaseSensitive className="h-3.5 w-3.5" /> Aa
                </button>
                <button type="button" onClick={() => applyTextCase("uppercase")} className={`flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg font-medium transition-all cursor-pointer ${textCase === "uppercase" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
                  <CaseUpper className="h-3.5 w-3.5" /> AA
                </button>
                <button type="button" onClick={() => applyTextCase("lowercase")} className={`flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg font-medium transition-all cursor-pointer ${textCase === "lowercase" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
                  <CaseLower className="h-3.5 w-3.5" /> aa
                </button>
              </div>
            </div>
          </div>

          {/* EFFECTS PANEL */}
          <div className="space-y-2.5 border-t border-slate-100 pt-3">
            <label className="text-xs font-medium text-gray-600">Effects</label>
            <div className="grid grid-cols-4 gap-2">
              {EFFECT_STYLES.map((eff) => (
                <button
                  key={eff.key}
                  type="button"
                  onClick={() => applyTextEffect(eff.key)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-medium cursor-pointer transition-all ${effectStyle === eff.key ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-100 bg-white text-gray-600 hover:border-violet-200"}`}
                >
                  <span
                    className="text-sm font-black"
                    style={
                      eff.key === "hollow"
                        ? { WebkitTextStroke: "1px currentColor", color: "transparent" }
                        : eff.key === "shadow"
                        ? { textShadow: "1.5px 1.5px 0 rgba(0,0,0,0.35)" }
                        : eff.key === "lift"
                        ? { textShadow: "0 3px 4px rgba(0,0,0,0.35)" }
                        : eff.key === "splice"
                        ? { textShadow: "2px 2px 0 #8b5cf6" }
                        : eff.key === "neon"
                        ? { textShadow: "0 0 6px #8b5cf6", color: "#8b5cf6" }
                        : eff.key === "background"
                        ? { backgroundColor: "#eee", padding: "0 4px", borderRadius: "3px" }
                        : {}
                    }
                  >
                    Ag
                  </span>
                  {eff.label}
                </button>
              ))}
            </div>

            {effectStyle !== "none" && (
              <div className="space-y-2.5 bg-slate-50 border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-gray-600">Color</label>
                  <input
                    type="color"
                    value={effectColor}
                    onChange={(e) => applyTextEffect(effectStyle, { color: e.target.value })}
                    className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-medium text-gray-600">Intensity</label>
                    <span className="text-[10px] font-bold text-violet-600">{effectIntensity}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={effectIntensity}
                    onInput={(e) => applyTextEffect(effectStyle, { intensity: parseInt(e.target.value) })}
                    onChange={(e) => applyTextEffect(effectStyle, { intensity: parseInt(e.target.value) })}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-medium text-gray-600">Transparency</label>
                    <span className="text-[10px] font-bold text-violet-600">{effectTransparency}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={effectTransparency}
                    onInput={(e) => applyTextEffect(effectStyle, { transparency: parseInt(e.target.value) })}
                    onChange={(e) => applyTextEffect(effectStyle, { transparency: parseInt(e.target.value) })}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* TEXT ARC PANEL */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-gray-600">Curve Radius / Text Arc</label>
              <span className="text-[10px] font-bold text-violet-600 uppercase">
                {curveRadius === 0 ? "Straight" : `${curveRadius}r (${curveDirection})`}
              </span>
            </div>

            {/* Direction Selectors */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleLiveCurveChange(curveRadius, "up")}
                className={`flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  curveDirection === "up" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <ArrowUp className="h-3.5 w-3.5" /> Curve Up
              </button>
              <button
                type="button"
                onClick={() => handleLiveCurveChange(curveRadius, "down")}
                className={`flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  curveDirection === "down" ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <ArrowDown className="h-3.5 w-3.5" /> Curve Down
              </button>
            </div>

            {/* Arc Slider Scale */}
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={curveRadius}
              onInput={(e) => handleLiveCurveChange(parseInt(e.target.value))}
              onChange={(e) => handleLiveCurveChange(parseInt(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer mt-1"
            />
          </div>

        </div>
      ) : (
        <div className="pt-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 italic">Select text workspace elements to reveal properties</p>
        </div>
      )}
    </div>
  );
}