import { STORAGE_KEYS } from "./canvasStorageManager";
import * as fabric from "fabric";
import { withGuidesHidden } from "../components/CanvasEditor";
// canvasSyncManager.js
export const canvasSyncManager = {
  getCanvasTexture: (fabricCanvas) => {
    if (!fabricCanvas) return null;
    
    // Check if canvas is fully initialized (has internal ctx, DOM elements, etc.)
    if (!fabricCanvas.lowerCanvasEl || !fabricCanvas.contextTop || !fabricCanvas.getWidth() || !fabricCanvas.getHeight()) {
      console.warn("getCanvasTexture: Canvas not fully initialized yet");
      return null;
    }
    
    try {
      // Force a render before getting the texture, hide guides first
      return withGuidesHidden(fabricCanvas, () => {
        return fabricCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 1,
          enableRetinaScaling: true,
        });
      });
    } catch (error) {
      console.error("Error generating texture:", error);
      return null;
    }
  },

  getCanvasTextureFromStorage: (view) => {
    return new Promise((resolve, reject) => {
      try {
        const storageKey =
          view === "front"
            ? STORAGE_KEYS.FRONT_CANVAS
            : STORAGE_KEYS.BACK_CANVAS;

        const storedObjects = localStorage.getItem(storageKey);
        if (!storedObjects) {
          resolve(null);
          return;
        }

        // Parse the stored JSON objects
        const parsedObjects = JSON.parse(storedObjects);

        // Create a temporary canvas
        const tempCanvas = new fabric.Canvas(null, {
          width: 450, // Set appropriate width
          height: 500, // Set appropriate height
        });

        // Use fabric.util.enlivenObjects to recreate canvas objects
        fabric.util.enlivenObjects(parsedObjects)
          .then((objects) => {
            // Add recreated objects to the canvas
            objects.forEach((obj) => {
              tempCanvas.add(obj);
            });

            // Generate texture
            const dataURL = tempCanvas.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 1,
              enableRetinaScaling: true,
            });

            resolve(dataURL);
          })
          .catch((error) => {
            console.error("Error enlivening objects:", error);
            resolve(null);
          });
      } catch (error) {
        console.error("Error retrieving canvas texture from storage:", error);
        reject(error);
      }
    });
  },

  // utility function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};
