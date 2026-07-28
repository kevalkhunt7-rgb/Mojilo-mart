import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useProgress } from "@react-three/drei";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { useCustomizerStore } from "../store/useCustomizerStore";

// ──────────────────────────────────────────────────────────────
// Animated loading overlay shown while the GLB file is downloading
// ──────────────────────────────────────────────────────────────
function ModelLoadingOverlay() {
  const { progress } = useProgress();
  const pct = Math.round(progress);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/95 to-slate-100/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm pointer-events-none">
      {/* Shimmer sweep */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(139,92,246,0.2) 50%, transparent 60%)",
            animation: "shimmerSweep 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Icon + spinning ring */}
      <div className="relative flex items-center justify-center mb-5">
        <div
          className="absolute rounded-full border-2 border-violet-400/20"
          style={{ width: 96, height: 96, animation: "pingRingL 2.4s ease-out infinite" }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 68,
            height: 68,
            border: "3px solid transparent",
            borderTopColor: "#997241",
            borderRightColor: "#997241",
            animation: "spinArcL 1.1s linear infinite",
          }}
        />
        <div
          className="w-12 h-12 rounded-xl bg-[#997241] flex items-center justify-center shadow-lg shadow-violet-500/30"
          style={{ animation: "floatBoxL 3s ease-in-out infinite" }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 tracking-wide">
        Loading 3D Model
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-4">
        {pct > 0 ? `${pct}% — Hang tight…` : "Preparing garment…"}
      </p>

      {/* Progress bar */}
      <div className="w-40 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#997241] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Bounce dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#997241]"
            style={{ animation: `bounceDotL 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shimmerSweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes pingRingL { 0% { transform: scale(0.8); opacity: 0.7; } 80%,100% { transform: scale(1.25); opacity: 0; } }
        @keyframes spinArcL  { to { transform: rotate(360deg); } }
        @keyframes floatBoxL { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
        @keyframes bounceDotL { 0%,80%,100% { transform: scale(0.7); opacity: 0.4; } 40% { transform: scale(1.3); opacity: 1; } }
      `}</style>
    </div>
  );
}

// Camera rig to automatically position the camera depending on the active view
function CameraController({ view }) {
  const { camera } = useThree();
  
  useEffect(() => {
    let animId;
    const targetPos = new THREE.Vector3(0, 0, 16);

    switch (view) {
      case "front":
        targetPos.set(0, 20, 160);
        break;
      case "back":
        targetPos.set(0, 30, -160);
        break;
      case "left":
        targetPos.set(-16, 0, 0);
        break;
      case "right":
        targetPos.set(16, 0, 0);
        break;
      case "hood":
        targetPos.set(0, 4, 12);
        break;
      case "pocket":
        targetPos.set(0, -3, 12);
        break;
      default:
        targetPos.set(0, 0, 16);
    }

    // Smooth transition
    let progress = 0;
    const animateCamera = () => {
      progress += 0.08;
      camera.position.lerp(targetPos, 0.1);
      camera.lookAt(0, 0, 0);
      
      if (progress < 1) {
        animId = requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
    
    return () => cancelAnimationFrame(animId);
  }, [view, camera]);

  return null;
}

import * as THREE from "three";

import { apparelConfig } from "../utils/apparelConfig";

export default function ThreeDViewer({
  modelComponent: ModelComponent,
  tshirtColor,
  designTexture,
  designTextureBack,
  designTextureLeft,
  designTextureRight,
  designTexturePocket,
  designTextureHood,
  onViewChange,
  dpr,
}) {
  const currentProduct = useCustomizerStore((state) => state.currentProduct);
  const selectedView = useCustomizerStore((state) => state.selectedView);
  const setSelectedView = useCustomizerStore((state) => state.setSelectedView);
  
  const productConfig = apparelConfig[currentProduct] || apparelConfig["sports-jersey"];
  const supportedViews = productConfig?.supportedViews || ["front", "back"];
  
  // Custom states for Jersey
  const jerseyPlayerName = useCustomizerStore((state) => state.jerseyPlayerName);
  const jerseyPlayerNumber = useCustomizerStore((state) => state.jerseyPlayerNumber);
  const jerseySponsorLogo = useCustomizerStore((state) => state.jerseySponsorLogo);

  // Track whether the model has finished loading so we can hide the overlay
  const [modelReady, setModelReady] = useState(false);

  const controlsRef = React.useRef();

  const handleZoom = (amount) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    camera.position.multiplyScalar(amount);
    controlsRef.current.update();
  };

  const resetCamera = () => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
    setSelectedView("front");
  };

  return (
    <div className="w-full h-full relative flex flex-col justify-between overflow-hidden bg-slate-50">
      
      {/* 3D preset viewport camera coordinates triggers */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 p-1 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/50 shadow-sm">
        {supportedViews.map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedView === view
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Loading overlay — shown until the GLB model finishes loading */}
      {!modelReady && <ModelLoadingOverlay />}

      {/* Main R3F Canvas Viewport Container */}
      <div className="flex-1 w-full h-full relative min-h-[380px]">
        <Canvas
          camera={{
            position: [0, 0, 16],
            fov: 42,
          }}
          gl={{ preserveDrawingBuffer: true }}
          dpr={dpr}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
          <directionalLight position={[-10, 10, -10]} intensity={0.4} />

          <Suspense fallback={null}>
            <group position={[0, -0.6, 0]}>
              <ModelComponent
                tshirtColor={tshirtColor}
                designTexture={designTexture}
                designTextureBack={designTextureBack}
                designTextureLeft={designTextureLeft}
                designTextureRight={designTextureRight}
                designTexturePocket={designTexturePocket}
                designTextureHood={designTextureHood}
                playerName={jerseyPlayerName}
                playerNumber={jerseyPlayerNumber}
                sponsorLogo={jerseySponsorLogo}
                onViewChange={onViewChange}
                onLoad={() => setModelReady(true)}
              />
            </group>

            <Environment preset="sunset" />
            <CameraController view={selectedView} />
            {/* Signal that the Suspense boundary resolved = model is ready */}
            <ModelReadySignal onReady={() => setModelReady(true)} />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={8}
            maxDistance={25}
            enablePan={true}
          />
        </Canvas>
      </div>

      {/* Navigation overlay controls HUD */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => handleZoom(0.9)}
          title="Zoom In"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur border border-slate-200 hover:bg-slate-50 hover:text-violet-600 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ZoomIn className="h-4.5 w-4.5 text-slate-600" />
        </button>
        <button
          onClick={() => handleZoom(1.1)}
          title="Zoom Out"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur border border-slate-200 hover:bg-slate-50 hover:text-violet-600 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ZoomOut className="h-4.5 w-4.5 text-slate-600" />
        </button>
        <button
          onClick={resetCamera}
          title="Reset Camera View"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur border border-slate-200 hover:bg-slate-50 hover:text-violet-600 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <RotateCw className="h-4.5 w-4.5 text-slate-600" />
        </button>
      </div>
      
    </div>
  );
}

// Tiny R3F component that fires onReady once it renders inside the Suspense boundary
// (i.e., after the GLB has resolved) — outside the Suspense boundary would fire immediately
function ModelReadySignal({ onReady }) {
  useEffect(() => {
    onReady();
  }, []);
  return null;
}
