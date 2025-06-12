import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
    NUM_NEBULA_TEXTURES, // This is not configurable from UI, so keep import
    NEBULA_LOD_CONFIG // This is not configurable from UI, so keep import
} from '../../config/nebulaConfig';
import type { ConfigurableNebulaParams } from '../../types/galaxy';
import NebulaCloud from './NebulaCloud';

interface NebulaRendererProps {
    nebulaTexturePaths: string[];
    lodLevel: number;
    isLodManual: boolean;
    manualLodOverride?: number | null;
    isHighSpeedMode: boolean;
    config: ConfigurableNebulaParams; // Added config prop
    galaxyRadius: number; // Added galaxyRadius prop
}

const NebulaRenderer: React.FC<NebulaRendererProps> = ({
    nebulaTexturePaths,
    lodLevel,
    isLodManual,
    manualLodOverride,
    isHighSpeedMode,
    config,
    galaxyRadius,
}) => {

    const baseGeneratedNebulae = useMemo(() => {
        const nebulae = [];
        const galacticPlaneThickness = galaxyRadius * config.galacticPlaneThicknessFactor;

        for (let i = 0; i < config.numNebulaeToGenerate; i++) {
            const textureUrl = nebulaTexturePaths[i % NUM_NEBULA_TEXTURES]; // NUM_NEBULA_TEXTURES is fixed

            const rFraction = Math.pow(Math.random(), config.nebulaRadialDistPower);
            const r = galaxyRadius * rFraction * config.nebulaMaxRadialFactorOfGalaxyRadiusFraction;
            
            const theta = Math.random() * 2 * Math.PI;

            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);

            let y = (Math.random() - 0.5) * 2 * galacticPlaneThickness;
            if (Math.random() < config.nebulaYDeviationBiasChance) {
                y *= (config.nebulaYDeviationBiasMultiplierMin + Math.random() * config.nebulaYDeviationBiasMultiplierRandomAdd);
            }
            
            const baseScaleValue = galaxyRadius * (config.nebulaBaseScaleMinFactor + Math.random() * config.nebulaBaseScaleRandomFactor);
            const scale = [
                baseScaleValue * (config.nebulaAspectRatioVariationBase + Math.random() * config.nebulaAspectRatioVariationRandom),
                baseScaleValue * (config.nebulaAspectRatioVariationBase + Math.random() * config.nebulaAspectRatioVariationRandom),
                1 // Scale Z is 1 for a plane
            ] as [number, number, number];

            const rotationXYZ = [
                (Math.random() * 2 - 1) * config.nebulaRotationXYPlaneMaxRadians,
                Math.random() * Math.PI * 2, // Full Y rotation
                (Math.random() * 2 - 1) * config.nebulaRotationXYPlaneMaxRadians,
            ] as [number, number, number];

            const opacity = config.nebulaOpacityBase + Math.random() * config.nebulaOpacityRandomFactor;
            const spinSpeed = (Math.random() - 0.5) * 2 * config.nebulaMaxAbsoluteSpinSpeed;

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
    }, [nebulaTexturePaths, config, galaxyRadius]);

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