import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Context
const CanvasContext = createContext(null);

// Create the Provider Component
export const CanvasProvider = ({ children }) => {
  // 👕 All core Fabric Canvas instances managed gracefully in memory
  const [frontCanvas, setFrontCanvas] = useState(null);
  const [backCanvas, setBackCanvas] = useState(null);
  const [leftCanvas, setLeftCanvas] = useState(null);
  const [rightCanvas, setRightCanvas] = useState(null);
  const [pocketCanvas, setPocketCanvas] = useState(null);
  const [hoodCanvas, setHoodCanvas] = useState(null);
  
  // Track which canvas view is currently active/visible in editing
  const [activeCanvas, setActiveCanvas] = useState(null);
  
  // Track currently clicked/highlighted object on the active workspace
  const [selectedObject, setSelectedObject] = useState(null);

  // 📑 Dynamic state array tracking layers list for the active view viewport
  const [canvasLayers, setCanvasLayers] = useState([]);

  // Utility hook helper to automatically refresh layers array whenever canvas modifications execute
  useEffect(() => {
    if (!activeCanvas) {
      setCanvasLayers([]);
      return;
    }

    const refreshLayersList = () => {
      const objects = activeCanvas.getObjects ? activeCanvas.getObjects() : [];
      setCanvasLayers([...objects].reverse());
    };

    activeCanvas.on("object:added", refreshLayersList);
    activeCanvas.on("object:removed", refreshLayersList);
    activeCanvas.on("object:modified", refreshLayersList);
    activeCanvas.on("selection:created", refreshLayersList);
    activeCanvas.on("selection:updated", refreshLayersList);
    activeCanvas.on("selection:cleared", refreshLayersList);

    // Run a baseline load check
    refreshLayersList();

    return () => {
      activeCanvas.off("object:added", refreshLayersList);
      activeCanvas.off("object:removed", refreshLayersList);
      activeCanvas.off("object:modified", refreshLayersList);
      activeCanvas.off("selection:created", refreshLayersList);
      activeCanvas.off("selection:updated", refreshLayersList);
      activeCanvas.off("selection:cleared", refreshLayersList);
    };
  }, [activeCanvas]);

  // 🎛️ Dynamic Stack Ordering Layer Manipulators
  // Fabric v6: stacking methods moved from object → canvas
  const moveLayerUp = (fabricObject) => {
    if (!activeCanvas || !fabricObject) return;
    activeCanvas.bringObjectForward(fabricObject);
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
  };

  const moveLayerDown = (fabricObject) => {
    if (!activeCanvas || !fabricObject) return;
    activeCanvas.sendObjectBackwards(fabricObject);
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
  };

  const bringLayerToFront = (fabricObject) => {
    if (!activeCanvas || !fabricObject) return;
    activeCanvas.bringObjectToFront(fabricObject);
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
  };

  const sendLayerToBack = (fabricObject) => {
    if (!activeCanvas || !fabricObject) return;
    activeCanvas.sendObjectToBack(fabricObject);
    activeCanvas.renderAll();
    activeCanvas.fire("object:modified");
  };

  const deleteLayer = (fabricObject) => {
    if (!activeCanvas || !fabricObject) return;
    activeCanvas.remove(fabricObject);
    activeCanvas.discardActiveObject();
    activeCanvas.renderAll();
    setSelectedObject(null);
  };

  // Helper utility to safely clear configurations across all view frames
  const resetCanvases = () => {
    // Helper to safely clear a single canvas
    const safeClearCanvas = (canvas) => {
      if (!canvas) return;
      try {
        // Check if canvas is fully initialized with valid context
        if (canvas.getContext && typeof canvas.getContext === 'function') {
          const ctx = canvas.getContext();
          if (ctx) {
            canvas.clear?.();
          } else {
            console.warn("safeClearCanvas: Canvas context not available yet");
          }
        }
      } catch (error) {
        console.error("Error clearing canvas:", error);
      }
    };

    safeClearCanvas(frontCanvas);
    safeClearCanvas(backCanvas);
    safeClearCanvas(leftCanvas);
    safeClearCanvas(rightCanvas);
    safeClearCanvas(pocketCanvas);
    safeClearCanvas(hoodCanvas);

    setActiveCanvas(null);
    setSelectedObject(null);
    setCanvasLayers([]);
  };

  return (
    <CanvasContext.Provider 
      value={{ 
        frontCanvas, 
        setFrontCanvas, 
        backCanvas, 
        setBackCanvas,
        leftCanvas,
        setLeftCanvas,
        rightCanvas,
        setRightCanvas,
        pocketCanvas,
        setPocketCanvas,
        hoodCanvas,
        setHoodCanvas,
        activeCanvas,
        setActiveCanvas,
        selectedObject,
        setSelectedObject,
        canvasLayers,
        moveLayerUp,
        moveLayerDown,
        bringLayerToFront,
        sendLayerToBack,
        deleteLayer,
        resetCanvases
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

// Custom Hook for clean consumption
export const useCanvas = () => {
  const context = useContext(CanvasContext);
  
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  
  return context;
};