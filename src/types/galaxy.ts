import * as THREE from 'three';

export interface PlanetData {
    id: string;
    name: string;
    type: 'terrestrial' | 'gas_giant' | 'ice' | 'desert' | 'volcanic' | 'oceanic' | 'barren'; // Expanded types
    size: number; // relative to star or absolute
    orbitRadius: number;
    orbitSpeed: number;
    orbitInclination?: number; // Added for more varied orbits
    axialTilt?: number;
    rotationSpeed?: number;
    textureUrl?: string;
    color?: string; // fallback if no texture
    // ... resources, population etc.
}

export interface StarData {
    id: string;
    name: string;
    position: THREE.Vector3; // or [number, number, number] for serialization
    color: THREE.Color;      // or string hex
    size?: number;
    isKeySystem?: boolean;
    factionId?: string;
    planets: PlanetData[];
    textureIndex?: number; // Index for selecting star texture
    // ... other strategic properties
}

// Define a type for the configurable parameters from galaxyConfig.ts
export interface ConfigurableGalaxyParams {
  // Basic Galaxy Params
  numStars: number;
  galaxyRadius: number;
  numArms: number;
  spiralTightness: number;
  armWidth: number;
  bulgeSizeFactor: number;
  centralBarLengthFactor: number;
  colorInHex: string;
  colorOutHex: string;

  // Advanced Galaxy Params
  mainGalaxyStarFraction: number;
  outerDiskStarFraction: number;
  haloStarFraction: number;
  globularClusterStarFraction: number;
  numGlobularClusters: number;
  globularClusterRadiusMin: number;
  globularClusterRadiusMax: number;
  globularClusterDensityPower: number;
  globularClusterPositionRadiusMinFactor: number;
  globularClusterPositionRadiusMaxFactor: number;
  haloMinRadiusFactor: number;
  haloMaxRadiusFactor: number;
  haloYScale: number;
  haloDensityPower: number;
  outerDiskMinRadiusFactor: number;
  outerDiskMaxRadiusFactor: number;
  outerDiskYScale: number;
  spiralAngleFactor: number;
  armPointDensityPower: number;
  diskYScaleForArms: number;
  subArmChance: number;
  subArmScatterFactor: number;
  subArmAngleOffsetRange: number;
  bulgeYScale: number;
  bulgeDensityPower: number;
  centralBarWidthFactor: number;
  centralBarYScale: number;
  diskStarFraction: number;
  diskStarYScale: number;
}

// Define a type for the configurable parameters from nebulaConfig.ts
export interface ConfigurableNebulaParams {
  // Basic Nebula Params
  numNebulaeToGenerate: number;
  nebulaOpacityBase: number;
  nebulaBaseScaleMinFactor: number;

  // Advanced Nebula Params
  galacticPlaneThicknessFactor: number;
  nebulaRadialDistPower: number;
  nebulaMaxRadialFactorOfGalaxyRadiusFraction: number;
  nebulaYDeviationBiasChance: number;
  nebulaYDeviationBiasMultiplierMin: number;
  nebulaYDeviationBiasMultiplierRandomAdd: number;
  nebulaBaseScaleRandomFactor: number;
  nebulaAspectRatioVariationBase: number;
  nebulaAspectRatioVariationRandom: number;
  nebulaRotationXYPlaneMaxRadians: number;
  nebulaOpacityRandomFactor: number;
  nebulaMaxAbsoluteSpinSpeed: number;
}

// Combined application configuration
export interface AppConfig {
  galaxy: ConfigurableGalaxyParams;
  nebula: ConfigurableNebulaParams;
}