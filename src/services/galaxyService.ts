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
    GALAXY_PARAMS
} from '../config/galaxyConfig';

// export const GALAXY_RADIUS = 1000; // Moved to config

// Helper function to generate a random name (simple version)
const generateRandomName = (): string => {
  const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
  const suffixes = ['Centauri', 'Reticuli', 'Orionis', 'Draconis', 'Lyrae', 'Cygnus', 'Aquilae', 'Pegasi'];
  const numbers = Math.floor(Math.random() * 1000);
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${numbers}`;
};

// Helper to generate some placeholder planets for a star
const generatePlanets = (starId: string): PlanetData[] => {
    const numPlanets = Math.floor(Math.random() * (MAX_PLANETS_PER_SYSTEM - MIN_PLANETS_PER_SYSTEM + 1)) + MIN_PLANETS_PER_SYSTEM;
    const planets: PlanetData[] = [];

    for (let i = 0; i < numPlanets; i++) {
        planets.push({
            id: `${starId}-p${i}`,
            name: `Planet ${String.fromCharCode(65 + i)}`,
            type: PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)],
            size: Math.random() * (MAX_PLANET_SIZE - MIN_PLANET_SIZE) + MIN_PLANET_SIZE,
            orbitRadius: (i + 1) * (Math.random() * ORBIT_RADIUS_RANDOM_FACTOR + ORBIT_RADIUS_BASE_MIN),
            orbitSpeed: Math.random() * (MAX_PLANET_ORBIT_SPEED - MIN_PLANET_ORBIT_SPEED) + MIN_PLANET_ORBIT_SPEED,
            color: new THREE.Color(Math.random() * 0xffffff).getHexString(),
        });
    }
    return planets;
};

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
    const numHaloStars = Math.floor(NUM_STARS * HALO_STAR_FRACTION);
    const numGlobularClusterStarsTotal = NUM_STARS - numMainGalaxyStars - numHaloStars;
    const starsPerCluster = numGlobularClusterStarsTotal > 0 && NUM_GLOBULAR_CLUSTERS > 0
        ? Math.floor(numGlobularClusterStarsTotal / NUM_GLOBULAR_CLUSTERS)
        : 0;

    let currentStarCounter = 0; // Tracks total stars generated across all types

    // 1. Generate Main Galaxy Stars
    for (let i = 0; i < numMainGalaxyStars; i++, currentStarCounter++) {
        const id = `star-${currentStarCounter}`;
        let x: number = 0, y: number = 0, z: number = 0;
        let starPrimaryRadius: number = 0;
        let starTypeGenerated: 'bar' | 'bulge' | 'arm' | 'disk_general' = 'disk_general';
        let positionIsValid = false;
        let attempts = 0;

        while (!positionIsValid && attempts < MAX_PLACEMENT_ATTEMPTS) {
            attempts++;
            const typeRoll = Math.random();

            if (typeRoll < 0.15) {
                starTypeGenerated = 'bar';
                const fuzzinessFactor = 1.5;
                const barPosFactor = Math.pow(Math.random(), 1.5);
                x = (Math.random() - 0.5) * 2 * actualBarLength * barPosFactor;
                z = (Math.random() - 0.5) * 2 * actualBarWidth * (1 + (Math.random() - 0.5) * (fuzzinessFactor -1));
                y = (Math.random() - 0.5) * 2 * actualBarWidth * GALAXY_PARAMS.centralBarYScale * (1 + (Math.random() - 0.5) * (fuzzinessFactor -1));
                starPrimaryRadius = Math.sqrt(x*x + z*z);
            } else if (typeRoll < 0.35) {
                starTypeGenerated = 'bulge';
                let r_bulge = Math.pow(Math.random(), GALAXY_PARAMS.bulgeDensityPower) * actualBulgeRadius;
                if (r_bulge < actualBarLength * 0.6) {
                    r_bulge = actualBarLength * 0.6 + Math.random() * (actualBulgeRadius - actualBarLength * 0.6);
                }
                starPrimaryRadius = Math.max(r_bulge, actualBarLength * 0.5);
                starPrimaryRadius = Math.min(starPrimaryRadius, actualBulgeRadius);
                const phi = Math.random() * Math.PI * 2;
                const costheta = Math.random() * 2 - 1;
                const theta = Math.acos(costheta);
                x = starPrimaryRadius * Math.sin(theta) * Math.cos(phi);
                z = starPrimaryRadius * Math.sin(theta) * Math.sin(phi);
                y = starPrimaryRadius * Math.cos(theta) * GALAXY_PARAMS.bulgeYScale;
            } else if (typeRoll < 0.85) {
                starTypeGenerated = 'arm';
                starPrimaryRadius = actualBarLength + Math.pow(Math.random(), 1.8) * (GALAXY_RADIUS - actualBarLength);
                starPrimaryRadius = Math.min(starPrimaryRadius, GALAXY_RADIUS);
                const armIndex = i % GALAXY_PARAMS.numArms;
                const effectiveRadiusForSpiral = Math.max(0, starPrimaryRadius - actualBarLength);
                const normalizedEffectiveRadius = Math.min(1, effectiveRadiusForSpiral / (GALAXY_RADIUS - actualBarLength));
                const baseAngle = normalizedEffectiveRadius * GALAXY_PARAMS.spiralTightness * GALAXY_PARAMS.spiralAngleFactor;
                let armAngleOffset = (armIndex / GALAXY_PARAMS.numArms) * Math.PI * 2;
                let taperFactorArm = Math.max(0.15, 1.0 - normalizedEffectiveRadius * 0.85);
                let currentArmWidthArm = actualArmWidth * taperFactorArm;
                if (Math.random() < GALAXY_PARAMS.subArmChance) {
                    armAngleOffset += (Math.random() - 0.5) * GALAXY_PARAMS.subArmAngleOffsetRange;
                    currentArmWidthArm *= GALAXY_PARAMS.subArmScatterFactor;
                }
                const totalAngle = baseAngle + armAngleOffset;
                const scatterMagnitude = Math.pow(Math.random(), GALAXY_PARAMS.armPointDensityPower) * currentArmWidthArm;
                const randomScatterX = scatterMagnitude * (Math.random() - 0.5) * 2;
                const randomScatterZ = scatterMagnitude * (Math.random() - 0.5) * 2;
                const rotatedScatterX = randomScatterX * Math.cos(totalAngle) - randomScatterZ * Math.sin(totalAngle);
                const rotatedScatterZ = randomScatterX * Math.sin(totalAngle) + randomScatterZ * Math.cos(totalAngle);
                x = Math.cos(totalAngle) * starPrimaryRadius + rotatedScatterX;
                z = Math.sin(totalAngle) * starPrimaryRadius + rotatedScatterZ;
                y = (Math.random() - 0.5) * 2 * currentArmWidthArm * GALAXY_PARAMS.diskYScaleForArms;
            } else {
                starTypeGenerated = 'disk_general';
                starPrimaryRadius = actualBulgeRadius + Math.random() * (GALAXY_RADIUS - actualBulgeRadius);
                starPrimaryRadius = Math.min(starPrimaryRadius, GALAXY_RADIUS);
                const angle = Math.random() * Math.PI * 2;
                x = Math.cos(angle) * starPrimaryRadius;
                z = Math.sin(angle) * starPrimaryRadius;
                const diskRadiusRatio = Math.max(0, Math.min(1, (starPrimaryRadius - actualBulgeRadius) / (GALAXY_RADIUS - actualBulgeRadius)));
                const taperFactorDisk = Math.max(0.15, 1.0 - diskRadiusRatio * 0.85);
                const baseThicknessAtInnerDisk = GALAXY_RADIUS * GALAXY_PARAMS.diskStarYScale;
                y = (Math.random() - 0.5) * 2 * baseThicknessAtInnerDisk * taperFactorDisk;
            }

            const noiseFactor = 0.02;
            x += (Math.random() - 0.5) * 2 * GALAXY_RADIUS * noiseFactor;
            y += (Math.random() - 0.5) * 2 * GALAXY_RADIUS * noiseFactor * 0.5;
            z += (Math.random() - 0.5) * 2 * GALAXY_RADIUS * noiseFactor;

            const distSqXZ_clamp = x * x + z * z;
            if (distSqXZ_clamp > GALAXY_RADIUS * GALAXY_RADIUS) {
                const scale = GALAXY_RADIUS / Math.sqrt(distSqXZ_clamp);
                x *= scale;
                z *= scale;
            }
            let maxYMagnitude_clamp;
            switch (starTypeGenerated) {
                case 'bar': maxYMagnitude_clamp = actualBarWidth * GALAXY_PARAMS.centralBarYScale * 1.3; break;
                case 'bulge': maxYMagnitude_clamp = actualBulgeRadius * GALAXY_PARAMS.bulgeYScale * 0.8; break;
                case 'arm':
                    const normalizedEffRadForArmY = Math.min(1, Math.max(0, starPrimaryRadius - actualBarLength) / (GALAXY_RADIUS - actualBarLength));
                    const taperFactorForArmY = Math.max(0.15, 1.0 - normalizedEffRadForArmY * 0.85);
                    maxYMagnitude_clamp = actualArmWidth * taperFactorForArmY * GALAXY_PARAMS.diskYScaleForArms * 1.8; break;
                case 'disk_general': default:
                    const diskRadiusRatio_clamp = Math.max(0, Math.min(1, (starPrimaryRadius - actualBulgeRadius) / (GALAXY_RADIUS - actualBulgeRadius)));
                    const taperFactorDisk_clamp = Math.max(0.15, 1.0 - diskRadiusRatio_clamp * 0.85);
                    const baseThicknessAtInnerDisk_clamp = GALAXY_RADIUS * GALAXY_PARAMS.diskStarYScale;
                    maxYMagnitude_clamp = baseThicknessAtInnerDisk_clamp * taperFactorDisk_clamp * 1.5; break;
            }
            if (Math.abs(y) > maxYMagnitude_clamp) {
                y = Math.sign(y) * maxYMagnitude_clamp * (0.7 + Math.random() * 0.3);
            }

            positionIsValid = true;
            for (let k = 0; k < stars.length; k++) {
                const dx_check = x - stars[k].position.x;
                const dy_check = y - stars[k].position.y;
                const dz_check = z - stars[k].position.z;
                const distSq = dx_check * dx_check + dy_check * dy_check + dz_check * dz_check;
                if (distSq < MIN_STAR_DISTANCE_SQUARED) { positionIsValid = false; break; }
            }
            if (!positionIsValid && attempts >= MAX_PLACEMENT_ATTEMPTS) { positionIsValid = true; }
        }

        const mixedColor = colorInside.clone();
        let lerpFactor;
        if (starTypeGenerated === 'bulge' || (starTypeGenerated === 'bar' && starPrimaryRadius < actualBulgeRadius * 0.7)) {
            lerpFactor = Math.min(starPrimaryRadius / (actualBulgeRadius * 0.8), 1.0) * 0.4;
        } else {
            // For arm, disk, or other general main galaxy stars
            // Make color transition start earlier and be more prominent
            const effectiveRadiusForColor = GALAXY_RADIUS * 0.75; // Transition completes at 75% of GALAXY_RADIUS
            lerpFactor = Math.min(starPrimaryRadius / effectiveRadiusForColor, 1.0);
        }
        mixedColor.lerp(colorOutside, lerpFactor);

        const probabilityCommon = 0.96;
        let textureIndex;
        if (Math.random() < probabilityCommon) {
            textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES);
        } else {
            textureIndex = NUM_COMMON_STAR_TEXTURES + Math.floor(Math.random() * NUM_RARE_STAR_TEXTURES);
        }
        let baseSize = Math.random() * 1.5 + 0.5;
        if (starTypeGenerated === 'bulge' || starTypeGenerated === 'bar') {
            baseSize *= 1.2;
        } else if (starTypeGenerated === 'arm') {
            const normalizedEffRadForArmSize = Math.min(1, Math.max(0, starPrimaryRadius - actualBarLength) / (GALAXY_RADIUS - actualBarLength));
            baseSize *= (1.1 - normalizedEffRadForArmSize * 0.3);
        }
        baseSize = Math.max(0.4, Math.min(baseSize, 2.5));

        stars.push({ id, name: generateRandomName(), position: new THREE.Vector3(x, y, z), color: mixedColor.clone(), size: baseSize, textureIndex, planets: generatePlanets(id) });
        tempPositions.push(x, y, z);
        tempColors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        tempSizes.push(baseSize);
    }

    // 2. Generate Halo Stars
    for (let i = 0; i < numHaloStars; i++, currentStarCounter++) {
        const id = `star-${currentStarCounter}`;
        let x: number =0, y: number=0, z: number=0; // Initialize to prevent potential unassigned usage
        let positionIsValid = false;
        let attempts = 0;

        while (!positionIsValid && attempts < MAX_PLACEMENT_ATTEMPTS) {
            attempts++;
            const radius = GALAXY_RADIUS * HALO_MIN_RADIUS_FACTOR + Math.pow(Math.random(), HALO_DENSITY_POWER) * GALAXY_RADIUS * (HALO_MAX_RADIUS_FACTOR - HALO_MIN_RADIUS_FACTOR);
            const phi = Math.random() * Math.PI * 2;
            const costheta = (Math.random() - 0.5) * 2;
            const sintheta = Math.sqrt(1 - costheta * costheta);
            x = radius * sintheta * Math.cos(phi);
            z = radius * sintheta * Math.sin(phi);
            y = radius * costheta * HALO_Y_SCALE;

            positionIsValid = true;
            for (let k = 0; k < stars.length; k++) {
                const dx_check = x - stars[k].position.x;
                const dy_check = y - stars[k].position.y;
                const dz_check = z - stars[k].position.z;
                const distSq = dx_check * dx_check + dy_check * dy_check + dz_check * dz_check;
                if (distSq < MIN_STAR_DISTANCE_SQUARED) { positionIsValid = false; break; }
            }
            if (!positionIsValid && attempts >= MAX_PLACEMENT_ATTEMPTS) { positionIsValid = true; }
        }

        const mixedColor = colorOutside.clone().lerp(colorInside, 0.05);
        const baseSize = Math.random() * 0.6 + 0.2;
        const textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES);

        stars.push({ id, name: generateRandomName(), position: new THREE.Vector3(x, y, z), color: mixedColor.clone(), size: baseSize, textureIndex, planets: [] });
        tempPositions.push(x, y, z);
        tempColors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        tempSizes.push(baseSize);
    }

    // 3. Generate Globular Clusters
    if (starsPerCluster > 0 && NUM_GLOBULAR_CLUSTERS > 0) {
        for (let c = 0; c < NUM_GLOBULAR_CLUSTERS; c++) {
            const clusterOrbitRadius = GALAXY_RADIUS * (GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR + Math.random() * (GLOBULAR_CLUSTER_POSITION_RADIUS_MAX_FACTOR - GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR));
            const clusterPhi = Math.random() * Math.PI * 2;
            const clusterCostheta = (Math.random() - 0.5) * 2;
            const clusterSintheta = Math.sqrt(1 - clusterCostheta * clusterCostheta);
            const cx = clusterOrbitRadius * clusterSintheta * Math.cos(clusterPhi);
            const cz = clusterOrbitRadius * clusterSintheta * Math.sin(clusterPhi);
            const cy = clusterOrbitRadius * clusterCostheta;

            for (let s = 0; s < starsPerCluster; s++, currentStarCounter++) {
                if (currentStarCounter >= NUM_STARS) break;
                const id = `star-${currentStarCounter}`;
                let x: number=0, y: number=0, z: number=0;
                let positionIsValid = false;
                let attempts = 0;

                while (!positionIsValid && attempts < MAX_PLACEMENT_ATTEMPTS) {
                    attempts++;
                    const starRelRadius = Math.pow(Math.random(), GLOBULAR_CLUSTER_DENSITY_POWER) * (Math.random() * (GLOBULAR_CLUSTER_RADIUS_MAX - GLOBULAR_CLUSTER_RADIUS_MIN) + GLOBULAR_CLUSTER_RADIUS_MIN);
                    const starRelPhi = Math.random() * Math.PI * 2;
                    const starRelCostheta = (Math.random() - 0.5) * 2;
                    const starRelSintheta = Math.sqrt(1 - starRelCostheta * starRelCostheta);
                    x = cx + starRelRadius * starRelSintheta * Math.cos(starRelPhi);
                    y = cy + starRelRadius * starRelCostheta;
                    z = cz + starRelRadius * starRelSintheta * Math.sin(starRelPhi);

                    positionIsValid = true;
                    for (let k = 0; k < stars.length; k++) {
                        const dx_check = x - stars[k].position.x;
                        const dy_check = y - stars[k].position.y;
                        const dz_check = z - stars[k].position.z;
                        const distSq = dx_check * dx_check + dy_check * dy_check + dz_check * dz_check;
                        if (distSq < MIN_STAR_DISTANCE_SQUARED) { positionIsValid = false; break; }
                    }
                    if (!positionIsValid && attempts >= MAX_PLACEMENT_ATTEMPTS) { positionIsValid = true; }
                }

                const mixedColor = new THREE.Color().setHSL(Math.random() * 0.05 + 0.08, 0.7, 0.65); // Yellowish, old stars
                const baseSize = Math.random() * 0.5 + 0.2;
                const textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES);

                stars.push({ id, name: generateRandomName(), position: new THREE.Vector3(x, y, z), color: mixedColor.clone(), size: baseSize, textureIndex, planets: [] });
                tempPositions.push(x, y, z);
                tempColors.push(mixedColor.r, mixedColor.g, mixedColor.b);
                tempSizes.push(baseSize);
            }
            if (currentStarCounter >= NUM_STARS) break;
        }
    }

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