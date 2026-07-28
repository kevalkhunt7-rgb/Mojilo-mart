// src/components/3d/DynamicClothModel.jsx

import React from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { PRODUCT_MODELS } from "../../config/modelsRegistry";

export function DynamicClothModel({ item }) {
  // 1. Fallback to sports_jersey if productType is missing
  const modelConfig = PRODUCT_MODELS[item.productType] || PRODUCT_MODELS.sports_jersey;

  // 2. Load GLB dynamically based on item type
  const { nodes, materials } = useGLTF(modelConfig.glbPath);

  // 3. Fallback mesh selection (finds mesh_0 or first mesh in GLB)
  const targetMesh = nodes.mesh_0 || Object.values(nodes).find((n) => n.isMesh);
  const baseMaterial = materials[Object.keys(materials)[0]];

  return (
    <group scale={modelConfig.scale}>
      <mesh geometry={targetMesh.geometry} material={baseMaterial}>
        {/* Garment Base Color */}
        <meshStandardMaterial color={item.color || "#ffffff"} roughness={0.5} />

        {/* Front Decal Projection */}
        {item.designFront && (
          <Decal position={[0, 0.05, 0.25]} rotation={[0, 0, 0]} scale={[1.3, 1.5, 0.6]}>
            <meshStandardMaterial
              map={item.designFront}
              transparent
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
        )}

        {/* Back Decal Projection */}
        {item.designBack && (
          <Decal position={[0, 0.05, -0.25]} rotation={[0, Math.PI, 0]} scale={[1.3, 1.5, 0.6]}>
            <meshStandardMaterial
              map={item.designBack}
              transparent
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
        )}

        {/* Left Sleeve Decal */}
        {item.designLeft && (
          <Decal position={[-0.45, 0.15, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[0.5, 0.5, 0.5]}>
            <meshStandardMaterial
              map={item.designLeft}
              transparent
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
        )}

        {/* Right Sleeve Decal */}
        {item.designRight && (
          <Decal position={[0.45, 0.15, 0]} rotation={[0, Math.PI / 2, 0]} scale={[0.5, 0.5, 0.5]}>
            <meshStandardMaterial
              map={item.designRight}
              transparent
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </Decal>
        )}
      </mesh>
    </group>
  );
}