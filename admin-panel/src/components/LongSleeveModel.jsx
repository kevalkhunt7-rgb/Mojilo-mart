import { Center, Decal, useGLTF } from "@react-three/drei";
import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";

export function LongSleeveModel({
  tshirtColor = "#ffffff",
  designTexture,
  designTextureBack,
  designTextureLeft,
  designTextureRight,
  onViewChange,
}) {
  const { nodes } = useGLTF("/3Dmodels/long_sleeve_t-_shirt.glb");
  const [frontTexture, setFrontTexture] = useState(null);
  const [backTexture, setBackTexture] = useState(null);
  const [leftTexture, setLeftTexture] = useState(null);
  const [rightTexture, setRightTexture] = useState(null);

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

  const meshNodes = useMemo(() => {
    const list = Object.values(nodes).filter((node) => node.type === "Mesh");
    list.forEach((node) => {
      if (node.geometry) {
        node.geometry.computeVertexNormals();
        node.geometry.computeBoundingBox();
      }
    });
    return list;
  }, [nodes]);

  const handleClick = (view) => {
    onViewChange?.(view);
  };

  return (
    <Center>
      <group dispose={null} scale={0.13}>
        {meshNodes.map((node, index) => {
          const bbox = node.geometry?.boundingBox;
          const center = new THREE.Vector3();
          if (bbox) {
            bbox.getCenter(center);
          }

          const isTorsoMesh = node.name.toLowerCase().includes("front") || 
                              node.material?.name?.toLowerCase().includes("front") ||
                              (center.x > -25 && center.x < 25);

          const isLeftSleeve = center.x < -25;
          const isRightSleeve = center.x > 25;

          return (
            <mesh
              key={index}
              geometry={node.geometry}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={tshirtColor}
                side={THREE.DoubleSide}
                roughness={0.9}
                metalness={0}
              />

              {isTorsoMesh && (
                <>
                  {frontTexture && (
                    <Decal
                      position={[0, 125, 12]}
                      rotation={[0, 0, 0]}
                      scale={[55, 65, 20]}
                      onClick={() => handleClick("front")}
                    >
                      <meshStandardMaterial
                        map={frontTexture}
                        transparent
                        polygonOffset
                        polygonOffsetFactor={-10}
                      />
                    </Decal>
                  )}

                  {backTexture && (
                    <Decal
                      position={[0, 125, -12]}
                      rotation={[0, Math.PI, 0]}
                      scale={[55, 65, 20]}
                      onClick={() => handleClick("back")}
                    >
                      <meshStandardMaterial
                        map={backTexture}
                        transparent
                        polygonOffset
                        polygonOffsetFactor={-10}
                      />
                    </Decal>
                  )}
                </>
              )}

              {isLeftSleeve && leftTexture && (
                <Decal
                  position={[center.x + 8, center.y - 10, center.z + 15]}
                  rotation={[0, -Math.PI / 4, 0]}
                  scale={[20, 50, 20]}
                  onClick={() => handleClick("left")}
                >
                  <meshStandardMaterial
                    map={leftTexture}
                    transparent
                    polygonOffset
                    polygonOffsetFactor={-10}
                  />
                </Decal>
              )}

              {isRightSleeve && rightTexture && (
                <Decal
                  position={[center.x - 8, center.y - 10, center.z + 15]}
                  rotation={[0, Math.PI / 4, 0]}
                  scale={[20, 50, 20]}
                  onClick={() => handleClick("right")}
                >
                  <meshStandardMaterial
                    map={rightTexture}
                    transparent
                    polygonOffset
                    polygonOffsetFactor={-10}
                  />
                </Decal>
              )}
            </mesh>
          );
        })}
      </group>
    </Center>
  );
}

useGLTF.preload("/3Dmodels/long_sleeve_t-_shirt.glb");
