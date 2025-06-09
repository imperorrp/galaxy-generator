import { useMemo, useRef, Fragment, useEffect, useState } from 'react'; // useState moved for consistency, will be removed if not used elsewhere
import { useCameraDynamics } from '../../hooks/useCameraDynamics';
import { useGalaxyLOD } from '../../hooks/useGalaxyLOD'; // Import the new hook
import { useTextureAnisotropy } from '../../hooks/useTextureAnisotropy'; // Import the new hook
import * as THREE from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'; // Added useThree
import { PointMaterial, Html, Stars as DreiStars, useTexture } from '@react-three/drei';
import { generateGalaxyData } from '../../services/galaxyService';
import { GALAXY_RADIUS } from '../../config/galaxyConfig';
import type { StarData } from '../../types/galaxy';
import {
    NUM_COMMON_STAR_TEXTURES,
    NUM_RARE_STAR_TEXTURES,
    LOD_THRESHOLDS_CONFIG,
    STAR_SIZE_LOD_CONFIG
} from '../../config/galaxyConfig'; // Import from config
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

// const NUM_COMMON_STAR_TEXTURES = 7; // Remove local declaration
// const NUM_RARE_STAR_TEXTURES = 5; // Remove local declaration
const NUM_STAR_TEXTURES = NUM_COMMON_STAR_TEXTURES + NUM_RARE_STAR_TEXTURES;

const commonStarTexturePaths = Array.from({ length: NUM_COMMON_STAR_TEXTURES }, (_, i) => `/assets/textures/stars/star_${i}.png`);
const rareStarTexturePaths = Array.from({ length: NUM_RARE_STAR_TEXTURES }, (_, i) => `/assets/textures/stars/star_${String.fromCharCode(97 + i)}.png`); // star_a, star_b, ...
const starTexturePaths = [...commonStarTexturePaths, ...rareStarTexturePaths];

const nebulaTexturePaths = Array.from({ length: NUM_NEBULA_TEXTURES }, (_, i) => `/assets/textures/nebulae/nebula_${i + 1}.png`);

// const ROTATION_SPEED_THRESHOLD = 1.5; // Original threshold, now replaced by hysteresis

import NebulaCloud from './NebulaCloud'; // Import the NebulaCloud component
import StarPoints from './StarPoints';
import NebulaRenderer from './NebulaRenderer';

interface HoveredStarInfo {
    name: string;
    position: THREE.Vector3;
}

interface GalaxyViewProps {
    onStarSelect: (starData: StarData) => void;
    manualLodOverride?: number | null;
    isLodManual?: boolean;
    onLodLevelChange?: (level: number) => void;
    userRequestedOptimizedMode?: boolean; // New prop to control optimized mode from parent
    onOptimizedModeChange?: (isActive: boolean) => void; // Renamed from onHighSpeedModeChange
    onPerformanceMetricsChange?: (metrics: { frameTime: number; angularSpeed: number; }) => void; // Removed enterThreshold
}

const GalaxyView: React.FC<GalaxyViewProps> = ({ onStarSelect, manualLodOverride, isLodManual, onLodLevelChange, userRequestedOptimizedMode, onOptimizedModeChange, onPerformanceMetricsChange }) => {
    const { gl, camera } = useThree();
    const { 
        isRotating, 
        isOptimizedMode, // Renamed from isHighSpeedMode
        smoothedAngularSpeed, 
        averageFrameTime
        // currentDynamicEnterThreshold is removed from useCameraDynamics
        // toggleOptimizedMode // This function is returned by useCameraDynamics but not directly used here; App.tsx will handle it.
    } = useCameraDynamics({ 
        onOptimizedModeChange,
        userRequestedOptimizedMode // Pass the prop to the hook
    });
    
    const galaxyData = useMemo(() => generateGalaxyData(), []);
    const allStarPositions = useMemo(() => galaxyData.stars.map(star => star.position), [galaxyData]);

    const { lodLevel, lodLevelChecked } = useGalaxyLOD({ 
        manualLodOverride, 
        isLodManual, 
        onLodLevelChange, 
        allStarPositions // Pass all star positions to the hook
    });

    const loadedStarTextures = useTexture(starTexturePaths);

    useTextureAnisotropy({ textures: loadedStarTextures, isRotating, isHighSpeedMode: isOptimizedMode, gl }); // Pass isOptimizedMode

    useEffect(() => {
        onPerformanceMetricsChange?.({
            frameTime: averageFrameTime,
            angularSpeed: smoothedAngularSpeed,
            // enterThreshold: currentDynamicEnterThreshold, // Removed
        });
    }, [averageFrameTime, smoothedAngularSpeed, onPerformanceMetricsChange]); // Removed currentDynamicEnterThreshold from dependencies

    const starGroups = useMemo(() => {
        const groups: Array<{ stars: StarData[], positions: Float32Array, colors: Float32Array, textureIndex: number }> = [];
        for (let i = 0; i < NUM_STAR_TEXTURES; i++) {
            const filteredStars = galaxyData.stars.filter(star => star.textureIndex === i);
            if (filteredStars.length === 0) continue;
            const positions = new Float32Array(filteredStars.length * 3);
            const colors = new Float32Array(filteredStars.length * 3);
            filteredStars.forEach((star, idx) => {
                positions[idx * 3] = star.position.x;
                positions[idx * 3 + 1] = star.position.y;
                positions[idx * 3 + 2] = star.position.z;
                colors[idx * 3] = star.color.r;
                colors[idx * 3 + 1] = star.color.g;
                colors[idx * 3 + 2] = star.color.b;
            });
            groups.push({ stars: filteredStars, positions, colors, textureIndex: i });
        }
        return groups;
    }, [galaxyData]);

    const [hoveredStar, setHoveredStar] = useState<HoveredStarInfo | null>(null);
    const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
    
    // lodLevelChecked is now provided by useGalaxyLOD hook

    const handleStarHover = (starData: StarData | null, position: THREE.Vector3 | null) => {
        if (starData && position) {
            setHoveredStar({ name: starData.name, position: position.clone() });
            document.body.style.cursor = 'pointer';
        } else {
            setHoveredStar(null);
            document.body.style.cursor = 'auto';
        }
    };

    const handleStarClick = (starData: StarData) => {
        setSelectedStar(starData);
        onStarSelect(starData);
        console.log('Selected Star:', starData);
    };

    return (
        <>
            <StarPoints 
                starGroups={starGroups}
                loadedStarTextures={loadedStarTextures}
                lodLevel={lodLevelChecked}
                isHighSpeedMode={isOptimizedMode} // Renamed to isOptimizedMode
                onStarHover={handleStarHover}
                onStarClick={handleStarClick}
            />

            <NebulaRenderer 
                nebulaTexturePaths={nebulaTexturePaths}
                lodLevel={lodLevel}
                isLodManual={isLodManual ?? false}
                manualLodOverride={manualLodOverride}
                isHighSpeedMode={isOptimizedMode} // Renamed to isOptimizedMode
            />

            {/* Background Stars (Distant) */}
            <DreiStars radius={GALAXY_RADIUS * 2} depth={50} count={10000} factor={10} saturation={0} fade speed={isOptimizedMode ? 5 : 1} /> {/* Renamed to isOptimizedMode */}

            {/* Hovered Star Info */}
            {hoveredStar && !selectedStar && (
                <Html position={hoveredStar.position}>
                    <div style={{
                        color: 'white',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        transform: 'translate(-50%, -150%)' // Adjust to position above the star
                    }}>
                        {hoveredStar.name}
                    </div>
                </Html>
            )}
        </>
    );
};

export default GalaxyView;