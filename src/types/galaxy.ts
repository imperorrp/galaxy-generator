import * as THREE from 'three';

export interface PlanetData {
    id: string;
    name: string;
    type: 'terrestrial' | 'gas_giant' | 'ice' | 'desert' | 'volcanic' | 'oceanic' | 'barren'; // Expanded types
    size: number; // relative to star or absolute
    orbitRadius: number;
    orbitSpeed: number;
    orbitInclination?: number; // Added for more varied orbits
    axialTilt?: number;
    rotationSpeed?: number;
    textureUrl?: string;
    color?: string; // fallback if no texture
    // ... resources, population etc.
}

export interface StarData {
    id: string;
    name: string;
    position: THREE.Vector3; // or [number, number, number] for serialization
    color: THREE.Color;      // or string hex
    size?: number;
    isKeySystem?: boolean;
    factionId?: string;
    planets: PlanetData[];
    textureIndex?: number; // Index for selecting star texture
    // ... other strategic properties
}