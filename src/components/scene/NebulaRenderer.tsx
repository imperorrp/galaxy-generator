import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GALAXY_RADIUS } from '../../config/galaxyConfig';
import {
    NUM_NEBULA_TEXTURES,
    NEBULA_LOD_CONFIG,
    NUM_NEBULAE_TO_GENERATE,
    GALACTIC_PLANE_THICKNESS_FACTOR,
    NEBULA_RADIAL_DIST_POWER,
    NEBULA_MAX_RADIAL_FACTOR_OF_GALAXY_RADIUS_FRACTION,
    NEBULA_Y_DEVIATION_BIAS_CHANCE,
    NEBULA_Y_DEVIATION_BIAS_MULTIPLIER_MIN,
    NEBULA_Y_DEVIATION_BIAS_MULTIPLIER_RANDOM_ADD,
    NEBULA_BASE_SCALE_MIN_FACTOR,
    NEBULA_BASE_SCALE_RANDOM_FACTOR,
    NEBULA_ASPECT_RATIO_VARIATION_BASE,
    NEBULA_ASPECT_RATIO_VARIATION_RANDOM,
    NEBULA_ROTATION_XY_PLANE_MAX_RADIANS,
    NEBULA_OPACITY_BASE,
    NEBULA_OPACITY_RANDOM_FACTOR,
    NEBULA_MAX_ABSOLUTE_SPIN_SPEED
} from '../../config/nebulaConfig';
import NebulaCloud from './NebulaCloud';

interface NebulaRendererProps {
    nebulaTexturePaths: string[];
    lodLevel: number;
    isLodManual: boolean;
    manualLodOverride?: number | null;
    isHighSpeedMode: boolean;
}

const NebulaRenderer: React.FC<NebulaRendererProps> = ({
    nebulaTexturePaths,
    lodLevel,
    isLodManual,
    manualLodOverride,
    isHighSpeedMode,
}) => {

    const baseGeneratedNebulae = useMemo(() => {
        const nebulae = [];
        const galacticPlaneThickness = GALAXY_RADIUS * GALACTIC_PLANE_THICKNESS_FACTOR;

        for (let i = 0; i < NUM_NEBULAE_TO_GENERATE; i++) {
            const textureUrl = nebulaTexturePaths[i % NUM_NEBULA_TEXTURES];

            const rFraction = Math.pow(Math.random(), NEBULA_RADIAL_DIST_POWER);
            const r = GALAXY_RADIUS * rFraction * NEBULA_MAX_RADIAL_FACTOR_OF_GALAXY_RADIUS_FRACTION;
            
            const theta = Math.random() * 2 * Math.PI;

            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);

            let y = (Math.random() - 0.5) * 2 * galacticPlaneThickness;
            if (Math.random() < NEBULA_Y_DEVIATION_BIAS_CHANCE) {
                y *= (NEBULA_Y_DEVIATION_BIAS_MULTIPLIER_MIN + Math.random() * NEBULA_Y_DEVIATION_BIAS_MULTIPLIER_RANDOM_ADD);
            }
            
            const baseScaleValue = GALAXY_RADIUS * (NEBULA_BASE_SCALE_MIN_FACTOR + Math.random() * NEBULA_BASE_SCALE_RANDOM_FACTOR);
            const scale = [
                baseScaleValue * (NEBULA_ASPECT_RATIO_VARIATION_BASE + Math.random() * NEBULA_ASPECT_RATIO_VARIATION_RANDOM),
                baseScaleValue * (NEBULA_ASPECT_RATIO_VARIATION_BASE + Math.random() * NEBULA_ASPECT_RATIO_VARIATION_RANDOM),
                1
            ] as [number, number, number];

            const rotationXYZ = [
                (Math.random() * 2 - 1) * NEBULA_ROTATION_XY_PLANE_MAX_RADIANS,
                Math.random() * Math.PI * 2,
                (Math.random() * 2 - 1) * NEBULA_ROTATION_XY_PLANE_MAX_RADIANS,
            ] as [number, number, number];

            const opacity = NEBULA_OPACITY_BASE + Math.random() * NEBULA_OPACITY_RANDOM_FACTOR;
            const spinSpeed = (Math.random() - 0.5) * 2 * NEBULA_MAX_ABSOLUTE_SPIN_SPEED;

            nebulae.push({
                key: `nebula-${i}`,
                textureUrl,
                position: [x, y, z] as [number, number, number],
                scale,
                rotation: rotationXYZ,
                opacity,
                spinSpeed,
            });
        }
        return nebulae;
    }, [nebulaTexturePaths]); // GALAXY_RADIUS and other configs are stable imports

    const processedNebulae = useMemo(() => {
        const currentLod = (isLodManual && manualLodOverride !== null && manualLodOverride !== undefined) 
                            ? manualLodOverride 
                            : lodLevel;
        const lodConfig = NEBULA_LOD_CONFIG[currentLod] || NEBULA_LOD_CONFIG[0];

        return baseGeneratedNebulae.map(neb => ({
            ...neb,
            opacity: (neb.opacity || 0.3) * lodConfig.opacityFactor,
        }));
    }, [baseGeneratedNebulae, lodLevel, isLodManual, manualLodOverride]);

    return (
        <>
            {processedNebulae.map(neb => (
                <NebulaCloud
                    key={neb.key}
                    textureUrl={neb.textureUrl}
                    position={neb.position}
                    scale={neb.scale}
                    opacity={neb.opacity}
                    isVisible={!isHighSpeedMode} // Nebulae are hidden in high-speed mode
                />
            ))}
        </>
    );
};

export default NebulaRenderer;