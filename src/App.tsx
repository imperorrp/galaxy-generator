import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GalaxyView from './components/scene/GalaxyView';
import SystemView from './components/scene/SystemView';
import SystemInfoDisplay from './components/ui/SystemInfoDisplay'; // Import SystemInfoDisplay
import type { StarData } from './types/galaxy';
import * as THREE from 'three';

type ViewMode = 'galaxy' | 'system';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('galaxy');
  const [selectedStarData, setSelectedStarData] = useState<StarData | null>(null);
  const controlsRef = useRef<any>(null); // Using any for OrbitControls type from drei
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  const handleStarSelect = (starData: StarData) => {
    setSelectedStarData(starData);
    setCurrentView('system');
  };

  const handleBackToGalaxy = () => {
    setSelectedStarData(null);
    setCurrentView('galaxy');
  };

  useEffect(() => {
    if (cameraRef.current && controlsRef.current) {
      if (currentView === 'galaxy') {
        cameraRef.current.position.set(0, 150, 700);
        cameraRef.current.fov = 60;
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.minDistance = 10;
        controlsRef.current.maxDistance = 2000;
      } else if (currentView === 'system' && selectedStarData) {
        // Adjust camera for system view - focus on the star
        // For now, a generic position, ideally based on starData.position and system size
        cameraRef.current.position.set(selectedStarData.position.x, selectedStarData.position.y + 50, selectedStarData.position.z + 100); 
        cameraRef.current.fov = 50;
        controlsRef.current.target.set(selectedStarData.position.x, selectedStarData.position.y, selectedStarData.position.z);
        controlsRef.current.minDistance = 5;
        controlsRef.current.maxDistance = 300;
      }
      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.update();
    }
  }, [currentView, selectedStarData]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ ref: cameraRef, position: [0, 150, 700], fov: 60, near: 0.1, far: 10000 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[100, 100, 100]} intensity={1.5} />
        
        {currentView === 'galaxy' && <GalaxyView onStarSelect={handleStarSelect} />}
        {currentView === 'system' && selectedStarData && (
          <SystemView starData={selectedStarData} onBackToGalaxy={handleBackToGalaxy} />
        )}

        <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      {currentView === 'system' && selectedStarData && (
        <SystemInfoDisplay starData={selectedStarData} onBackToGalaxy={handleBackToGalaxy} />
      )}
    </div>
  );
}

export default App;
