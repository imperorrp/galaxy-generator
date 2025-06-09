import * as THREE from 'three';
import type { StarData } from '../../types/galaxy';
import {
    NUM_STARS, // Used for currentStarCounter check
    GALAXY_RADIUS,
    HALO_MIN_RADIUS_FACTOR,
    HALO_DENSITY_POWER,
    HALO_MAX_RADIUS_FACTOR,
    HALO_Y_SCALE,
    NUM_COMMON_STAR_TEXTURES
} from '../../config/galaxyConfig';
import { generateRandomName } from './nameGenerator';
import { generatePlanets } from './planetGenerator'; // Though planets are empty for halo

interface HaloStarGeneratorParams {
    numHaloStars: number;
    stars: StarData[];
    tempPositions: number[];
    tempColors: number[];
    tempSizes: number[];
    currentStarCounter: number;
    colorOutside: THREE.Color;
    colorInside: THREE.Color; // For lerping
    minStarDistanceSquared: number;
    maxPlacementAttempts: number;
}

export const generateHaloStars = ({
    numHaloStars,
    stars,
    tempPositions,
    tempColors,
    tempSizes,
    currentStarCounter,
    colorOutside,
    colorInside,
    minStarDistanceSquared,
    maxPlacementAttempts
}: HaloStarGeneratorParams): number => {
    let updatedStarCounter = currentStarCounter;

    for (let i = 0; i < numHaloStars; i++, updatedStarCounter++) {
        if (updatedStarCounter >= NUM_STARS) break; // Ensure we don't exceed total star count
        const id = `star-${updatedStarCounter}`;
        let x: number =0, y: number=0, z: number=0;
        let positionIsValid = false;
        let attempts = 0;
        let radius: number = 0;

        while (!positionIsValid && attempts < maxPlacementAttempts) {
            attempts++;
            radius = GALAXY_RADIUS * HALO_MIN_RADIUS_FACTOR + Math.pow(Math.random(), HALO_DENSITY_POWER) * GALAXY_RADIUS * (HALO_MAX_RADIUS_FACTOR - HALO_MIN_RADIUS_FACTOR);
            const phi = Math.random() * Math.PI * 2;
            const costheta = (Math.random() - 0.5) * 2;
            const sintheta = Math.sqrt(1 - costheta*costheta);
            x = radius * sintheta * Math.cos(phi);
            z = radius * sintheta * Math.sin(phi);
            y = radius * costheta * HALO_Y_SCALE;

            positionIsValid = true;
            for (let k = 0; k < stars.length; k++) {
                const dx_check = x - stars[k].position.x;
                const dy_check = y - stars[k].position.y;
                const dz_check = z - stars[k].position.z;
                const distSq = dx_check * dx_check + dy_check * dy_check + dz_check * dz_check;
                if (distSq < minStarDistanceSquared) { positionIsValid = false; break; }
            }
            if (!positionIsValid && attempts >= maxPlacementAttempts) { positionIsValid = true; } // Force placement
        }

        const lerpFactor = Math.min(1.0, (radius - GALAXY_RADIUS * HALO_MIN_RADIUS_FACTOR) / (GALAXY_RADIUS * (HALO_MAX_RADIUS_FACTOR - HALO_MIN_RADIUS_FACTOR) * 0.5));
        const mixedColor = colorOutside.clone().lerp(colorInside, 0.01 + lerpFactor * 0.05); // Very faint, mostly outside color
        const baseSize = Math.random() * 0.6 + 0.2; // Halo stars are generally small and dim
        const textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES);

        stars.push({ id, name: generateRandomName(), position: new THREE.Vector3(x, y, z), color: mixedColor.clone(), size: baseSize, textureIndex, planets: [] }); // Halo stars typically don't have planets
        tempPositions.push(x, y, z);
        tempColors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        tempSizes.push(baseSize);
    }
    return updatedStarCounter;
};