import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { PointMaterial, Html, Stars as DreiStars, useTexture } from '@react-three/drei';
import { generateGalaxyData, GALAXY_RADIUS } from '../../services/galaxyService';
import type { StarData } from '../../types/galaxy';
import NebulaCloud from './NebulaCloud'; // Import the NebulaCloud component

interface HoveredStarInfo {
    name: string;
    position: THREE.Vector3;
}

interface GalaxyViewProps {
    onStarSelect: (starData: StarData) => void;
}

const GalaxyView: React.FC<GalaxyViewProps> = ({ onStarSelect }) => {
    const { stars, positions, colors } = useMemo(() => generateGalaxyData(), []);
    const pointsRef = useRef<THREE.Points>(null!);
    const [hoveredStar, setHoveredStar] = useState<HoveredStarInfo | null>(null);
    const [selectedStar, setSelectedStar] = useState<StarData | null>(null);

    const starTexture = useTexture('/assets/textures/star_particle.png'); // Load star texture

    // Optional: Add a slight rotation to the galaxy for visual effect
    useFrame((_state /*, delta */) => {
        if (pointsRef.current) {
            // pointsRef.current.rotation.y += delta * 0.01; // Keep rotation commented out for now
        }
    });

    const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        if (event.index !== undefined) {
            const starIndex = event.index;
            const starData = stars[starIndex];
            if (starData) {
                setHoveredStar({
                    name: starData.name,
                    position: starData.position.clone(), // Clone to avoid modifying original data
                });
                // Optionally change cursor style
                document.body.style.cursor = 'pointer';
            }
        }
    };

    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHoveredStar(null);
        // Reset cursor style
        document.body.style.cursor = 'auto';
    };

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        if (event.index !== undefined) {
            const starIndex = event.index;
            const starData = stars[starIndex];
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
            <points 
                ref={pointsRef}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
                // onPointerMove={handlePointerMove} // If more precise tracking is needed
            >
                <bufferGeometry attach="geometry">
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[colors, 3]}
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
                    map={starTexture} // Apply the texture to the points
                />
            </points>
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