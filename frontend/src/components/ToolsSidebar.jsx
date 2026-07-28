import { useState, useEffect, useRef } from "react";
import { Hammer, X } from "lucide-react";
import ToolBar from "./ToolBar";

// 📦 1. CRITICAL IMPORTS: Ensure all sub-panels are imported correctly
import TypographyPanel from "./TypographyPanel";
import StickersPanel from "./StickersPanel";
import ShapesPanel from "./ShapesPanel"; // 👈 Make sure this file exists!

export default function ToolsSidebar({ manualSync }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubPanel, setActiveSubPanel] = useState(null); // 'text', 'stickers', 'shapes', or null
  const panelRef = useRef(null);

  // Close sub-panels if clicking completely outside the canvas toolkit sidebar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setActiveSubPanel(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSubPanel = (panelType) => {
    setActiveSubPanel(activeSubPanel === panelType ? null : panelType);
  };

  const SidebarContent = () => (
    <div ref={panelRef} className="flex h-full relative z-30">
      {/* Primary Left Navigation Options */}
      <div className="w-[240px] flex flex-col h-full bg-slate-50 border-r border-gray-200 shrink-0">

        {/* Toolbar Controls Matrix */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 px-1">
              Mojilo Canvas Elements
            </div>
            
            {/* 🟢 FIXED: Successfully mapping all element toggle states down to layout grid buttons */}
            <ToolBar 
              manualSync={manualSync} 
              onToggleText={() => toggleSubPanel('text')}
              onToggleStickers={() => toggleSubPanel('stickers')}
              onToggleShapes={() => toggleSubPanel('shapes')} 
              activeSubPanel={activeSubPanel}
            />
          </div>
        </div>
      </div>

      {/* --- CONTEXTUAL SLIDE-OUT SUB-PANEL DRAWER --- */}
      {/* 🟢 FIXED: Checking string parameters dynamically so drawers render their layout contents */}
      {activeSubPanel && (
        <div className="absolute left-[240px] top-0 h-full w-[260px] bg-white border-r border-gray-200 shadow-xl z-[-1] flex flex-col animate-in slide-in-from-left-5 duration-200">
          
          {/* Dynamic Header Titles */}
          <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {activeSubPanel === 'text' && 'Text Styles'}
              {activeSubPanel === 'stickers' && 'Stickers & Graphics'}
              {activeSubPanel === 'shapes' && 'Shapes & Elements'}
            </span>
            <button 
              onClick={() => setActiveSubPanel(null)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {/* Dynamic Component Insertion Area */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeSubPanel === 'text' && <TypographyPanel />}
            {activeSubPanel === 'stickers' && <StickersPanel manualSync={manualSync} />}
            {activeSubPanel === 'shapes' && <ShapesPanel manualSync={manualSync} />}
          </div>

        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Trigger Button Layout */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white shadow-md z-40"
      >
        <Hammer className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile Drawer Backing Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[290px] bg-white shadow-2xl flex h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Core Desktop Sidebar Container Grid Aspect */}
      <div className="hidden lg:block h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  );
}