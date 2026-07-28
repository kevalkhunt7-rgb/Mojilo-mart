import React, { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { RotateCw, ZoomIn, ZoomOut, Move } from "lucide-react";
import { useCustomizerStore } from "../store/useCustomizerStore";

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

      {/* Main R3F Canvas Viewport Container */}
      <div className="flex-1 w-full h-full relative min-h-[380px]">
        <Canvas
          camera={{
            position: [0, 0, 16],
            fov: 42,
          }}
          gl={{ preserveDrawingBuffer: true }}
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
              />
            </group>

            <Environment preset="sunset" />
            <CameraController view={selectedView} />
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
