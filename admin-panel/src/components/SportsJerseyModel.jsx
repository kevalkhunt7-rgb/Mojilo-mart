import { Center, Decal, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function SportsJerseyModel({
  tshirtColor = "#ffffff",
  designTexture,
  designTextureBack,
  designTextureLeft,
  designTextureRight,
  playerName = "",
  playerNumber = "",
  sponsorLogo = null,
  decalX = 0,
  decalY = 0.05,
  scaleX = 0.25,
  scaleY = 0.15,
  onViewChange,
}) {
  const { nodes, materials } = useGLTF("/3Dmodels/sports-jerasey.glb");

  const [frontTexture, setFrontTexture] = useState(null);
  const [backTexture, setBackTexture] = useState(null);
  const [leftTexture, setLeftTexture] = useState(null);
  const [rightTexture, setRightTexture] = useState(null);
  const [jerseyTextTexture, setJerseyTextTexture] = useState(null);
  const [sponsorTexture, setSponsorTexture] = useState(null);

  const meshRef = useRef();

  const loadTexture = (src, setter) => {
    if (src) {
      const loader = new THREE.TextureLoader();
      loader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        setter(tex);
      });
    } else {
      setter(null);
    }
  };

  useEffect(() => { loadTexture(designTexture, setFrontTexture); }, [designTexture]);
  useEffect(() => { loadTexture(designTextureBack, setBackTexture); }, [designTextureBack]);
  useEffect(() => { loadTexture(designTextureLeft, setLeftTexture); }, [designTextureLeft]);
  useEffect(() => { loadTexture(designTextureRight, setRightTexture); }, [designTextureRight]);
  useEffect(() => { loadTexture(sponsorLogo, setSponsorTexture); }, [sponsorLogo]);

  useEffect(() => {
    if (!playerName && !playerNumber) {
      setJerseyTextTexture(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 512, 512);

    if (playerName) {
      ctx.font = "bold 52px Impact, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 10;
      ctx.textAlign = "center";
      ctx.strokeText(playerName.toUpperCase(), 256, 120);
      ctx.fillText(playerName.toUpperCase(), 256, 120);
    }

    if (playerNumber) {
      ctx.font = "bold 220px Impact, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 18;
      ctx.textAlign = "center";
      ctx.strokeText(playerNumber, 256, 340);
      ctx.fillText(playerNumber, 256, 340);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    setJerseyTextTexture(texture);

    return () => texture.dispose();
  }, [playerName, playerNumber]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.color.set(tshirtColor);
    }
  }, [tshirtColor]);

  const handleClick = (view) => onViewChange?.(view);

  return (
    <Center disableResize>
      <group scale={6} rotation={[0, 0, 0]}>
        <mesh
          ref={meshRef}
          castShadow
          receiveShadow
          geometry={nodes.mesh_0.geometry}
          material={materials.Shirt || nodes.mesh_0.material}
        >
          {frontTexture && (
            <Decal
              position={[0 , 0.05, 0.25]}
              rotation={[0, 0, 0]}
              scale={[1.5, 1.8, 0.6]}
              onClick={() => handleClick("front")}
            >
              <meshStandardMaterial
                map={frontTexture}
                transparent
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </Decal>
          )}

          {sponsorTexture && (
            <Decal
              position={[decalX, decalY, 0.19]}
              rotation={[0, 0, 0]}
              scale={[scaleX, scaleY, 0.2]}
            >
              <meshStandardMaterial
                map={sponsorTexture}
                transparent
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-2}
              />
            </Decal>
          )}

          {backTexture && (
            <Decal
              position={[0, 0.05, -0.18]}
              rotation={[0, Math.PI, 0]}
              scale={[1.1, 1.8, 0.6]}
              onClick={() => handleClick("back")}
            >
              <meshStandardMaterial
                map={backTexture}
                transparent
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </Decal>
          )}

          {jerseyTextTexture && (
            <Decal
              position={[0, 0.08, -0.21]}
              rotation={[0, Math.PI, 0]}
              scale={[0.8, 0.8, 0.4]}
            >
              <meshStandardMaterial
                map={jerseyTextTexture}
                transparent
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-3}
              />
            </Decal>
          )}

          {leftTexture && (
            <Decal
              position={[-0.70, 0.45, -0.05]}
              rotation={[0, -Math.PI / 2.5, 0]}
              scale={[0.60, 0.80, 0.60]}
              onClick={() => handleClick("left")}
            >
              <meshStandardMaterial
                map={leftTexture}
                transparent
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </Decal>
          )}

          {rightTexture && (
            <Decal
              position={[0.70, 0.45, -0.06]}
              rotation={[0, Math.PI / 2.5, 0]}
              scale={[0.60, 0.80, 0.60]}
              onClick={() => handleClick("right")}
            >
              <meshStandardMaterial
                map={rightTexture}
                transparent
                toneMapped={false}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </Decal>
          )}
        </mesh>
      </group>
    </Center>
  );
}

useGLTF.preload("/3Dmodels/sports-jerasey.glb");
