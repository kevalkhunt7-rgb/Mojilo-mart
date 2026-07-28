import { useCallback, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { CANVAS_CONFIG } from "../constants/designConstants";
import { useDispatch, useSelector } from "react-redux";

// Unified context imports
import { useCanvas } from "../context/CanvasContext";
import canvasStorageManager from "../utils/canvasStorageManager";
import { canvasSyncManager } from "../utils/canvasSyncManager";

export const useTshirtCanvas = ({ svgPath, inlineXml, view, onDesignUpdate }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const tshirtColor = useSelector((state) => state.tshirt.tshirtColor);
  const selectedView = useSelector((state) => state.tshirt.selectedView);
  const dispatch = useDispatch();

  const { setActiveCanvas, setSelectedObject, setFrontCanvas, setBackCanvas } = useCanvas();

  // Function to save canvas objects
  const saveCanvas = () => {
    if (fabricCanvasRef.current) {
      canvasStorageManager.saveCanvasObjects(view, fabricCanvasRef.current);
    }
  };

  // 🟢 FIXED: High-frequency refresh handler ensuring data URLs pipe smoothly 
  const notifyDesignChange = useCallback(() => {
    if (fabricCanvasRef.current && onDesignUpdate) {
      // Extract high-quality base64 png payload from fabric
      const textureDataUrl = canvasSyncManager.getCanvasTexture(fabricCanvasRef.current);
      onDesignUpdate(textureDataUrl);
    }
  }, [onDesignUpdate]);

  // Initialize Fabric.js Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      ...CANVAS_CONFIG,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    if (view === "front") setFrontCanvas(canvas);
    if (view === "back") setBackCanvas(canvas);

    if (selectedView === view) {
      setActiveCanvas(canvas);
    }

    window.addEventListener("beforeunload", saveCanvas);

    // Load saved objects
    const savedObjects = canvasStorageManager.loadCanvasObjects(view);
    if (savedObjects) {
      savedObjects.forEach((obj) => addFabricObject(canvas, obj));
      canvas.renderAll();
      // Fire initial sync event once data mounts from cache
      setTimeout(notifyDesignChange, 100);
    }

    // Handle Object Selection
    canvas.on("selection:created", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:updated", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:cleared", () => setSelectedObject(null));

    // 🟢 FIXED: Added modern transformation tracking event hooks
    canvas.on("object:modified", notifyDesignChange);
    canvas.on("object:added", notifyDesignChange);
    canvas.on("object:removed", notifyDesignChange);
    canvas.on("object:scaling", notifyDesignChange); // Fires while dragging size nodes
    canvas.on("object:moving", notifyDesignChange);  // Fires while moving coordinates
    canvas.on("object:rotating", notifyDesignChange); // Fires while rotating
    // NOTE: 'after:render' intentionally excluded — causes infinite loop via renderAll()

    return () => {
      saveCanvas();
      window.removeEventListener("beforeunload", saveCanvas);
      
      canvas.off("object:modified", notifyDesignChange);
      canvas.off("object:added", notifyDesignChange);
      canvas.off("object:removed", notifyDesignChange);
      canvas.off("object:scaling", notifyDesignChange);
      canvas.off("object:moving", notifyDesignChange);
      canvas.off("object:rotating", notifyDesignChange);
      
      canvas.dispose();
      fabricCanvasRef.current = null;
      if (selectedView === view) {
        setActiveCanvas(null);
      }
      setSelectedObject(null);
    };
  }, [view, notifyDesignChange]); // Added stable callback references to lock dependency trees

  // Switch Active Canvas When View Changes
  useEffect(() => {
    if (selectedView === view && fabricCanvasRef.current) {
      setActiveCanvas(fabricCanvasRef.current);
    }
  }, [selectedView, view, setActiveCanvas]);

  // Load ClipPath from dynamic string vector sequences
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const applyClipPath = (fabricGroupOrPath) => {
      const scaleX = CANVAS_CONFIG.width / fabricGroupOrPath.width;
      const scaleY = CANVAS_CONFIG.height / fabricGroupOrPath.height;
      const fitScale = Math.min(scaleX, scaleY);
      
      fabricGroupOrPath.set({
        scaleX: fitScale,
        scaleY: fitScale,
        left: CANVAS_CONFIG.width / 2,
        top: CANVAS_CONFIG.height / 2,
        originX: "center",
        originY: "center",
        absolutePositioned: true,
      });
      canvas.clipPath = fabricGroupOrPath;
      canvas.renderAll();
      notifyDesignChange(); // Sync canvas boundaries once clip masks load
    };

    if (inlineXml) {
      fabric.loadSVGFromString(inlineXml, (objects, options) => {
        if (objects && objects.length > 0) {
          const objGroup = fabric.util.groupSVGElements(objects, options);
          applyClipPath(objGroup);
        }
      });
    } 
    else if (svgPath && svgPath.trim().startsWith("M")) {
      const clipPath = new fabric.Path(svgPath);
      applyClipPath(clipPath);
    }
  }, [svgPath, inlineXml, notifyDesignChange]);

  return { canvasRef, fabricCanvasRef, tshirtColor };
};

// Helper function to add objects to canvas
const addFabricObject = (canvas, objectData) => {
  switch (objectData.type) {
    case "Line":
      canvas.add(
        new fabric.Line(
          [objectData.x1, objectData.y1, objectData.x2, objectData.y2],
          {
            left: objectData.left || 0,
            top: objectData.top || 0,
            stroke: objectData.stroke || "black",
            strokeWidth: objectData.strokeWidth || 2,
            strokeLineCap: objectData.strokeLineCap || "round",
            strokeLineJoin: objectData.strokeLineJoin || "miter",
            opacity: objectData.opacity || 1,
            angle: objectData.angle || 0,
            scaleX: objectData.scaleX || 1,
            scaleY: objectData.scaleY || 1,
          }
        )
      );
      break;
    case "Textbox":
      const textbox = new fabric.Textbox(objectData.text, {
        left: objectData.left,
        top: objectData.top,
        width: objectData.width,
        fontSize: objectData.fontSize,
        fontFamily: objectData.fontFamily,
        textAlign: objectData.textAlign,
        fill: objectData.fill,
        scaleX: objectData.scaleX,
        scaleY: objectData.scaleY,
        angle: objectData.angle,
        opacity: objectData.opacity,
      });

      textbox.initDimensions();
      textbox.set({ width: textbox.width, height: textbox.height });
      canvas.add(textbox);
      canvas.renderAll();
      break;
    case "Image":
      if (!objectData.src || !objectData.src.startsWith("data:image")) return;
      const imgElement = new Image();
      imgElement.src = objectData.src;
      imgElement.onload = () => {
        const fabricImg = new fabric.Image(imgElement, {
          left: objectData.left || 0,
          top: objectData.top || 0,
          scaleX: objectData.scaleX || 1,
          scaleY: objectData.scaleY || 1,
          angle: objectData.angle || 0,
          opacity: objectData.opacity || 1,
        });
        canvas.add(fabricImg);
        canvas.renderAll();
      };
      break;
  }
};