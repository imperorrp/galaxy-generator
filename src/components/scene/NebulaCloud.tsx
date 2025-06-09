import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber'; // Added useThree
import { useRef, useEffect } from 'react'; // Added useEffect

interface NebulaCloudProps {
  textureUrl: string;
  position?: THREE.Vector3 | [number, number, number];
  scale?: THREE.Vector3 | [number, number, number] | number;
  opacity?: number;
  isRotating?: boolean; // Added isRotating prop
  isVisible?: boolean; // New prop for conditional rendering
}

const NebulaCloud: React.FC<NebulaCloudProps> = ({
  textureUrl,
  position = [0, 0, 0],
  scale = 1,
  // rotation = [0, 0, 0], // Initial rotation is overridden by lookAt
  opacity = 0.5,
  isRotating = false, // Default value for isRotating
  isVisible = true, // Default to true
}) => {
  const { gl } = useThree(); // Get renderer for maxAnisotropy
  const texture = useTexture(textureUrl);
  const meshRef = useRef<THREE.Mesh>(null!); 

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.visible = isVisible;
    }
  }, [isVisible]);

  useEffect(() => {
    if (!gl || !texture || !isVisible) return; // Also check isVisible

    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    if (isRotating) {
      texture.anisotropy = 1;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    } else {
      texture.anisotropy = maxAnisotropy;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
    texture.needsUpdate = true;
  }, [isRotating, texture, gl, isVisible]); // Added isVisible to dependency array

  useFrame((state) => {
    if (meshRef.current && isVisible) { // Only update if visible
      // Make the nebula face the camera
      meshRef.current.lookAt(state.camera.position);
    }
  });

  // Return null if not visible to prevent rendering, alternative to mesh.visible = false for full unmount if preferred
  // However, for this case, toggling visibility is likely better to avoid re-mount costs.
  // if (!isVisible) return null; 

  return (
    <mesh ref={meshRef} position={position} scale={scale} visible={isVisible} /* rotation prop removed */>
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