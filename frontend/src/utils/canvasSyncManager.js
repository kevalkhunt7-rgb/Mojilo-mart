import { STORAGE_KEYS } from "./canvasStorageManager";
import * as fabric from "fabric";
import { withGuidesHidden } from "../components/CanvasEditor";

// canvasSyncManager.js
export const canvasSyncManager = {
  getCanvasTexture: (fabricCanvas) => {
    if (!fabricCanvas) return null;

    // Check if canvas is fully initialized (has internal elements & context)
    // Note: Removed console.warn to prevent log spamming in render loops
    if (
      !fabricCanvas.lowerCanvasEl ||
      !fabricCanvas.getContext() ||
      !fabricCanvas.getWidth() ||
      !fabricCanvas.getHeight()
    ) {
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
    return new Promise(async (resolve, reject) => {
      let tempCanvas = null;
      try {
        const storageKey =
          view === "front"
            ? STORAGE_KEYS.FRONT_CANVAS
            : STORAGE_KEYS.BACK_CANVAS;

        const storedData = localStorage.getItem(storageKey);
        if (!storedData) {
          resolve(null);
          return;
        }

        // Parse the stored JSON
        const parsed = JSON.parse(storedData);

        // Extract objects array whether stored as raw array OR as canvas.toJSON() ({ objects: [...] })
        const objectsToEnliven = Array.isArray(parsed)
          ? parsed
          : parsed.objects || [];

        if (objectsToEnliven.length === 0) {
          resolve(null);
          return;
        }

        // Create temporary headless canvas
        tempCanvas = new fabric.Canvas(null, {
          width: 450,
          height: 500,
        });

        // Recreate Fabric objects
        const objects = await fabric.util.enlivenObjects(objectsToEnliven);

        // Add objects to the temporary canvas
        objects.forEach((obj) => {
          tempCanvas.add(obj);
        });

        // Render all objects before exporting
        tempCanvas.renderAll();

        // Generate texture
        const dataURL = tempCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 1,
          enableRetinaScaling: true,
        });

        // Clean up temporary canvas memory
        tempCanvas.dispose();

        resolve(dataURL);
      } catch (error) {
        console.error("Error retrieving canvas texture from storage:", error);
        if (tempCanvas && typeof tempCanvas.dispose === "function") {
          tempCanvas.dispose();
        }
        resolve(null);
      }
    });
  },

  // Utility function
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