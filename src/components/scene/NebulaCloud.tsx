import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface NebulaCloudProps {
  textureUrl: string;
  position?: THREE.Vector3 | [number, number, number];
  scale?: THREE.Vector3 | [number, number, number] | number;
  rotation?: THREE.Euler | [number, number, number];
  opacity?: number;
  spinSpeed?: number; // Optional speed for slow rotation
}

const NebulaCloud: React.FC<NebulaCloudProps> = ({
  textureUrl,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  opacity = 0.5,
  spinSpeed = 0.005
}) => {
  const texture = useTexture(textureUrl);
  const meshRef = useRef<THREE.Mesh>(null!);

  // Optional: Add a slow spin to the nebula
  useFrame((_state, delta) => {
    if (meshRef.current && spinSpeed) {
      meshRef.current.rotation.y += delta * spinSpeed;
      // meshRef.current.rotation.x += delta * spinSpeed * 0.5; // Example for more complex rotation
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending} // Or THREE.NormalBlending, depending on desired effect
        depthWrite={false} // Important for correct layering with other transparent objects
        side={THREE.DoubleSide} // Render both sides, useful for flat planes
      />
    </mesh>
  );
};

export default NebulaCloud;