import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";

import { TshirtModel } from "./TshirtModel";
import { SportsJerseyModel } from "./SportsJerseyModel";
import { OversizedModel } from "./OversizedModel";
import { LongSleeveModel } from "./LongSleeveModel";
import { HoodieModel } from "./HoodieModel";

// Helper to resolve 3D GLB model key
function resolveModelKey(item, customization) {
    const candidates = [
        customization?.productType,
        customization?.baseTemplateId,
        customization?.clothingType,
        item?.productType,
        item?.clothingType,
        item?.productName,
        item?.name,
    ];

    for (const c of candidates) {
        if (!c || typeof c !== 'string') continue;
        const str = c.toLowerCase().replace(/[-_]/g, ' ');
        if (str.includes('half') || str.includes('short') || str.includes('tshirt') || str.includes('t-shirt')) return 'half_sleeve';
        if (str.includes('long')) return 'long_sleeve';
        if (str.includes('oversiz')) return 'oversized';
        if (str.includes('hood')) return 'hoodie';
        if (str.includes('jersey') || str.includes('sport')) return 'sports_jersey';
    }

    return 'half_sleeve';
}

// Helper to render a standalone layer object onto a padded 600x800 canvas
function renderLayerToPaddedCanvas(imgSrc, layerObj, canvasWidth = 600, canvasHeight = 800) {
    if (!imgSrc) return null;
    
    // If imgSrc is already a Data URL snapshot (e.g. from canvas preview), return as-is
    if (typeof imgSrc === 'string' && (imgSrc.startsWith('data:image/') || imgSrc.length > 500)) {
        return imgSrc;
    }

    try {
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imgSrc;

        const x = layerObj?.x ?? layerObj?.left ?? (canvasWidth - 200) / 2;
        const y = layerObj?.y ?? layerObj?.top ?? (canvasHeight - 200) / 2;
        const w = (layerObj?.width || 200) * (layerObj?.scaleX || 1);
        const h = (layerObj?.height || 200) * (layerObj?.scaleY || 1);

        ctx.drawImage(img, x, y, w, h);
        return canvas.toDataURL('image/png');
    } catch (e) {
        return imgSrc;
    }
}

// Helper to extract texture for any view from customization/item data
function extractViewDecal(item, customizationData, possibleKeys) {
    if (!customizationData && !item) return null;

    const cust = customizationData?.customization || customizationData || item?.customization || {};
    const previews = cust.previews || item?.previews || {};
    const prodFiles = cust.productionFiles || {};

    // 1. Search in previews object
    for (const k of possibleKeys) {
        const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
        for (const [pk, val] of Object.entries(previews)) {
            if (!val) continue;
            const cleanPk = pk.toLowerCase().replace(/[\s_-]/g, '');
            if (cleanPk === cleanK || cleanPk.includes(cleanK) || cleanK.includes(cleanPk)) {
                return val;
            }
        }
    }

    // 2. Search in productionFiles object
    for (const k of possibleKeys) {
        const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
        for (const [fk, val] of Object.entries(prodFiles)) {
            if (!val) continue;
            const cleanFk = fk.toLowerCase().replace(/[\s_-]/g, '');
            if (cleanFk === cleanK || cleanFk.includes(cleanK)) {
                return val;
            }
        }
    }

    // 3. Fallback: Search in layers array
    const layersList = Array.isArray(customizationData?.layers)
        ? customizationData.layers
        : (Array.isArray(cust.layers) ? cust.layers : []);

    for (const k of possibleKeys) {
        const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
        for (const l of layersList) {
            const area = (l.printAreaName || l.areaName || '').toLowerCase().replace(/[\s_-]/g, '');
            if (area === cleanK || area.includes(cleanK)) {
                const img = l.imageConfig?.processedUrl || l.imageConfig?.originalUrl || l.src || l.url;
                if (img) {
                    const isSleeve = possibleKeys.some(key => key.includes("left") || key.includes("right"));
                    return isSleeve ? renderLayerToPaddedCanvas(img, l, 600, 800) : img;
                }
            }
        }
    }

    // 4. Fallback: Search in editableDesignJSON snapshot
    const rawDesign = cust.editableDesignJSON || item?.editableDesignJSON;
    if (rawDesign) {
        try {
            const design = typeof rawDesign === 'string' ? JSON.parse(rawDesign) : rawDesign;
            if (typeof design === 'object' && design !== null) {
                for (const k of possibleKeys) {
                    const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
                    for (const [dk, objs] of Object.entries(design)) {
                        const cleanDk = dk.toLowerCase().replace(/[\s_-]/g, '');
                        if (cleanDk === cleanK || cleanDk.includes(cleanK) || cleanK.includes(cleanDk)) {
                            const list = Array.isArray(objs) ? objs : (objs?.objects || []);
                            for (const obj of list) {
                                if (obj && (obj.src || obj.url)) {
                                    const img = obj.src || obj.url;
                                    const isSleeve = possibleKeys.some(key => key.includes("left") || key.includes("right"));
                                    return isSleeve ? renderLayerToPaddedCanvas(img, obj, 600, 800) : img;
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {}
    }

    // Fallback for front decal
    if (possibleKeys.includes("front")) {
        return cust?.decalUrl || cust?.previewUrl || item?.decalUrl || item?.previewUrl || item?.image || null;
    }

    return null;
}

function ModelWrapper({ item, customization }) {
    const frontUrl = extractViewDecal(item, customization, ["front", "frontsleeve", "mockup", "decal"]);
    const backUrl  = extractViewDecal(item, customization, ["back", "backsleeve"]);
    const leftUrl  = extractViewDecal(item, customization, ["left", "leftsleeve", "left sleeve"]);
    const rightUrl = extractViewDecal(item, customization, ["right", "rightsleeve", "right sleeve"]);

    const custObj = customization?.customization || customization || item?.customization || {};
    const rawColor =
        custObj?.selectedColor ||
        custObj?.color ||
        item?.selectedColor ||
        item?.color ||
        "#FFFFFF";

    const color = typeof rawColor === 'object' ? (rawColor.hex || rawColor.code || "#FFFFFF") : rawColor;
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
            {modelKey === 'sports_jersey' && <SportsJerseyModel {...modelProps} />}
            {modelKey === 'oversized' && <OversizedModel {...modelProps} />}
            {modelKey === 'long_sleeve' && <LongSleeveModel {...modelProps} />}
            {modelKey === 'hoodie' && <HoodieModel {...modelProps} />}
            {(modelKey === 'half_sleeve' || !['sports_jersey', 'oversized', 'long_sleeve', 'hoodie'].includes(modelKey)) && (
                <TshirtModel {...modelProps} />
            )}
        </Center>
    );
}

export function CartItem3DViewer({ item }) {
    const [customizationData, setCustomizationData] = useState(
        typeof item?.customization === 'object' ? item.customization : null
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const customizationId =
            typeof item?.customization === 'string' ? item.customization :
                (item?.customizationId || item?.customization?._id);

        if (customizationId && typeof item?.customization !== 'object') {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            axios.get(`/api/customizations/${customizationId}`, { headers })
                .then(res => {
                    const data = res.data?.data;
                    const custDoc = data?.customization || data || res.data;
                    const layers = data?.layers || custDoc?.layers || [];
                    setCustomizationData({
                        ...custDoc,
                        layers: layers,
                        customization: custDoc
                    });
                })
                .catch((err) => {
                    console.warn("Customization document missing or 404. Falling back to OrderItem snapshot:", err.message);
                    setCustomizationData({
                        color: item?.color || item?.selectedColor || "#FFFFFF",
                        selectedColor: item?.color || item?.selectedColor || "#FFFFFF",
                        decalUrl: item?.decalUrl || item?.previewUrl || item?.image || item?.imageUrl,
                        previewUrl: item?.decalUrl || item?.previewUrl || item?.image || item?.imageUrl,
                        previews: {
                            front: item?.decalUrl || item?.previewUrl || item?.image || item?.imageUrl
                        }
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setCustomizationData(item?.customization || null);
        }
    }, [item]);

// Modern Timer replacement for deprecated THREE.Clock (Three.js r183+)
class CartCanvasTimer {
  constructor() {
    if (THREE.Timer) {
      this.timer = new THREE.Timer();
    } else {
      this.timer = null;
      this._start = performance.now();
      this._last = performance.now();
    }
    this.running = true;
    this.autoStart = true;
  }
  start() {
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  getElapsedTime() {
    if (this.timer) {
      this.timer.update();
      return this.timer.getElapsed();
    }
    return (performance.now() - this._start) / 1000;
  }
  getDelta() {
    if (this.timer) {
      this.timer.update();
      return this.timer.getDelta();
    }
    const now = performance.now();
    const diff = (now - this._last) / 1000;
    this._last = now;
    return diff;
  }
}

const cartCanvasTimer = new CartCanvasTimer();

    return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 text-xs text-white backdrop-blur-sm">
                    Loading 3D Customization...
                </div>
            )}

            <Canvas
                clock={cartCanvasTimer}
                camera={{ position: [0, -0.1, 12], fov: 38 }}
                gl={{
                    antialias: true,
                    preserveDrawingBuffer: true,
                    // Switched to ACESFilmicToneMapping to compress bright white highlights naturally
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 0.85,
                    outputColorSpace: THREE.SRGBColorSpace,
                }}
            >
                {/* Moderated light intensities to eliminate white clipping/glare */}
                <ambientLight intensity={0.35} />
                <hemisphereLight
                    skyColor={"#ffffff"}
                    groundColor={"#bbbbbb"}
                    intensity={0.25}
                />
                <directionalLight position={[5, 5, 5]} intensity={0.75} />
                <directionalLight position={[-5, 3, -5]} intensity={0.4} />
                <directionalLight position={[0, -4, 4]} intensity={0.25} />

                <Suspense fallback={null}>
                    <Environment preset="studio" environmentIntensity={0.5} background={false} />
                </Suspense>

                <Suspense fallback={null}>
                    <ModelWrapper item={item} customization={customizationData} />
                </Suspense>

                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    autoRotate
                    autoRotateSpeed={2}
                />
            </Canvas>
        </div>
    );
}

export default CartItem3DViewer;