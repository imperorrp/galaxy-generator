import * as THREE from 'three';
import type { StarData, PlanetData } from '../types/galaxy';
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
    GALAXY_PARAMS
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

export const generateGalaxyData = (): GalaxyData => {
    const MIN_STAR_DISTANCE = 25.0;
    const MIN_STAR_DISTANCE_SQUARED = MIN_STAR_DISTANCE * MIN_STAR_DISTANCE;
    const MAX_PLACEMENT_ATTEMPTS = 10;

    const stars: StarData[] = [];
    const tempPositions: number[] = [];
    const tempColors: number[] = [];
    const tempSizes: number[] = [];

    const colorInside = new THREE.Color(GALAXY_PARAMS.colorInHex);
    const colorOutside = new THREE.Color(GALAXY_PARAMS.colorOutHex);

    const actualBulgeRadius = GALAXY_RADIUS * GALAXY_PARAMS.bulgeSizeFactor;
    const actualArmWidth = GALAXY_PARAMS.armWidth;
    const actualBarLength = GALAXY_RADIUS * GALAXY_PARAMS.centralBarLengthFactor;
    const actualBarWidth = GALAXY_RADIUS * GALAXY_PARAMS.centralBarWidthFactor;

    const numMainGalaxyStars = Math.floor(NUM_STARS * MAIN_GALAXY_STAR_FRACTION);
    const numOuterDiskStars = Math.floor(NUM_STARS * OUTER_DISK_STAR_FRACTION); // Added
    const numHaloStars = Math.floor(NUM_STARS * HALO_STAR_FRACTION);
    const numGlobularClusterStarsTotal = NUM_STARS - numMainGalaxyStars - numHaloStars - numOuterDiskStars; // Adjusted
    const starsPerCluster = numGlobularClusterStarsTotal > 0 && NUM_GLOBULAR_CLUSTERS > 0
        ? Math.floor(numGlobularClusterStarsTotal / NUM_GLOBULAR_CLUSTERS)
        : 0;

    let currentStarCounter = 0; // Tracks total stars generated across all types

    // 1. Generate Main Galaxy Stars
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
        actualBarWidth
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
        maxPlacementAttempts: MAX_PLACEMENT_ATTEMPTS
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
        maxPlacementAttempts: MAX_PLACEMENT_ATTEMPTS
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
        maxPlacementAttempts: MAX_PLACEMENT_ATTEMPTS
    });

    // Ensure NUM_STARS are generated if fractions/rounding caused minor discrepancies
    // This loop is a fallback and ideally shouldn't run if counts are precise.
    while (currentStarCounter < NUM_STARS) {
        const id = `star-${currentStarCounter}`;
        // Generate as a generic distant halo star to fill up space
        const radius = GALAXY_RADIUS * (HALO_MAX_RADIUS_FACTOR * 0.8 + Math.random() * 0.4); // Outer halo
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