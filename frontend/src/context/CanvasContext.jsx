import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Create the Context
const CanvasContext = createContext(null);

// Create the Provider Component
export const CanvasProvider = ({ children }) => {
  // 👕 Core Fabric Canvas instances managed in state
  const [frontCanvas, setFrontCanvas] = useState(null);
  const [backCanvas, setBackCanvas] = useState(null);
  const [leftCanvas, setLeftCanvas] = useState(null);
  const [rightCanvas, setRightCanvas] = useState(null);
  const [pocketCanvas, setPocketCanvas] = useState(null);
  const [hoodCanvas, setHoodCanvas] = useState(null);
  
  // Track active canvas both in React state and in a synchronous Ref
  const [activeCanvasState, setActiveCanvasState] = useState(null);
  const activeCanvasRef = useRef(null);

  // Map storing live Fabric canvas instances by view key
  const canvasMapRef = useRef({
    front: null,
    back: null,
    left: null,
    right: null,
    pocket: null,
    hood: null,
  });

  // Synchronous active canvas setter
  const setActiveCanvas = useCallback((canvasInstance) => {
    activeCanvasRef.current = canvasInstance;
    setActiveCanvasState(canvasInstance);
  }, []);

  // Immediate registration on canvas creation
  const registerCanvas = useCallback((view, canvasInstance, isSelected = false) => {
    if (!view || !canvasInstance) return;
    canvasMapRef.current[view] = canvasInstance;

    if (view === "front") setFrontCanvas(canvasInstance);
    if (view === "back") setBackCanvas(canvasInstance);
    if (view === "left") setLeftCanvas(canvasInstance);
    if (view === "right") setRightCanvas(canvasInstance);
    if (view === "pocket") setPocketCanvas(canvasInstance);
    if (view === "hood") setHoodCanvas(canvasInstance);

    // Activate immediately if this is the selected view or if no active canvas exists yet
    if (isSelected || !activeCanvasRef.current) {
      activeCanvasRef.current = canvasInstance;
      setActiveCanvasState(canvasInstance);
    }
  }, []);

  // Unregister on unmount / cleanup
  const unregisterCanvas = useCallback((view) => {
    if (!view) return;
    const instance = canvasMapRef.current[view];
    canvasMapRef.current[view] = null;

    if (view === "front") setFrontCanvas(null);
    if (view === "back") setBackCanvas(null);
    if (view === "left") setLeftCanvas(null);
    if (view === "right") setRightCanvas(null);
    if (view === "pocket") setPocketCanvas(null);
    if (view === "hood") setHoodCanvas(null);

    if (activeCanvasRef.current === instance) {
      activeCanvasRef.current = null;
      setActiveCanvasState(null);
    }
  }, []);

  // Synchronous fallback getter for tool panels
  const getActiveCanvas = useCallback(() => {
    return activeCanvasRef.current || activeCanvasState || canvasMapRef.current.front || canvasMapRef.current.back || canvasMapRef.current.left || canvasMapRef.current.right || canvasMapRef.current.pocket || canvasMapRef.current.hood || null;
  }, [activeCanvasState]);

  // Track currently clicked/highlighted object on the active workspace
  const [selectedObject, setSelectedObject] = useState(null);

  // 📑 Dynamic state array tracking layers list for the active view viewport
  const [canvasLayers, setCanvasLayers] = useState([]);

  // Resolve effective active canvas (state > ref > registered map)
  const effectiveActiveCanvas = activeCanvasState || activeCanvasRef.current || canvasMapRef.current.front || canvasMapRef.current.back || canvasMapRef.current.left || canvasMapRef.current.right || canvasMapRef.current.pocket || canvasMapRef.current.hood;

  // Automatically refresh layers array whenever canvas modifications execute
  useEffect(() => {
    const canvas = effectiveActiveCanvas;
    if (!canvas) {
      setCanvasLayers([]);
      return;
    }

    const refreshLayersList = () => {
      const objects = canvas.getObjects ? canvas.getObjects() : [];
      setCanvasLayers([...objects].reverse());
    };

    canvas.on("object:added", refreshLayersList);
    canvas.on("object:removed", refreshLayersList);
    canvas.on("object:modified", refreshLayersList);
    canvas.on("selection:created", refreshLayersList);
    canvas.on("selection:updated", refreshLayersList);
    canvas.on("selection:cleared", refreshLayersList);

    // Baseline load check
    refreshLayersList();

    return () => {
      canvas.off("object:added", refreshLayersList);
      canvas.off("object:removed", refreshLayersList);
      canvas.off("object:modified", refreshLayersList);
      canvas.off("selection:created", refreshLayersList);
      canvas.off("selection:updated", refreshLayersList);
      canvas.off("selection:cleared", refreshLayersList);
    };
  }, [effectiveActiveCanvas]);

  // 🎛️ Dynamic Stack Ordering Layer Manipulators
  const moveLayerUp = (fabricObject) => {
    const canvas = getActiveCanvas();
    if (!canvas || !fabricObject) return;
    canvas.bringObjectForward(fabricObject);
    canvas.renderAll();
    canvas.fire("object:modified");
  };

  const moveLayerDown = (fabricObject) => {
    const canvas = getActiveCanvas();
    if (!canvas || !fabricObject) return;
    canvas.sendObjectBackwards(fabricObject);
    canvas.renderAll();
    canvas.fire("object:modified");
  };

  const bringLayerToFront = (fabricObject) => {
    const canvas = getActiveCanvas();
    if (!canvas || !fabricObject) return;
    canvas.bringObjectToFront(fabricObject);
    canvas.renderAll();
    canvas.fire("object:modified");
  };

  const sendLayerToBack = (fabricObject) => {
    const canvas = getActiveCanvas();
    if (!canvas || !fabricObject) return;
    canvas.sendObjectToBack(fabricObject);
    canvas.renderAll();
    canvas.fire("object:modified");
  };

  const deleteLayer = (fabricObject) => {
    const canvas = getActiveCanvas();
    if (!canvas || !fabricObject) return;
    canvas.remove(fabricObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
  };

  // Helper utility to safely clear configurations across all view frames
  const resetCanvases = () => {
    const safeClearCanvas = (canvas) => {
      if (!canvas) return;
      try {
        if (canvas.getContext && typeof canvas.getContext === 'function') {
          const ctx = canvas.getContext();
          if (ctx) {
            canvas.clear?.();
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

    activeCanvasRef.current = null;
    canvasMapRef.current = { front: null, back: null, left: null, right: null, pocket: null, hood: null };
    setActiveCanvasState(null);
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
        activeCanvas: effectiveActiveCanvas,
        setActiveCanvas,
        registerCanvas,
        unregisterCanvas,
        getActiveCanvas,
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