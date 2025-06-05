import { useMemo, useRef, useState, Fragment } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { PointMaterial, Html, Stars as DreiStars, useTexture } from '@react-three/drei';
import { generateGalaxyData, GALAXY_RADIUS } from '../../services/galaxyService';
import type { StarData } from '../../types/galaxy';
import { NUM_COMMON_STAR_TEXTURES, NUM_RARE_STAR_TEXTURES } from '../../config/galaxyConfig'; // Import from config

// const NUM_COMMON_STAR_TEXTURES = 7; // Remove local declaration
// const NUM_RARE_STAR_TEXTURES = 5; // Remove local declaration
const NUM_STAR_TEXTURES = NUM_COMMON_STAR_TEXTURES + NUM_RARE_STAR_TEXTURES;

const commonStarTexturePaths = Array.from({ length: NUM_COMMON_STAR_TEXTURES }, (_, i) => `/assets/textures/stars/star_${i}.png`);
const rareStarTexturePaths = Array.from({ length: NUM_RARE_STAR_TEXTURES }, (_, i) => `/assets/textures/stars/star_${String.fromCharCode(97 + i)}.png`); // star_a, star_b, ...
const starTexturePaths = [...commonStarTexturePaths, ...rareStarTexturePaths];
import NebulaCloud from './NebulaCloud'; // Import the NebulaCloud component

interface HoveredStarInfo {
    name: string;
    position: THREE.Vector3;
}

interface GalaxyViewProps {
    onStarSelect: (starData: StarData) => void;
}

const GalaxyView: React.FC<GalaxyViewProps> = ({ onStarSelect }) => {
    const galaxyData = useMemo(() => generateGalaxyData(), []);
    // const pointsRef = useRef<THREE.Points>(null!); // Will need an array of refs if individual control is needed later
    const loadedStarTextures = useTexture(starTexturePaths);

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

    const pointsRef = useRef<THREE.Points>(null!); // This ref is not used with multiple points groups currently
    const [hoveredStar, setHoveredStar] = useState<HoveredStarInfo | null>(null);
    const [selectedStar, setSelectedStar] = useState<StarData | null>(null);

    // Optional: Add a slight rotation to the galaxy for visual effect
    // useFrame((_state, delta) => {
    //     // If rotating, apply to each group or a parent group
    // });

    const handlePointerOver = (event: ThreeEvent<PointerEvent>, groupStars: StarData[]) => {
        event.stopPropagation();
        if (event.index !== undefined && groupStars) {
            const starData = groupStars[event.index];
            if (starData) {
                setHoveredStar({
                    name: starData.name,
                    position: starData.position.clone(), // Clone to avoid modifying original data
                });
                document.body.style.cursor = 'pointer';
            }
        }
    };

    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHoveredStar(null);
        document.body.style.cursor = 'auto';
    };

    const handleClick = (event: ThreeEvent<MouseEvent>, groupStars: StarData[]) => {
        event.stopPropagation();
        if (event.index !== undefined && groupStars) {
            const starData = groupStars[event.index];
            if (starData) {
                setSelectedStar(starData); // Keep local state for info display if needed
                onStarSelect(starData); // Call the handler passed from App.tsx
                console.log('Selected Star:', starData);
            }
        }
    };
    
    // We can use onPointerMove to update the position of the Html if needed, 
    // but for now, placing it at the star's fixed position is fine.

    return (
        <>
            {starGroups.map((group, groupIndex) => (
                <points
                    key={groupIndex}
                    // ref={el => pointsRefs.current[groupIndex] = el} // Example if array of refs is needed
                    onPointerOver={(e) => handlePointerOver(e, group.stars)}
                    onPointerOut={handlePointerOut} // No group specific data needed for pointer out
                    onClick={(e) => handleClick(e, group.stars)}
                >
                    <bufferGeometry attach="geometry">
                        <bufferAttribute
                            attach="attributes-position"
                            args={[group.positions, 3]}
                        />
                        <bufferAttribute
                            attach="attributes-color"
                            args={[group.colors, 3]}
                        />
                    </bufferGeometry>
                    <PointMaterial
                        transparent
                        vertexColors
                        size={15} // Increased size slightly for better visibility
                        sizeAttenuation={true}
                        depthWrite={false}
                        alphaTest={0.01} // Helps with transparency artifacts
                        blending={THREE.AdditiveBlending} // Brighter, more star-like appearance
                        map={loadedStarTextures[group.textureIndex % loadedStarTextures.length]} // Apply the texture for this group
                    />
                </points>
            ))}
            {hoveredStar && (
                <Html position={hoveredStar.position} distanceFactor={100}>
                    <div style={{
                        padding: '2px 8px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        transform: 'translate(-50%, -150%)' // Adjust to position above the star
                    }}>
                        {hoveredStar.name}
                    </div>
                </Html>
            )}
            {/* Placeholder for selected star info - to be replaced by a proper UI panel */}
            {selectedStar && (
                 <Html position={[0, - GALAXY_RADIUS / 2, 0]} center>
                    <div style={{
                        padding: '10px',
                        background: 'rgba(50, 50, 50, 0.8)',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '14px',
                        border: '1px solid white',
                        minWidth: '200px'
                    }}>
                        <h3>Selected Star:</h3>
                        <p>Name: {selectedStar.name}</p>
                        <p>ID: {selectedStar.id}</p>
                        <p>Position: {selectedStar.position.toArray().map(p => p.toFixed(2)).join(', ')}</p>
                        <p>Planets: {selectedStar.planets.length}</p>
                    </div>
                </Html>
            )}
            {/* Optional: Add background stars for a distant starfield effect */}
            <DreiStars 
                radius={GALAXY_RADIUS * 2} // Adjust radius to be larger than the main galaxy
                depth={50} 
                count={5000} 
                factor={4} 
                saturation={0} 
                fade 
                speed={1} 
            />

            {/* Add Nebula Clouds for visual enhancement - Temporarily Disabled */}
            {/* <NebulaCloud 
                textureUrl="/assets/textures/nebula1.png" 
                position={[-GALAXY_RADIUS * 0.3, GALAXY_RADIUS * 0.1, -GALAXY_RADIUS * 0.5]} 
                scale={[GALAXY_RADIUS * 0.8, GALAXY_RADIUS * 0.6, 1]} 
                rotation={[0, 0, Math.PI / 8]}
                opacity={0.35}
                spinSpeed={0.003}
            />
            <NebulaCloud 
                textureUrl="/assets/textures/nebula2.png" 
                position={[GALAXY_RADIUS * 0.4, -GALAXY_RADIUS * 0.2, GALAXY_RADIUS * 0.3]} 
                scale={[GALAXY_RADIUS * 0.9, GALAXY_RADIUS * 0.7, 1]} 
                rotation={[0, 0, -Math.PI / 6]}
                opacity={0.4}
                spinSpeed={-0.002}
            />
            <NebulaCloud 
                textureUrl="/assets/textures/nebula3.png" 
                position={[0, GALAXY_RADIUS * 0.3, GALAXY_RADIUS * 0.6]} 
                scale={[GALAXY_RADIUS * 0.7, GALAXY_RADIUS * 0.5, 1]} 
                rotation={[0, Math.PI / 2, Math.PI / 4]}
                opacity={0.3}
                spinSpeed={0.004}
            /> */}
        </>
    );
};

export default GalaxyView;