import * as THREE from 'three';
import type { StarData, PlanetData } from '../types/galaxy';
import type { ConfigurableGalaxyParams } from '../components/ui/GalaxyConfigPanel'; // Import ConfigurableGalaxyParams
import {
    MIN_PLANETS_PER_SYSTEM,
    MAX_PLANETS_PER_SYSTEM,
    PLANET_TYPES,
    MIN_PLANET_SIZE,
    MAX_PLANET_SIZE,
    ORBIT_RADIUS_BASE_MIN,
    ORBIT_RADIUS_RANDOM_FACTOR,
    MIN_PLANET_ORBIT_SPEED,
    MAX_PLANET_ORBIT_SPEED
} from '../config/planetConfig';
import {
    NUM_COMMON_STAR_TEXTURES,
    NUM_RARE_STAR_TEXTURES,
    NUM_STARS,
    GALAXY_RADIUS,
    MAIN_GALAXY_STAR_FRACTION,
    HALO_STAR_FRACTION,
    GLOBULAR_CLUSTER_STAR_FRACTION,
    NUM_GLOBULAR_CLUSTERS,
    GLOBULAR_CLUSTER_RADIUS_MIN,
    GLOBULAR_CLUSTER_RADIUS_MAX,
    GLOBULAR_CLUSTER_DENSITY_POWER,
    GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR,
    GLOBULAR_CLUSTER_POSITION_RADIUS_MAX_FACTOR,
    HALO_MIN_RADIUS_FACTOR,
    HALO_MAX_RADIUS_FACTOR,
    HALO_Y_SCALE,
    HALO_DENSITY_POWER,
    OUTER_DISK_STAR_FRACTION, // Added
    OUTER_DISK_MIN_RADIUS_FACTOR, // Added
    OUTER_DISK_MAX_RADIUS_FACTOR, // Added
    OUTER_DISK_Y_SCALE, // Added
    GALAXY_PARAMS as DEFAULT_GALAXY_PARAMS // Rename imported GALAXY_PARAMS to avoid conflict
} from '../config/galaxyConfig';
import { generateRandomName } from './galaxyGenerationModules/nameGenerator'; // Added import
import { generatePlanets } from './galaxyGenerationModules/planetGenerator'; // Added import
import { generateHaloStars } from './galaxyGenerationModules/haloStarGenerator'; // Added import
import { generateGlobularClusterStars } from './galaxyGenerationModules/globularClusterStarGenerator'; // Added import
import { generateMainGalaxyStars } from './galaxyGenerationModules/mainGalaxyStarGenerator'; // Added import
import { generateOuterDiskStars } from './galaxyGenerationModules/outerDiskStarGenerator'; // Added import

// export const GALAXY_RADIUS = 1000; // Moved to config

export interface GalaxyData {
    stars: StarData[];
    positions: Float32Array;
    colors: Float32Array;
    sizes: Float32Array; // Added for star sizes
}

// GALAXY_PARAMS is now imported from galaxyConfig.ts

export const generateGalaxyData = (config: ConfigurableGalaxyParams): GalaxyData => {
    const MIN_STAR_DISTANCE = 25.0;
    const MIN_STAR_DISTANCE_SQUARED = MIN_STAR_DISTANCE * MIN_STAR_DISTANCE;
    const MAX_PLACEMENT_ATTEMPTS = 10;

    const stars: StarData[] = [];
    const tempPositions: number[] = [];
    const tempColors: number[] = [];
    const tempSizes: number[] = [];

    const colorInside = new THREE.Color(config.colorInHex);
    const colorOutside = new THREE.Color(config.colorOutHex);

    const actualBulgeRadius = config.galaxyRadius * config.bulgeSizeFactor;
    const actualArmWidth = config.armWidth;
    const actualBarLength = config.galaxyRadius * config.centralBarLengthFactor;
    // Assuming centralBarWidthFactor is still from default or needs to be added to ConfigurableGalaxyParams
    // For now, using the default. If it needs to be configurable, it should be added to ConfigurableGalaxyParams.
    const actualBarWidth = config.galaxyRadius * DEFAULT_GALAXY_PARAMS.centralBarWidthFactor;

    // Use numStars from config
    const numGlobularClusterStarsTotal = Math.floor(config.numStars * GLOBULAR_CLUSTER_STAR_FRACTION);
    const numOuterDiskStars = Math.floor(config.numStars * OUTER_DISK_STAR_FRACTION);
    const numHaloStars = Math.floor(config.numStars * HALO_STAR_FRACTION);
    
    // Main galaxy stars get the rest to ensure total count matches config.numStars
    // and that numMainGalaxyStars is not negative (it won't be with current fractions summing to 1)
    const numMainGalaxyStars = Math.max(0, config.numStars - numGlobularClusterStarsTotal - numOuterDiskStars - numHaloStars);

    const starsPerCluster = numGlobularClusterStarsTotal > 0 && NUM_GLOBULAR_CLUSTERS > 0
        ? Math.floor(numGlobularClusterStarsTotal / NUM_GLOBULAR_CLUSTERS)
        : 0;

    let currentStarCounter = 0; // Tracks total stars generated across all types

    // 1. Generate Main Galaxy Stars
    // Helper functions like generateMainGalaxyStars will need to be updated to accept config parameters
    // For example, passing config or specific values like config.numArms, config.spiralTightness etc.
    currentStarCounter = generateMainGalaxyStars({
        numMainGalaxyStars,
        stars,
        tempPositions,
        tempColors,
        tempSizes,
        currentStarCounter,
        colorInside,
        colorOutside,
        minStarDistanceSquared: MIN_STAR_DISTANCE_SQUARED,
        maxPlacementAttempts: MAX_PLACEMENT_ATTEMPTS,
        actualBulgeRadius,
        actualArmWidth,
        actualBarLength,
        actualBarWidth,
        // Pass relevant config params for arms, spiral, etc.
        galaxyRadius: config.galaxyRadius, 
        numArms: config.numArms,
        spiralTightness: config.spiralTightness,
        // Other GALAXY_PARAMS used by generateMainGalaxyStars would need to be passed from config or DEFAULT_GALAXY_PARAMS
        spiralAngleFactor: DEFAULT_GALAXY_PARAMS.spiralAngleFactor, 
        armPointDensityPower: DEFAULT_GALAXY_PARAMS.armPointDensityPower,
        diskYScaleForArms: DEFAULT_GALAXY_PARAMS.diskYScaleForArms,
        subArmChance: DEFAULT_GALAXY_PARAMS.subArmChance,
        subArmScatterFactor: DEFAULT_GALAXY_PARAMS.subArmScatterFactor,
        subArmAngleOffsetRange: DEFAULT_GALAXY_PARAMS.subArmAngleOffsetRange,
        bulgeYScale: DEFAULT_GALAXY_PARAMS.bulgeYScale,
        bulgeDensityPower: DEFAULT_GALAXY_PARAMS.bulgeDensityPower,
        centralBarYScale: DEFAULT_GALAXY_PARAMS.centralBarYScale,
        diskStarFraction: DEFAULT_GALAXY_PARAMS.diskStarFraction,
        diskStarYScale: DEFAULT_GALAXY_PARAMS.diskStarYScale
    });

    // 2. Generate Outer Disk Stars
    currentStarCounter = generateOuterDiskStars({
        numOuterDiskStars,
        stars,
        tempPositions,
        tempColors,
        tempSizes,
        currentStarCounter,
        colorInside,
        colorOutside,
        minStarDistanceSquared: MIN_STAR_DISTANCE_SQUARED,
        maxPlacementAttempts: MAX_PLACEMENT_ATTEMPTS,
        galaxyRadius: config.galaxyRadius, // Pass galaxyRadius from config
        outerDiskMinRadiusFactor: config.outerDiskMinRadiusFactor,
        outerDiskMaxRadiusFactor: config.outerDiskMaxRadiusFactor,
        outerDiskYScale: config.outerDiskYScale
        // Note: The generateOuterDiskStars function signature will need to be updated.
    });

    // 3. Generate Halo Stars
    currentStarCounter = generateHaloStars({
        numHaloStars,
        stars,
        tempPositions,
        tempColors,
        tempSizes,
        currentStarCounter,
        colorOutside,
        colorInside,
        minStarDistanceSquared: MIN_STAR_DISTANCE_SQUARED,
        maxPlacementAttempts: MAX_PLACEMENT_ATTEMPTS,
        galaxyRadius: config.galaxyRadius, // Pass galaxyRadius from config
        haloMinRadiusFactor: HALO_MIN_RADIUS_FACTOR,
        haloMaxRadiusFactor: HALO_MAX_RADIUS_FACTOR,
        haloYScale: HALO_Y_SCALE,
        haloDensityPower: HALO_DENSITY_POWER,
        totalAllowedStars: config.numStars // Ensure total star count is respected
    });

    // 4. Generate Globular Clusters
    currentStarCounter = generateGlobularClusterStars({
        starsPerCluster,
        stars,
        tempPositions,
        tempColors,
        tempSizes,
        currentStarCounter,
        minStarDistanceSquared: MIN_STAR_DISTANCE_SQUARED,
        maxPlacementAttempts: MAX_PLACEMENT_ATTEMPTS,
        totalAllowedStars: config.numStars, 
        galaxyRadius: config.galaxyRadius, // Pass galaxyRadius from config
        numClustersToGenerate: NUM_GLOBULAR_CLUSTERS, // Pass the imported constant
        globularClusterRadiusMin: GLOBULAR_CLUSTER_RADIUS_MIN,
        globularClusterRadiusMax: GLOBULAR_CLUSTER_RADIUS_MAX,
        globularClusterDensityPower: GLOBULAR_CLUSTER_DENSITY_POWER,
        globularClusterPositionRadiusMinFactor: GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR,
        globularClusterPositionRadiusMaxFactor: GLOBULAR_CLUSTER_POSITION_RADIUS_MAX_FACTOR
    });

    // Ensure NUM_STARS are generated if fractions/rounding caused minor discrepancies
    // This loop is a fallback and ideally shouldn't run if counts are precise.
    while (currentStarCounter < config.numStars) { // Use config.numStars
        const id = `star-${currentStarCounter}`;
        // Generate as a generic distant halo star to fill up space
        const radius = config.galaxyRadius * (HALO_MAX_RADIUS_FACTOR * 0.8 + Math.random() * 0.4); // Use config.galaxyRadius
        const phi = Math.random() * Math.PI * 2;
        const costheta = (Math.random() - 0.5) * 2;
        const sintheta = Math.sqrt(1 - costheta*costheta);
        const x = radius * sintheta * Math.cos(phi);
        const z = radius * sintheta * Math.sin(phi);
        const y = radius * costheta * HALO_Y_SCALE;
        const mixedColor = colorOutside.clone().lerp(colorInside, Math.random() * 0.02);
        const baseSize = Math.random() * 0.4 + 0.1;
        const textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES);

        // Simplified placement, no MIN_STAR_DISTANCE check for these few fill-ins to avoid infinite loops
        stars.push({ id, name: generateRandomName(), position: new THREE.Vector3(x, y, z), color: mixedColor.clone(), size: baseSize, textureIndex, planets: [] });
        tempPositions.push(x, y, z);
        tempColors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        tempSizes.push(baseSize);
        currentStarCounter++;
    }

    return {
        stars,
        positions: new Float32Array(tempPositions),
        colors: new Float32Array(tempColors),
        sizes: new Float32Array(tempSizes)
    };
};