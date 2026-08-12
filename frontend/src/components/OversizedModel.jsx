import { Center, Decal, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

export function OversizedModel({
  tshirtColor,
  designTexture,
  designTextureBack,
  onViewChange,
}) {
  const { nodes, materials } = useGLTF("/3Dmodels/oversized_t-shirt.glb");
  const [frontTexture, setFrontTexture] = useState(null);
  const [backTexture, setBackTexture] = useState(null);
  const useRefs = useRef([]);

  useEffect(() => {
    let active = true;
    let loadedTexture = null;

    if (designTexture) {
      const loader = new THREE.TextureLoader();
      loader.load(designTexture, (tex) => {
        if (!active) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        setFrontTexture(tex);
        loadedTexture = tex;
      });
    } else {
      setFrontTexture(null);
    }
    return () => { active = false; if (loadedTexture) loadedTexture.dispose(); };
  }, [designTexture]);

  useEffect(() => {
    let active = true;
    let loadedTexture = null;

    if (designTextureBack) {
      const loader = new THREE.TextureLoader();
      loader.load(designTextureBack, (tex) => {
        if (!active) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        setBackTexture(tex);
        loadedTexture = tex;
      });
    } else {
      setBackTexture(null);
    }
    return () => { active = false; if (loadedTexture) loadedTexture.dispose(); };
  }, [designTextureBack]);

  useEffect(() => {
    useRefs.current.forEach((mesh) => {
      if (mesh && mesh.material) {
        mesh.material.color.set(tshirtColor);
        mesh.material.side = THREE.DoubleSide;
      }
    });
  }, [tshirtColor, nodes]);

  const handleClick = (view) => {
    onViewChange?.(view);
  };

  const structuralMeshes = useMemo(() => {
    return Object.keys(nodes)
      .map((key) => nodes[key])
      .filter((node) => node && node.type === "Mesh" && node.geometry);
  }, [nodes]);

  return (
    <Center position={[0, 0, 0]}>
      <group dispose={null}>
        <group scale={14} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          {structuralMeshes.map((meshNode, index) => {
            const originalMaterial = meshNode.material || Object.values(materials)[0];
            const isTorsoMesh = meshNode.name === "Object_3" || meshNode.name === "Object_4" || meshNode.name === "Object_5";

            return (
              <mesh
                key={meshNode.name || index}
                ref={(el) => (useRefs.current[index] = el)}
                castShadow
                receiveShadow
                geometry={meshNode.geometry}
                material={originalMaterial}
              >
                {isTorsoMesh && (
                  <>
                    {/* FRONT DECAL - depth 0.22 centered at Y=-0.14 spans Y -0.25 to -0.03 (full front surface, no bleed to back) */}
                    {frontTexture && (
                      <Decal
                        position={[0, -0.14, 1.28]}
                        rotation={[Math.PI / 2, 0, 0]}
                        scale={[0.8, 1, 0.22]}
                        onClick={() => handleClick("front")}
                      >
                        <meshStandardMaterial
                          map={frontTexture}
                          toneMapped={false}
                          transparent
                          roughness={0.8}
                          polygonOffset
                          polygonOffsetFactor={-10}
                        />
                      </Decal>
                    )}

                    {/* BACK DECAL - depth 0.22 centered at Y=+0.14 spans Y +0.03 to +0.25 (full back surface, no bleed to front) */}
                    {backTexture && (
                      <Decal
                        position={[0, 0.14, 1.28]}
                        rotation={[-Math.PI / 2, 0, Math.PI]}
                        scale={[0.8, 1, 0.22]}
                        onClick={() => handleClick("back")}
                      >
                        <meshStandardMaterial
                          map={backTexture}
                          toneMapped={false}
                          transparent
                          roughness={0.8}
                          polygonOffset
                          polygonOffsetFactor={-10}
                        />
                      </Decal>
                    )}
                  </>
                )}
              </mesh>
            );
          })}
        </group>
      </group>
    </Center>
  );
}

useGLTF.preload("/3Dmodels/oversized_t-shirt.glb");