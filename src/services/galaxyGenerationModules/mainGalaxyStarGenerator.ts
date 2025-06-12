import * as THREE from 'three';
import type { StarData } from '../../types/galaxy';
import {
    NUM_COMMON_STAR_TEXTURES,
    NUM_RARE_STAR_TEXTURES
} from '../../config/galaxyConfig';
import { generateRandomName } from './nameGenerator';
import { generatePlanets } from './planetGenerator';

interface MainGalaxyStarGeneratorParams {
    numMainGalaxyStars: number;
    stars: StarData[];
    tempPositions: number[];
    tempColors: number[];
    tempSizes: number[];
    currentStarCounter: number;
    colorInside: THREE.Color;
    colorOutside: THREE.Color;
    minStarDistanceSquared: number;
    maxPlacementAttempts: number;
    actualBulgeRadius: number;
    actualArmWidth: number;
    actualBarLength: number;
    actualBarWidth: number;
    // Parameters from GALAXY_PARAMS, now passed directly
    galaxyRadius: number;
    numArms: number;
    spiralTightness: number;
    spiralAngleFactor: number;
    armPointDensityPower: number;
    diskYScaleForArms: number;
    subArmChance: number;
    subArmScatterFactor: number;
    subArmAngleOffsetRange: number;
    bulgeYScale: number;
    bulgeDensityPower: number;
    centralBarYScale: number;
    diskStarFraction: number; // Fraction of stars that are general disk stars (not strictly in arms)
    diskStarYScale: number;   // General disk stars Y scale
}

export const generateMainGalaxyStars = ({
    numMainGalaxyStars,
    stars,
    tempPositions,
    tempColors,
    tempSizes,
    currentStarCounter,
    colorInside,
    colorOutside,
    minStarDistanceSquared,
    maxPlacementAttempts,
    actualBulgeRadius,
    actualArmWidth,
    actualBarLength,
    actualBarWidth,
    // Parameters previously from GALAXY_PARAMS, now passed directly
    galaxyRadius, 
    numArms,
    spiralTightness,
    spiralAngleFactor,
    armPointDensityPower,
    diskYScaleForArms,
    subArmChance,
    subArmScatterFactor,
    subArmAngleOffsetRange,
    bulgeYScale,
    bulgeDensityPower,
    centralBarYScale,
    diskStarFraction, 
    diskStarYScale
}: MainGalaxyStarGeneratorParams): number => {
    let updatedStarCounter = currentStarCounter;

    for (let i = 0; i < numMainGalaxyStars; i++, updatedStarCounter++) {
        const id = `star-${updatedStarCounter}`;
        let x: number = 0, y: number = 0, z: number = 0;
        let starPrimaryRadius: number = 0;
        let starTypeGenerated: 'bar' | 'bulge' | 'arm' | 'disk_general' = 'disk_general';
        let positionIsValid = false;
        let attempts = 0;

        while (!positionIsValid && attempts < maxPlacementAttempts) {
            attempts++;
            const typeRoll = Math.random();

            if (typeRoll < 0.15) {
                starTypeGenerated = 'bar';
                const fuzzinessFactor = 1.5;
                const barPosFactor = Math.pow(Math.random(), 1.5);
                x = (Math.random() - 0.5) * 2 * actualBarLength * barPosFactor;
                z = (Math.random() - 0.5) * 2 * actualBarWidth * (1 + (Math.random() - 0.5) * (fuzzinessFactor -1));
                y = (Math.random() - 0.5) * 2 * actualBarWidth * centralBarYScale * (1 + (Math.random() - 0.5) * (fuzzinessFactor -1));
                starPrimaryRadius = Math.sqrt(x*x + z*z);
            } else if (typeRoll < 0.35) {
                starTypeGenerated = 'bulge';
                let r_bulge = Math.pow(Math.random(), bulgeDensityPower) * actualBulgeRadius;
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
                y = starPrimaryRadius * Math.cos(theta) * bulgeYScale;
            } else if (typeRoll < 0.85) {
                starTypeGenerated = 'arm';
                starPrimaryRadius = actualBarLength + Math.pow(Math.random(), 1.8) * (galaxyRadius - actualBarLength);
                starPrimaryRadius = Math.min(starPrimaryRadius, galaxyRadius);
                const armIndex = i % numArms;
                const effectiveRadiusForSpiral = Math.max(0, starPrimaryRadius - actualBarLength);
                const normalizedEffectiveRadius = Math.min(1, effectiveRadiusForSpiral / (galaxyRadius - actualBarLength));
                const baseAngle = normalizedEffectiveRadius * spiralTightness * spiralAngleFactor;
                let armAngleOffset = (armIndex / numArms) * Math.PI * 2;
                let taperFactorArm = Math.max(0.15, 1.0 - normalizedEffectiveRadius * 0.85);
                let currentArmWidthArm = actualArmWidth * taperFactorArm;
                if (Math.random() < subArmChance) {
                    armAngleOffset += (Math.random() - 0.5) * subArmAngleOffsetRange;
                    currentArmWidthArm *= subArmScatterFactor;
                }
                const totalAngle = baseAngle + armAngleOffset;
                const scatterMagnitude = Math.pow(Math.random(), armPointDensityPower) * currentArmWidthArm;
                const randomScatterX = scatterMagnitude * (Math.random() - 0.5) * 2;
                const randomScatterZ = scatterMagnitude * (Math.random() - 0.5) * 2;
                const rotatedScatterX = randomScatterX * Math.cos(totalAngle) - randomScatterZ * Math.sin(totalAngle);
                const rotatedScatterZ = randomScatterX * Math.sin(totalAngle) + randomScatterZ * Math.cos(totalAngle);
                x = Math.cos(totalAngle) * starPrimaryRadius + rotatedScatterX;
                z = Math.sin(totalAngle) * starPrimaryRadius + rotatedScatterZ;
                y = (Math.random() - 0.5) * 2 * currentArmWidthArm * diskYScaleForArms;
            } else {
                starTypeGenerated = 'disk_general';
                starPrimaryRadius = actualBulgeRadius + Math.random() * (galaxyRadius - actualBulgeRadius);
                starPrimaryRadius = Math.min(starPrimaryRadius, galaxyRadius);
                const angle = Math.random() * Math.PI * 2;
                x = Math.cos(angle) * starPrimaryRadius;
                z = Math.sin(angle) * starPrimaryRadius;
                const diskRadiusRatio = Math.max(0, Math.min(1, (starPrimaryRadius - actualBulgeRadius) / (galaxyRadius - actualBulgeRadius)));
                const taperFactorDisk = Math.max(0.15, 1.0 - diskRadiusRatio * 0.85);
                const baseThicknessAtInnerDisk = galaxyRadius * diskStarYScale;
                y = (Math.random() - 0.5) * 2 * baseThicknessAtInnerDisk * taperFactorDisk;
            }

            const noiseFactor = 0.02;
            x += (Math.random() - 0.5) * 2 * galaxyRadius * noiseFactor;
            y += (Math.random() - 0.5) * 2 * galaxyRadius * noiseFactor * 0.5;
            z += (Math.random() - 0.5) * 2 * galaxyRadius * noiseFactor;

            const distSqXZ_clamp = x * x + z * z;
            if (distSqXZ_clamp > galaxyRadius * galaxyRadius) {
                const scale = galaxyRadius / Math.sqrt(distSqXZ_clamp);
                x *= scale;
                z *= scale;
            }
            let maxYMagnitude_clamp;
            switch (starTypeGenerated) {
                case 'bar': maxYMagnitude_clamp = actualBarWidth * centralBarYScale * 1.3; break;
                case 'bulge': maxYMagnitude_clamp = actualBulgeRadius * bulgeYScale * 0.8; break;
                case 'arm':
                    const normalizedEffRadForArmY = Math.min(1, Math.max(0, starPrimaryRadius - actualBarLength) / (galaxyRadius - actualBarLength));
                    const taperFactorForArmY = Math.max(0.15, 1.0 - normalizedEffRadForArmY * 0.85);
                    maxYMagnitude_clamp = actualArmWidth * taperFactorForArmY * diskYScaleForArms * 1.8; break;
                case 'disk_general': default:
                    const diskRadiusRatio_clamp = Math.max(0, Math.min(1, (starPrimaryRadius - actualBulgeRadius) / (galaxyRadius - actualBulgeRadius)));
                    const taperFactorDisk_clamp = Math.max(0.15, 1.0 - diskRadiusRatio_clamp * 0.85);
                    const baseThicknessAtInnerDisk_clamp = galaxyRadius * diskStarYScale;
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
                if (distSq < minStarDistanceSquared) { positionIsValid = false; break; }
            }
            if (!positionIsValid && attempts >= maxPlacementAttempts) { positionIsValid = true; }
        }

        const mixedColor = colorInside.clone();
        let lerpFactor;
        if (starTypeGenerated === 'bulge' || (starTypeGenerated === 'bar' && starPrimaryRadius < actualBulgeRadius * 0.7)) {
            lerpFactor = Math.min(starPrimaryRadius / (actualBulgeRadius * 0.8), 1.0) * 0.4;
        } else {
            const effectiveRadiusForColor = galaxyRadius * 0.75;
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
            const normalizedEffRadForArmSize = Math.min(1, Math.max(0, starPrimaryRadius - actualBarLength) / (galaxyRadius - actualBarLength));
            baseSize *= (1.1 - normalizedEffRadForArmSize * 0.3);
        }
        baseSize = Math.max(0.4, Math.min(baseSize, 2.5));

        stars.push({ id, name: generateRandomName(), position: new THREE.Vector3(x, y, z), color: mixedColor.clone(), size: baseSize, textureIndex, planets: generatePlanets(id) });
        tempPositions.push(x, y, z);
        tempColors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        tempSizes.push(baseSize);
    }
    return updatedStarCounter;
};