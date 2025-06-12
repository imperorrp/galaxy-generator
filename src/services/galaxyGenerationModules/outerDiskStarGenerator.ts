import * as THREE from 'three';
import type { StarData } from '../../types/galaxy';
import {
    NUM_COMMON_STAR_TEXTURES
} from '../../config/galaxyConfig';
import { generateRandomName } from './nameGenerator';

interface OuterDiskStarGeneratorParams {
    numOuterDiskStars: number;
    stars: StarData[];
    tempPositions: number[];
    tempColors: number[];
    tempSizes: number[];
    currentStarCounter: number;
    colorInside: THREE.Color;
    colorOutside: THREE.Color;
    minStarDistanceSquared: number;
    maxPlacementAttempts: number;
    galaxyRadius: number; // Added
    outerDiskMinRadiusFactor: number; // Added
    outerDiskMaxRadiusFactor: number; // Added
    outerDiskYScale: number; // Added
}

export const generateOuterDiskStars = ({
    numOuterDiskStars,
    stars,
    tempPositions,
    tempColors,
    tempSizes,
    currentStarCounter,
    colorInside,
    colorOutside,
    minStarDistanceSquared,
    maxPlacementAttempts,
    galaxyRadius,             // Added
    outerDiskMinRadiusFactor, // Added
    outerDiskMaxRadiusFactor, // Added
    outerDiskYScale           // Added
}: OuterDiskStarGeneratorParams): number => {
    let updatedStarCounter = currentStarCounter;

    for (let i = 0; i < numOuterDiskStars; i++, updatedStarCounter++) {
        const id = `star-${updatedStarCounter}`;
        let x: number = 0, y: number = 0, z: number = 0;
        let positionIsValid = false;
        let attempts = 0;
        let radius: number = 0;

        while (!positionIsValid && attempts < maxPlacementAttempts) {
            attempts++;
            radius = galaxyRadius * outerDiskMinRadiusFactor + Math.random() * galaxyRadius * (outerDiskMaxRadiusFactor - outerDiskMinRadiusFactor);
            const angle = Math.random() * Math.PI * 2;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            y = (Math.random() - 0.5) * 2 * galaxyRadius * outerDiskYScale;

            positionIsValid = true;
            for (let k = 0; k < stars.length; k++) {
                const dx_check = x - stars[k].position.x;
                const dy_check = y - stars[k].position.y;
                const dz_check = z - stars[k].position.z;
                const distSq = dx_check * dx_check + dy_check * dy_check + dz_check * dz_check;
                if (distSq < minStarDistanceSquared) { positionIsValid = false; break; }
            }
            if (!positionIsValid && attempts >= maxPlacementAttempts) { positionIsValid = true; } // Force placement if too many attempts
        }

        const lerpFactor = Math.min(1.0, (radius - galaxyRadius * outerDiskMinRadiusFactor) / (galaxyRadius * (outerDiskMaxRadiusFactor - outerDiskMinRadiusFactor) * 0.8));
        const mixedColor = colorOutside.clone().lerp(colorInside, 0.1 + lerpFactor * 0.1); // Slightly more varied than pure outside, leaning towards outside
        const baseSize = Math.random() * 0.8 + 0.3; // Generally smaller stars for the outer disk
        const textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES); // Mostly common stars

        stars.push({ id, name: generateRandomName(), position: new THREE.Vector3(x, y, z), color: mixedColor.clone(), size: baseSize, textureIndex, planets: [] });
        tempPositions.push(x, y, z);
        tempColors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        tempSizes.push(baseSize);
    }
    return updatedStarCounter;
};