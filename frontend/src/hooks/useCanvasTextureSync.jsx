import { canvasSyncManager } from "../utils/canvasSyncManager";
import { useCallback, useEffect, useState } from "react";

export const useCanvasTextureSync = (options = {}) => {
  const { 
    frontCanvas, 
    backCanvas, 
    leftCanvas, 
    rightCanvas, 
    pocketCanvas, 
    hoodCanvas,
    selectedView = "front" 
  } = options;

  const [designTextureFront, setDesignTextureFront] = useState(null);
  const [designTextureBack, setDesignTextureBack] = useState(null);
  const [designTextureLeft, setDesignTextureLeft] = useState(null);
  const [designTextureRight, setDesignTextureRight] = useState(null);
  const [designTexturePocket, setDesignTexturePocket] = useState(null);
  const [designTextureHood, setDesignTextureHood] = useState(null);

  useEffect(() => {
    const canvasMap = {
      front: { canvas: frontCanvas, setter: setDesignTextureFront },
      back: { canvas: backCanvas, setter: setDesignTextureBack },
      left: { canvas: leftCanvas, setter: setDesignTextureLeft },
      right: { canvas: rightCanvas, setter: setDesignTextureRight },
      pocket: { canvas: pocketCanvas, setter: setDesignTexturePocket },
      hood: { canvas: hoodCanvas, setter: setDesignTextureHood },
    };

    const criticalEvents = [
      "object:modified",
      "object:added",
      "object:removed",
      "object:scaling",
      "object:moving",
      "object:rotating",
    ];

    const updateTexture = async (view) => {
      const mapItem = canvasMap[view];
      if (!mapItem) return;
      const { canvas, setter } = mapItem;
      if (!canvas) return;

      try {
        const hasActiveObjects = canvas.getObjects().length > 0;

        if (!hasActiveObjects) {
          setter(null);
          return;
        }

        const texture = canvasSyncManager.getCanvasTexture(canvas);

        if (texture) {
          setter((prevTexture) =>
            prevTexture !== texture ? texture : prevTexture
          );
        }
      } catch (error) {
        console.error(`${view} canvas texture update failed:`, error);
      }
    };

    const debouncedUpdateFront = canvasSyncManager.debounce(() => updateTexture("front"), 100);
    const debouncedUpdateBack = canvasSyncManager.debounce(() => updateTexture("back"), 100);
    const debouncedUpdateLeft = canvasSyncManager.debounce(() => updateTexture("left"), 100);
    const debouncedUpdateRight = canvasSyncManager.debounce(() => updateTexture("right"), 100);
    const debouncedUpdatePocket = canvasSyncManager.debounce(() => updateTexture("pocket"), 100);
    const debouncedUpdateHood = canvasSyncManager.debounce(() => updateTexture("hood"), 100);

    const eventBinds = [
      { canvas: frontCanvas, handler: debouncedUpdateFront },
      { canvas: backCanvas, handler: debouncedUpdateBack },
      { canvas: leftCanvas, handler: debouncedUpdateLeft },
      { canvas: rightCanvas, handler: debouncedUpdateRight },
      { canvas: pocketCanvas, handler: debouncedUpdatePocket },
      { canvas: hoodCanvas, handler: debouncedUpdateHood },
    ];

    // Bind reactive canvas structural listeners
    eventBinds.forEach(({ canvas, handler }) => {
      if (canvas) {
        criticalEvents.forEach((event) => {
          canvas.on(event, handler);
        });
      }
    });

    // Wrapped initial updates in a minor timeout buffer
    const initialTimeout = setTimeout(() => {
      Object.entries(canvasMap).forEach(([view, { canvas }]) => {
        if (canvas) {
          updateTexture(view);
        }
      });
    }, 150);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      eventBinds.forEach(({ canvas, handler }) => {
        if (canvas) {
          criticalEvents.forEach((event) => {
            canvas.off(event, handler);
          });
        }
      });
    };
  }, [frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas, selectedView]);

  const manualTriggerSync = useCallback(
    async (view = "front") => {
      const canvasMap = {
        front: { canvas: frontCanvas, setter: setDesignTextureFront },
        back: { canvas: backCanvas, setter: setDesignTextureBack },
        left: { canvas: leftCanvas, setter: setDesignTextureLeft },
        right: { canvas: rightCanvas, setter: setDesignTextureRight },
        pocket: { canvas: pocketCanvas, setter: setDesignTexturePocket },
        hood: { canvas: hoodCanvas, setter: setDesignTextureHood },
      };

      const mapItem = canvasMap[view];
      if (!mapItem) return;
      const { canvas, setter } = mapItem;

      if (!canvas) {
        return;
      }

      try {
        const texture = canvasSyncManager.getCanvasTexture(canvas);

        if (texture) {
          setter(texture);
        }
      } catch (error) {
        console.error(`Manual ${view} canvas texture update failed:`, error);
      }
    },
    [frontCanvas, backCanvas, leftCanvas, rightCanvas, pocketCanvas, hoodCanvas]
  );

  return {
    designTextureFront,
    designTextureBack,
    designTextureLeft,
    designTextureRight,
    designTexturePocket,
    designTextureHood,
    manualTriggerSync,
  };
};