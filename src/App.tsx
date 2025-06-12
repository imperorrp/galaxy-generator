import { useState, useRef, useEffect, useCallback } from 'react';
import LodControls from './components/ui/LodControls'; // Import LodControls
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GalaxyView from './components/scene/GalaxyView';
import SystemView from './components/scene/SystemView';
import SystemInfoDisplay from './components/ui/SystemInfoDisplay'; // Import SystemInfoDisplay
import GalaxyConfigPanel from './components/ui/GalaxyConfigPanel'; // Import GalaxyConfigPanel
import type { AppConfig, ConfigurableGalaxyParams, ConfigurableNebulaParams } from './types/galaxy'; // Import new types
import { GALAXY_PARAMS, NUM_STARS, GALAXY_RADIUS, MAIN_GALAXY_STAR_FRACTION, OUTER_DISK_STAR_FRACTION, HALO_STAR_FRACTION, GLOBULAR_CLUSTER_STAR_FRACTION, NUM_GLOBULAR_CLUSTERS, GLOBULAR_CLUSTER_RADIUS_MIN, GLOBULAR_CLUSTER_RADIUS_MAX, GLOBULAR_CLUSTER_DENSITY_POWER, GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR, GLOBULAR_CLUSTER_POSITION_RADIUS_MAX_FACTOR, HALO_MIN_RADIUS_FACTOR, HALO_MAX_RADIUS_FACTOR, HALO_Y_SCALE, HALO_DENSITY_POWER, OUTER_DISK_MIN_RADIUS_FACTOR, OUTER_DISK_MAX_RADIUS_FACTOR, OUTER_DISK_Y_SCALE } from './config/galaxyConfig'; // Import all default galaxy config values
import * as NEBULA_CONFIG from './config/nebulaConfig'; // Import default nebula config values
import type { StarData } from './types/galaxy';
import * as THREE from 'three';

type ViewMode = 'galaxy' | 'system';

// Define the initial default configuration for the entire app
const getDefaultAppConfig = (): AppConfig => ({
  galaxy: {
    numStars: NUM_STARS,
    galaxyRadius: GALAXY_RADIUS,
    numArms: GALAXY_PARAMS.numArms,
    spiralTightness: GALAXY_PARAMS.spiralTightness,
    armWidth: GALAXY_PARAMS.armWidth,
    bulgeSizeFactor: GALAXY_PARAMS.bulgeSizeFactor,
    centralBarLengthFactor: GALAXY_PARAMS.centralBarLengthFactor,
    colorInHex: GALAXY_PARAMS.colorInHex,
    colorOutHex: GALAXY_PARAMS.colorOutHex,
    // Advanced Galaxy Params from GALAXY_PARAMS and other constants
    mainGalaxyStarFraction: MAIN_GALAXY_STAR_FRACTION,
    outerDiskStarFraction: OUTER_DISK_STAR_FRACTION,
    haloStarFraction: HALO_STAR_FRACTION,
    globularClusterStarFraction: GLOBULAR_CLUSTER_STAR_FRACTION,
    numGlobularClusters: NUM_GLOBULAR_CLUSTERS,
    globularClusterRadiusMin: GLOBULAR_CLUSTER_RADIUS_MIN,
    globularClusterRadiusMax: GLOBULAR_CLUSTER_RADIUS_MAX,
    globularClusterDensityPower: GLOBULAR_CLUSTER_DENSITY_POWER,
    globularClusterPositionRadiusMinFactor: GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR,
    globularClusterPositionRadiusMaxFactor: GLOBULAR_CLUSTER_POSITION_RADIUS_MAX_FACTOR,
    haloMinRadiusFactor: HALO_MIN_RADIUS_FACTOR,
    haloMaxRadiusFactor: HALO_MAX_RADIUS_FACTOR,
    haloYScale: HALO_Y_SCALE,
    haloDensityPower: HALO_DENSITY_POWER,
    outerDiskMinRadiusFactor: OUTER_DISK_MIN_RADIUS_FACTOR,
    outerDiskMaxRadiusFactor: OUTER_DISK_MAX_RADIUS_FACTOR,
    outerDiskYScale: OUTER_DISK_Y_SCALE,
    spiralAngleFactor: GALAXY_PARAMS.spiralAngleFactor,
    armPointDensityPower: GALAXY_PARAMS.armPointDensityPower,
    diskYScaleForArms: GALAXY_PARAMS.diskYScaleForArms,
    subArmChance: GALAXY_PARAMS.subArmChance,
    subArmScatterFactor: GALAXY_PARAMS.subArmScatterFactor,
    subArmAngleOffsetRange: GALAXY_PARAMS.subArmAngleOffsetRange,
    bulgeYScale: GALAXY_PARAMS.bulgeYScale,
    bulgeDensityPower: GALAXY_PARAMS.bulgeDensityPower,
    centralBarWidthFactor: GALAXY_PARAMS.centralBarWidthFactor,
    centralBarYScale: GALAXY_PARAMS.centralBarYScale,
    diskStarFraction: GALAXY_PARAMS.diskStarFraction,
    diskStarYScale: GALAXY_PARAMS.diskStarYScale,
  },
  nebula: {
    numNebulaeToGenerate: NEBULA_CONFIG.NUM_NEBULAE_TO_GENERATE,
    nebulaOpacityBase: NEBULA_CONFIG.NEBULA_OPACITY_BASE,
    nebulaBaseScaleMinFactor: NEBULA_CONFIG.NEBULA_BASE_SCALE_MIN_FACTOR,
    galacticPlaneThicknessFactor: NEBULA_CONFIG.GALACTIC_PLANE_THICKNESS_FACTOR,
    nebulaRadialDistPower: NEBULA_CONFIG.NEBULA_RADIAL_DIST_POWER,
    nebulaMaxRadialFactorOfGalaxyRadiusFraction: NEBULA_CONFIG.NEBULA_MAX_RADIAL_FACTOR_OF_GALAXY_RADIUS_FRACTION,
    nebulaYDeviationBiasChance: NEBULA_CONFIG.NEBULA_Y_DEVIATION_BIAS_CHANCE,
    nebulaYDeviationBiasMultiplierMin: NEBULA_CONFIG.NEBULA_Y_DEVIATION_BIAS_MULTIPLIER_MIN,
    nebulaYDeviationBiasMultiplierRandomAdd: NEBULA_CONFIG.NEBULA_Y_DEVIATION_BIAS_MULTIPLIER_RANDOM_ADD,
    nebulaBaseScaleRandomFactor: NEBULA_CONFIG.NEBULA_BASE_SCALE_RANDOM_FACTOR,
    nebulaAspectRatioVariationBase: NEBULA_CONFIG.NEBULA_ASPECT_RATIO_VARIATION_BASE,
    nebulaAspectRatioVariationRandom: NEBULA_CONFIG.NEBULA_ASPECT_RATIO_VARIATION_RANDOM,
    nebulaRotationXYPlaneMaxRadians: NEBULA_CONFIG.NEBULA_ROTATION_XY_PLANE_MAX_RADIANS,
    nebulaOpacityRandomFactor: NEBULA_CONFIG.NEBULA_OPACITY_RANDOM_FACTOR,
    nebulaMaxAbsoluteSpinSpeed: NEBULA_CONFIG.NEBULA_MAX_ABSOLUTE_SPIN_SPEED,
  }
});

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('galaxy');
  const [selectedStarData, setSelectedStarData] = useState<StarData | null>(null);
  const controlsRef = useRef<any>(null); // Using any for OrbitControls type from drei
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!); 

  // Application Configuration State (includes galaxy and nebula)
  const [appConfig, setAppConfig] = useState<AppConfig>(getDefaultAppConfig());

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

  // App Config Handlers (covers both galaxy and nebula)
  const handleAppConfigChange = (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    // Potentially trigger a re-generation or update of views here
  };

  const handleResetAppConfig = () => {
    setAppConfig(getDefaultAppConfig());
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
            // Pass galaxy config props to GalaxyView from appConfig
            // Note: GalaxyView will need to be updated to accept the full ConfigurableGalaxyParams object
            // For now, spreading the galaxy part of appConfig. This will be refined.
            {...appConfig.galaxy} // This spreads all galaxy params
            nebulaConfig={appConfig.nebula} // Pass nebula configuration
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
      <GalaxyConfigPanel // This will be renamed to MainConfigPanel later
        initialConfig={appConfig} // Pass the whole appConfig
        onConfigChange={handleAppConfigChange} 
        onResetConfig={handleResetAppConfig} 
      />
    </div>
  );
}

export default App;
