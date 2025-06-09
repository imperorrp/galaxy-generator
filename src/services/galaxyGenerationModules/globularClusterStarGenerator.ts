import * as THREE from 'three';
import type { StarData } from '../../types/galaxy';
import {
    NUM_STARS, // Used for currentStarCounter check
    GALAXY_RADIUS,
    NUM_GLOBULAR_CLUSTERS,
    GLOBULAR_CLUSTER_RADIUS_MIN,
    GLOBULAR_CLUSTER_RADIUS_MAX,
    GLOBULAR_CLUSTER_DENSITY_POWER,
    GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR,
    GLOBULAR_CLUSTER_POSITION_RADIUS_MAX_FACTOR,
    NUM_COMMON_STAR_TEXTURES
} from '../../config/galaxyConfig';
import { generateRandomName } from './nameGenerator';

interface GlobularClusterStarGeneratorParams {
    starsPerCluster: number;
    stars: StarData[];
    tempPositions: number[];
    tempColors: number[];
    tempSizes: number[];
    currentStarCounter: number;
    minStarDistanceSquared: number;
    maxPlacementAttempts: number;
}

export const generateGlobularClusterStars = ({
    starsPerCluster,
    stars,
    tempPositions,
    tempColors,
    tempSizes,
    currentStarCounter,
    minStarDistanceSquared,
    maxPlacementAttempts
}: GlobularClusterStarGeneratorParams): number => {
    let updatedStarCounter = currentStarCounter;

    if (starsPerCluster > 0 && NUM_GLOBULAR_CLUSTERS > 0) {
        for (let c = 0; c < NUM_GLOBULAR_CLUSTERS; c++) {
            const clusterOrbitRadius = GALAXY_RADIUS * (GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR + Math.random() * (GLOBULAR_CLUSTER_POSITION_RADIUS_MAX_FACTOR - GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR));
            const clusterPhi = Math.random() * Math.PI * 2;
            const clusterCostheta = (Math.random() - 0.5) * 2;
            const clusterSintheta = Math.sqrt(1 - clusterCostheta * clusterCostheta);
            const cx = clusterOrbitRadius * clusterSintheta * Math.cos(clusterPhi);
            const cz = clusterOrbitRadius * clusterSintheta * Math.sin(clusterPhi);
            const cy = clusterOrbitRadius * clusterCostheta;

            for (let s = 0; s < starsPerCluster; s++, updatedStarCounter++) {
                if (updatedStarCounter >= NUM_STARS) break;
                const id = `star-${updatedStarCounter}`;
                let x: number=0, y: number=0, z: number=0;
                let positionIsValid = false;
                let attempts = 0;

                while (!positionIsValid && attempts < maxPlacementAttempts) {
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
                        if (distSq < minStarDistanceSquared) { positionIsValid = false; break; }
                    }
                    if (!positionIsValid && attempts >= maxPlacementAttempts) { positionIsValid = true; }
                }

                const mixedColor = new THREE.Color().setHSL(Math.random() * 0.05 + 0.08, 0.7, 0.65); // Yellowish, old stars
                const baseSize = Math.random() * 0.5 + 0.2;
                const textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES);

                stars.push({ id, name: generateRandomName(), position: new THREE.Vector3(x, y, z), color: mixedColor.clone(), size: baseSize, textureIndex, planets: [] });
                tempPositions.push(x, y, z);
                tempColors.push(mixedColor.r, mixedColor.g, mixedColor.b);
                tempSizes.push(baseSize);
            }
            if (updatedStarCounter >= NUM_STARS) break;
        }
    }
    return updatedStarCounter;
};