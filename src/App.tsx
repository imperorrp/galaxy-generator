import { useState, useRef, useEffect, useCallback } from 'react';
import LodControls from './components/ui/LodControls'; // Import LodControls
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

  // LOD State
  const [isLodManual, setIsLodManual] = useState(false);
  const [manualLodLevel, setManualLodLevel] = useState(0); // Default to Far
  const [effectiveLodLevel, setEffectiveLodLevel] = useState(0); // Actual LOD level used by GalaxyView
  
  // Optimized Mode State
  const [userOptimizedModeSetting, setUserOptimizedModeSetting] = useState(false); // User's preference via toggle
  const [actualOptimizedMode, setActualOptimizedMode] = useState(false); // Actual mode reported by useCameraDynamics
  
  // Performance Metrics State (enterThreshold removed)
  const [performanceMetrics, setPerformanceMetrics] = useState({ frameTime: 0, angularSpeed: 0 });

  const handleStarSelect = (starData: StarData) => {
    setSelectedStarData(starData);
    setCurrentView('system');
  };

  const handleBackToGalaxy = () => {
    setSelectedStarData(null);
    setCurrentView('galaxy');
  };

  // LOD Control Handlers
  const handleToggleLodMode = (isManual: boolean) => {
    setIsLodManual(isManual);
  };

  const handleSetManualLodLevel = (level: number) => {
    setManualLodLevel(level);
  };

  const handleEffectiveLodChange = (level: number) => {
    setEffectiveLodLevel(level);
  };

  // Optimized Mode Handlers
  const handleToggleUserOptimizedModeSetting = () => {
    setUserOptimizedModeSetting(prev => !prev);
  };

  const handleActualOptimizedModeChange = useCallback((isActive: boolean) => {
    setActualOptimizedMode(isActive);
  }, []); // useCallback to stabilize the function reference

  // Performance Metrics Handler (signature updated)
  const handlePerformanceMetricsChange = (metrics: { frameTime: number; angularSpeed: number; }) => {
    setPerformanceMetrics(metrics);
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
        
        {currentView === 'galaxy' && 
          <GalaxyView 
            onStarSelect={handleStarSelect} 
            isLodManual={isLodManual} 
            manualLodOverride={manualLodLevel} 
            onLodLevelChange={handleEffectiveLodChange}
            onOptimizedModeChange={handleActualOptimizedModeChange} // Renamed and new handler
            onPerformanceMetricsChange={handlePerformanceMetricsChange} // Updated handler signature
            userRequestedOptimizedMode={userOptimizedModeSetting} // New prop for user's preference
          />
        }
        {currentView === 'system' && selectedStarData && (
          <SystemView starData={selectedStarData} onBackToGalaxy={handleBackToGalaxy} />
        )}

        <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      {currentView === 'system' && selectedStarData && (
        <SystemInfoDisplay starData={selectedStarData} onBackToGalaxy={handleBackToGalaxy} />
      )}
      <LodControls
        isLodManual={isLodManual}
        manualLodLevel={manualLodLevel}
        currentAutoLodLevel={effectiveLodLevel}
        onToggleLodMode={handleToggleLodMode}
        onSetManualLodLevel={handleSetManualLodLevel}
        isOptimizedModeActive={userOptimizedModeSetting} // Changed from actualOptimizedMode to userOptimizedModeSetting
        onToggleOptimizedMode={handleToggleUserOptimizedModeSetting}
        performanceMetrics={performanceMetrics}
      />
    </div>
  );
}

export default App;
