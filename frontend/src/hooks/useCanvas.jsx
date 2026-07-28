import { createContext, useState, useContext, useMemo } from "react";

const CanvasContext = createContext(null);

export const CanvasProvider = ({ children }) => {
  const [frontCanvas, setFrontCanvas] = useState(null);
  const [backCanvas, setBackCanvas] = useState(null);
  const [activeCanvas, setActiveCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  // 🟢 FIXED: Memoize the value object. 
  // This prevents unnecessary global tree re-renders during high-frequency 
  // dragging, scaling, or 3D camera zooming operations.
  const contextValue = useMemo(() => ({
    frontCanvas,
    setFrontCanvas,
    backCanvas,
    setBackCanvas,
    activeCanvas,
    setActiveCanvas,
    selectedObject,
    setSelectedObject,
  }), [frontCanvas, backCanvas, activeCanvas, selectedObject]);

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  // 🟢 Pro-Tip Safety Check: Throws a clean error if you accidentally 
  // call useCanvas() in a component that isn't wrapped inside <CanvasProvider>
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};