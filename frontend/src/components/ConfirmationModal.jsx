import React from 'react';
import { Trash2, X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure you want to remove this item?", 
  confirmText = "Yes, Remove", 
  cancelText = "Keep Item" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      {/* Main Modal Card Structure */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white rounded-[32px] p-8 shadow-2xl text-center border border-gray-100 flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Right Corner Dismiss Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Floating Accent Decorated Trash Vector Block */}
        <div className="relative flex items-center justify-center w-20 h-20 text-[#E15252] mb-1">
          <Trash2 size={52} strokeWidth={1.5} />
          <span className="absolute top-1 right-0 text-xs font-bold rotate-12 opacity-60">✕</span>
          <span className="absolute bottom-5 right-0 text-lg font-bold opacity-60">×</span>
          <span className="absolute top-5 left-0 text-xs font-bold opacity-40">•</span>
          <span className="absolute bottom-3 left-1 text-sm font-bold rotate-45 opacity-50">+</span>
        </div>

        {/* Dynamic Core Question Statement */}
        <h3 className="text-black font-extrabold text-base sm:text-lg tracking-tight max-w-[240px] leading-snug">
          {title}
        </h3>

        {/* Interactive Processing Action Buttons */}
        <div className="w-full flex flex-col items-center space-y-3.5 pt-1">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full max-w-[210px] bg-[#E15252] hover:bg-[#c94444] text-white font-bold text-sm py-3.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            {confirmText}
          </button>

          <button
            onClick={onClose}
            className="text-[#E15252] hover:text-[#c94444] font-bold text-xs tracking-wide uppercase transition-colors pt-1 cursor-pointer"
          >
            {cancelText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;