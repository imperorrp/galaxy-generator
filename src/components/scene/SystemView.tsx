import React from 'react';
// import * as THREE from 'three'; // Removed unused import
import type { StarData } from '../../types/galaxy';
import PlanetMesh from './PlanetMesh'; // Import the PlanetMesh component

interface SystemViewProps {
  starData: StarData | null; // Allow null if no star is selected
  onBackToGalaxy: () => void; // Function to go back to galaxy view - kept for prop consistency, though button is moved
}

const SystemView: React.FC<SystemViewProps> = ({ starData }) => {
  if (!starData) {
    return null; // Or some fallback UI if a star isn't selected but view is active
  }

  return (
    <group>
      {/* Placeholder for the star mesh */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[starData.size || 1, 32, 32]} />
        <meshStandardMaterial color={starData.color.clone()} emissive={starData.color.clone()} emissiveIntensity={2} />
        <pointLight color={starData.color.clone()} intensity={1.5} distance={500} />
      </mesh>

      {/* Render planets using PlanetMesh */}
      {starData.planets.map((planet) => (
        <PlanetMesh key={planet.id} planetData={planet} starPosition={starData.position} />
      ))}
    </group>
  );
};

export default SystemView;