import React, { useEffect, useState } from "react";
import { CANVAS_CONFIG } from "../constants/designConstants";
import { useTshirtCanvas } from "../hooks/useTshirtCanvas";

const TshirtCanvasBack = ({ rawSvg }) => {
  const [inlineXml, setInlineXml] = useState("");
  
  const { canvasRef, tshirtColor } = useTshirtCanvas({
    svgPath: rawSvg, 
    inlineXml: inlineXml,
    view: "back",
  });

  useEffect(() => {
    if (!rawSvg || typeof rawSvg !== "string") return;

    if (rawSvg.trim().startsWith("<svg")) {
      setInlineXml(rawSvg);
    } else {
      fetch(rawSvg)
        .then((res) => res.text())
        .then((text) => setInlineXml(text))
        .catch((err) => console.error("Error loading clothing back SVG:", err));
    }
  }, [rawSvg]);

  // 🎨 STYLING MACRO: Clear background color fill with sharp, deep black outlines
  const svgStyleOverride = `
    .mojilo-svg-container-back svg {
      width: 100%;
      height: 100%;
      background-color: transparent;
      border-radius: 16px;
    }
    .mojilo-svg-container-back svg #path12 {
      stroke: none !important;
      fill: none !important;
      display: none !important;
    }
    .mojilo-svg-container-back svg path[style*="fill:#ffffff"],
    .mojilo-svg-container-back svg path[style*="fill:#FFFFFF"],
    .mojilo-svg-container-back svg path[style*="fill:#dcdcdc"],
    .mojilo-svg-container-back svg path[style*="fill:#DCDCDC"],
    .mojilo-svg-container-back svg path[fill="#ffffff"],
    .mojilo-svg-container-back svg path[fill="#FFFFFF"],
    .mojilo-svg-container-back svg path[fill="#dcdcdc"],
    .mojilo-svg-container-back svg path[fill="#DCDCDC"] {
      fill: ${tshirtColor || "#ffffff"} !important;
      transition: fill 0.3s ease;
    }
    .mojilo-svg-container-back svg path, 
    .mojilo-svg-container-back svg vector,
    .mojilo-svg-container-back svg polygon,
    .mojilo-svg-container-back svg circle,
    .mojilo-svg-container-back svg line,
    .mojilo-svg-container-back svg polyline,
    .mojilo-svg-container-back svg g {
      stroke: #000000 !important;
      stroke-width: 1.5px !important;
      stroke-opacity: 1 !important;
    }
    .mojilo-svg-container-back svg rect {
      stroke: none !important;
      stroke-width: 0 !important;
      filter: url(#hoodie-color-filter-back);
    }
  `;

  return (
    <div className="relative" style={{ width: CANVAS_CONFIG.width, height: CANVAS_CONFIG.height }}>
      <style>{svgStyleOverride}</style>

      {/* SVG Colorization Filter definitions */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="hoodie-color-filter-back">
            <feFlood flood-color={tshirtColor || "#ffffff"} result="tint" />
            <feBlend in="SourceGraphic" in2="tint" mode="multiply" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* DYNAMIC RAW INJECTION DOCK */}
      <div 
        className="mojilo-svg-container-back absolute inset-0 pointer-events-none flex items-center justify-center opacity-95"
        dangerouslySetInnerHTML={{ __html: inlineXml || "<svg></svg>" }}
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10"
        width={CANVAS_CONFIG.width}
        height={CANVAS_CONFIG.height}
      />
    </div>
  );
};

export default TshirtCanvasBack;