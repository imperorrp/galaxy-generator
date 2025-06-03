import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { PlanetData } from '../../types/galaxy';

interface PlanetMeshProps {
  planetData: PlanetData;
  starPosition: THREE.Vector3; // Position of the star the planet orbits
}

const PlanetMesh: React.FC<PlanetMeshProps> = ({ planetData, starPosition }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const angle = useRef(Math.random() * Math.PI * 2); // Start at a random angle

  useFrame((_state, delta) => {
    if (meshRef.current) {
      // Orbital rotation around the star
      angle.current += planetData.orbitSpeed * delta;
      const x = starPosition.x + planetData.orbitRadius * Math.cos(angle.current);
      const z = starPosition.z + planetData.orbitRadius * Math.sin(angle.current);
      // Assuming orbits are in the XZ plane for simplicity initially
      meshRef.current.position.set(x, starPosition.y, z);

      // Axial rotation
      if (planetData.rotationSpeed) {
        meshRef.current.rotation.y += planetData.rotationSpeed * delta;
      }
    }
  });

  // Placeholder material - will be updated for textures later
  const materialColor = planetData.color ? new THREE.Color(`#${planetData.color}`) : new THREE.Color(0x888888);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[planetData.size, 32, 32]} />
      <meshStandardMaterial color={materialColor} />
    </mesh>
  );
};

export default PlanetMesh;