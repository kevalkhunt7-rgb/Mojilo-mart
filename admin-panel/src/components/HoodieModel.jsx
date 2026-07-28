import { Center, Decal, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

export function HoodieModel({
  tshirtColor = "#ffffff",
  designTexture,
  designTextureBack,
  designTextureLeft,
  designTextureRight,
  designTexturePocket,
  designTextureHood,
  onViewChange,
  frontDecalOffset = [0, 0.05, 0],
  backDecalOffset = [0, 0, 0],
  decalScale = 0.6,
}) {
  const { nodes } = useGLTF("/3Dmodels/hoodie.glb");
  const [frontTexture, setFrontTexture] = useState(null);
  const [backTexture, setBackTexture] = useState(null);
  const [leftTexture, setLeftTexture] = useState(null);
  const [rightTexture, setRightTexture] = useState(null);
  const [pocketTexture, setPocketTexture] = useState(null);
  const [hoodTexture, setHoodTexture] = useState(null);

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
  useEffect(() => { loadTexture(designTexturePocket, setPocketTexture); }, [designTexturePocket]);
  useEffect(() => { loadTexture(designTextureHood, setHoodTexture); }, [designTextureHood]);

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

  // Compute bounding box encompassing the entire hoodie
  const entireBoundingBox = useMemo(() => {
    if (meshNodes.length === 0) return null;

    const box = new THREE.Box3();
    meshNodes.forEach((node) => {
      if (node.geometry?.boundingBox) {
        box.union(node.geometry.boundingBox);
      }
    });
    return box;
  }, [meshNodes]);

  const decalPlacement = useMemo(() => {
    if (!entireBoundingBox) return null;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    entireBoundingBox.getSize(size);
    entireBoundingBox.getCenter(center);

    const chestY = entireBoundingBox.min.y + size.y * 0.7;

    // Position projector slightly outside the bounding box
    const frontZ = entireBoundingBox.max.z + 0.02;
    const backZ = entireBoundingBox.min.z - 0.02;

    const baseScale = Math.min(size.x, size.y) * decalScale;

    // A thin depth prevents back-bleed while keeping full front coverage
    const depth = 0.35;

    return {
      front: {
        position: [
          center.x + frontDecalOffset[0],
          chestY + frontDecalOffset[1],
          frontZ + frontDecalOffset[2],
        ],
        rotation: [0, 0, 0],
        scale: [baseScale * 2, baseScale * 2.5, depth],
      },
      back: {
        position: [
          center.x + backDecalOffset[0],
          chestY + backDecalOffset[1],
          backZ + backDecalOffset[1],
        ],
        rotation: [0, Math.PI, 0],
        scale: [baseScale * 2, baseScale * 2.8, depth],
      },
    };
  }, [entireBoundingBox, decalScale, frontDecalOffset, backDecalOffset]);

  const handleClick = (view) => {
    onViewChange?.(view);
  };

  return (
    <Center position={[0, -3.9, 0]}>
      <group dispose={null} scale={10.5}>
        {meshNodes.map((node, index) => {
          return (
            <mesh key={index} geometry={node.geometry} castShadow receiveShadow>
              <meshStandardMaterial
                color={tshirtColor}
                side={THREE.DoubleSide}
                roughness={0.9}
                metalness={0}
              />

              {/* Front Decal */}
              {frontTexture && decalPlacement && (
                <Decal
                  position={decalPlacement.front.position}
                  rotation={decalPlacement.front.rotation}
                  scale={decalPlacement.front.scale}
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

              {/* Back Decal */}
              {backTexture && decalPlacement && (
                <Decal
                  position={decalPlacement.back.position}
                  rotation={decalPlacement.back.rotation}
                  scale={decalPlacement.back.scale}
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
            </mesh>
          );
        })}
      </group>
    </Center>
  );
}

useGLTF.preload("/3Dmodels/hoodie.glb");