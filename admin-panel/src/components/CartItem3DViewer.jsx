import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Bounds, Environment } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";

import { TshirtModel } from "./TshirtModel";
import { SportsJerseyModel } from "./SportsJerseyModel";
import { OversizedModel } from "./OversizedModel";
import { LongSleeveModel } from "./LongSleeveModel";
import { HoodieModel } from "./HoodieModel";

function resolveModelKey(item, customization) {
  const candidates = [
    customization?.productType,
    customization?.baseTemplateId,
    customization?.clothingType,
    item?.productType,
    item?.clothingType,
    item?.productName,
    item?.name,
    item?.variantDescription,
  ];

  for (const c of candidates) {
    if (!c || typeof c !== "string") continue;
    const str = c.toLowerCase().replace(/[-_]/g, " ");
    if (
      str.includes("half") ||
      str.includes("short") ||
      str.includes("tshirt") ||
      str.includes("t-shirt")
    )
      return "half_sleeve";
    if (str.includes("long")) return "long_sleeve";
    if (str.includes("oversiz")) return "oversized";
    if (str.includes("hood")) return "hoodie";
    if (str.includes("jersey") || str.includes("sport")) return "sports_jersey";
  }

  return "half_sleeve";
}

// Async helper: Loads image first, then draws it auto-scaled onto a 600x800 canvas
function renderLayerToPaddedCanvasAsync(
  imgSrc,
  layerObj = null,
  canvasWidth = 600,
  canvasHeight = 800
) {
  return new Promise((resolve) => {
    if (!imgSrc) return resolve(null);

    // If already a Data URL snapshot or full preview canvas string, return directly
    if (
      typeof imgSrc === "string" &&
      (imgSrc.startsWith("data:image/") || imgSrc.length > 500)
    ) {
      return resolve(imgSrc);
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Determine natural or configured size
        const rawW = layerObj?.width || layerObj?.w || img.naturalWidth || 200;
        const rawH = layerObj?.height || layerObj?.h || img.naturalHeight || 200;
        const scaleX = layerObj?.scaleX || 1;
        const scaleY = layerObj?.scaleY || 1;

        const layerW = rawW * scaleX;
        const layerH = rawH * scaleY;

        // Target area: Fill ~65% of texture canvas so it renders at a clear, visible size
        const targetW = canvasWidth * 0.65;
        const targetH = canvasHeight * 0.65;

        const fitScale = Math.min(targetW / layerW, targetH / layerH);

        const drawW = Math.max(layerW * fitScale, 250);
        const drawH = Math.max(layerH * fitScale, 250);

        // Center on texture canvas
        const x = (canvasWidth - drawW) / 2;
        const y = (canvasHeight - drawH) / 2;

        ctx.drawImage(img, x, y, drawW, drawH);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        resolve(imgSrc);
      }
    };

    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
}

function extractRawViewDecal(item, customizationData, possibleKeys) {
  if (!customizationData && !item) return null;

  const cust =
    customizationData?.customization || customizationData || item?.customization || {};
  const previews = cust.previews || item?.previews || {};
  const prodFiles = cust.productionFiles || {};

  // 1. Previews object
  for (const k of possibleKeys) {
    const cleanK = k.toLowerCase().replace(/[\s_-]/g, "");
    for (const [pk, val] of Object.entries(previews)) {
      if (!val) continue;
      const cleanPk = pk.toLowerCase().replace(/[\s_-]/g, "");
      if (cleanPk === cleanK || cleanPk.includes(cleanK) || cleanK.includes(cleanPk)) {
        return { src: val, layer: null, isPreview: true };
      }
    }
  }

  // 2. Production files
  for (const k of possibleKeys) {
    const cleanK = k.toLowerCase().replace(/[\s_-]/g, "");
    for (const [fk, val] of Object.entries(prodFiles)) {
      if (!val) continue;
      const cleanFk = fk.toLowerCase().replace(/[\s_-]/g, "");
      if (cleanFk === cleanK || cleanFk.includes(cleanK)) {
        return { src: val, layer: null, isPreview: true };
      }
    }
  }

  // 3. Layers array
  const layersList = Array.isArray(customizationData?.layers)
    ? customizationData.layers
    : Array.isArray(cust.layers)
    ? cust.layers
    : [];

  for (const k of possibleKeys) {
    const cleanK = k.toLowerCase().replace(/[\s_-]/g, "");
    for (const l of layersList) {
      const area = (l.printAreaName || l.areaName || "").toLowerCase().replace(/[\s_-]/g, "");
      if (area === cleanK || area.includes(cleanK)) {
        const img = l.imageConfig?.processedUrl || l.imageConfig?.originalUrl || l.src || l.url;
        if (img) return { src: img, layer: l, isPreview: false };
      }
    }
  }

  // 4. Editable JSON snapshot
  const rawDesign = cust.editableDesignJSON || item?.editableDesignJSON;
  if (rawDesign) {
    try {
      const design = typeof rawDesign === "string" ? JSON.parse(rawDesign) : rawDesign;
      if (typeof design === "object" && design !== null) {
        for (const k of possibleKeys) {
          const cleanK = k.toLowerCase().replace(/[\s_-]/g, "");
          for (const [dk, objs] of Object.entries(design)) {
            const cleanDk = dk.toLowerCase().replace(/[\s_-]/g, "");
            if (cleanDk === cleanK || cleanDk.includes(cleanK) || cleanK.includes(cleanDk)) {
              const list = Array.isArray(objs) ? objs : objs?.objects || [];
              for (const obj of list) {
                if (obj && (obj.src || obj.url)) {
                  return { src: obj.src || obj.url, layer: obj, isPreview: false };
                }
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  if (possibleKeys.includes("front")) {
    const fallback =
      cust?.decalUrl ||
      cust?.previewUrl ||
      item?.decalUrl ||
      item?.previewUrl ||
      item?.image ||
      null;
    return fallback ? { src: fallback, layer: null, isPreview: true } : null;
  }

  return null;
}

function ModelWrapper({ item, customization, processedTextures }) {
  const frontUrl = processedTextures.front;
  const backUrl = processedTextures.back;
  const leftUrl = processedTextures.left;
  const rightUrl = processedTextures.right;

  const custObj = customization?.customization || customization || item?.customization || {};
  const rawColor =
    custObj?.selectedColor ||
    custObj?.color ||
    item?.selectedColor ||
    item?.color ||
    "#FFFFFF";

  const color = typeof rawColor === "object" ? rawColor.hex || rawColor.code || "#FFFFFF" : rawColor;
  const modelKey = resolveModelKey(item, custObj);

  const modelProps = {
    tshirtColor: color,
    color: color,
    designTexture: frontUrl,
    decalUrl: frontUrl,
    designTextureBack: backUrl,
    designTextureLeft: leftUrl,
    designTextureRight: rightUrl,
  };

  return (
    <Center>
      {modelKey === "sports_jersey" && <SportsJerseyModel {...modelProps} />}
      {modelKey === "oversized" && <OversizedModel {...modelProps} />}
      {modelKey === "long_sleeve" && <LongSleeveModel {...modelProps} />}
      {modelKey === "hoodie" && <HoodieModel {...modelProps} />}
      {(modelKey === "half_sleeve" ||
        !["sports_jersey", "oversized", "long_sleeve", "hoodie"].includes(modelKey)) && (
        <TshirtModel {...modelProps} />
      )}
    </Center>
  );
}

export function CartItem3DViewer({ item }) {
  const [customizationData, setCustomizationData] = useState(
    typeof item?.customization === "object" ? item.customization : null
  );
  const [loading, setLoading] = useState(true);
  const [processedTextures, setProcessedTextures] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
  });

  // Fetch customization data if ID was provided
  useEffect(() => {
    const customizationId =
      typeof item?.customization === "string"
        ? item.customization
        : item?.customizationId || item?.customization?._id;

    if (customizationId && typeof item?.customization !== "object") {
      setLoading(true);
      axios
        .get(`/api/customizations/${customizationId}`, { withCredentials: true })
        .then((res) => {
          const data = res.data?.data;
          const custDoc = data?.customization || data || res.data;
          const layers = data?.layers || custDoc?.layers || [];
          setCustomizationData({
            ...custDoc,
            layers: layers,
            customization: custDoc,
          });
        })
        .catch((err) => {
          console.warn("Customization missing, using OrderItem snapshot:", err.message);
          setCustomizationData({
            color: item?.color || item?.selectedColor || "#FFFFFF",
            selectedColor: item?.color || item?.selectedColor || "#FFFFFF",
            decalUrl: item?.decalUrl || item?.previewUrl || item?.image || item?.imageUrl,
            previewUrl: item?.decalUrl || item?.previewUrl || item?.image || item?.imageUrl,
            previews: {
              front: item?.decalUrl || item?.previewUrl || item?.image || item?.imageUrl,
            },
          });
        });
    } else {
      setCustomizationData(item?.customization || null);
    }
  }, [item]);

  // Pre-render textures asynchronously once customizationData is ready
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function processAllTextures() {
      const rawFront = extractRawViewDecal(item, customizationData, ["front", "frontsleeve", "mockup", "decal"]);
      const rawBack = extractRawViewDecal(item, customizationData, ["back", "backsleeve"]);
      const rawLeft = extractRawViewDecal(item, customizationData, ["left", "leftsleeve", "left sleeve"]);
      const rawRight = extractRawViewDecal(item, customizationData, ["right", "rightsleeve", "right sleeve"]);

      const processDecal = (decalObj) => {
        if (!decalObj || !decalObj.src) return Promise.resolve(null);
        if (decalObj.isPreview || !decalObj.layer) {
          return Promise.resolve(decalObj.src);
        }
        return renderLayerToPaddedCanvasAsync(decalObj.src, decalObj.layer);
      };

      const [front, back, left, right] = await Promise.all([
        processDecal(rawFront),
        processDecal(rawBack),
        processDecal(rawLeft),
        processDecal(rawRight),
      ]);

      if (isMounted) {
        setProcessedTextures({ front, back, left, right });
        setLoading(false);
      }
    }

    processAllTextures();

    return () => {
      isMounted = false;
    };
  }, [item, customizationData]);

  if (!item) return null;

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-slate-900/10 dark:bg-slate-950 rounded-xl">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 text-xs text-white backdrop-blur-sm">
          Loading 3D Customization...
        </div>
      )}

      <Canvas
        camera={{ position: [0, -0.1, 12], fov: 38 }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        {/* Ambient base keeps overall fabric bright */}
        <ambientLight intensity={0.7} />
        <hemisphereLight
          skyColor={"#ffffff"}
          groundColor={"#e5e7eb"}
          intensity={0.6}
        />

        {/* Front-facing key and fill lights eliminate deep dark shadows on armpits & sides */}
        <directionalLight position={[0, 2, 5]} intensity={0.65} />
        <directionalLight position={[4, 4, 3]} intensity={0.4} />
        <directionalLight position={[-4, 2, 3]} intensity={0.4} />

        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.45} background={false} />
        </Suspense>

        <Suspense fallback={null}>
          <ModelWrapper
            item={item}
            customization={customizationData}
            processedTextures={processedTextures}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}

export default CartItem3DViewer;