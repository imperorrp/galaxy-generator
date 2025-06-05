import * as THREE from 'three';
import type { StarData, PlanetData } from '../types/galaxy';

const NUM_STARS = 1000; // Example number of stars
export const GALAXY_RADIUS = 500;

// Helper function to generate a random name (simple version)
const generateRandomName = (): string => {
  const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
  const suffixes = ['Centauri', 'Reticuli', 'Orionis', 'Draconis', 'Lyrae', 'Cygnus', 'Aquilae', 'Pegasi'];
  const numbers = Math.floor(Math.random() * 1000);
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${numbers}`;
};

// Helper to generate some placeholder planets for a star
const generatePlanets = (starId: string): PlanetData[] => {
    const numPlanets = Math.floor(Math.random() * 5) + 1; // 1 to 5 planets
    const planets: PlanetData[] = [];
    const planetTypes: PlanetData['type'][] = ['terrestrial', 'gas_giant', 'ice', 'desert', 'volcanic', 'oceanic', 'barren'];

    for (let i = 0; i < numPlanets; i++) {
        planets.push({
            id: `${starId}-p${i}`,
            name: `Planet ${String.fromCharCode(65 + i)}`,
            type: planetTypes[Math.floor(Math.random() * planetTypes.length)],
            size: Math.random() * 2 + 0.5, // 0.5 to 2.5
            orbitRadius: (i + 1) * (Math.random() * 5 + 5), // 5-10, 10-20, etc.
            orbitSpeed: Math.random() * 0.005 + 0.001,
            color: new THREE.Color(Math.random() * 0xffffff).getHexString(),
        });
    }
    return planets;
};

export interface GalaxyData {
    stars: StarData[];
    positions: Float32Array;
    colors: Float32Array;
    sizes: Float32Array; // Added for star sizes
}

export const generateGalaxyData = (): GalaxyData => {
    const stars: StarData[] = [];
    const positions = new Float32Array(NUM_STARS * 3);
    const colors = new Float32Array(NUM_STARS * 3);
    const sizes = new Float32Array(NUM_STARS); // Array for star sizes

    for (let i = 0; i < NUM_STARS; i++) {
        const id = `star-${i}`;
        const x = (Math.random() - 0.5) * 2 * GALAXY_RADIUS;
        const y = (Math.random() - 0.5) * 0.2 * GALAXY_RADIUS; // Flatter galaxy
        const z = (Math.random() - 0.5) * 2 * GALAXY_RADIUS;

        const position = new THREE.Vector3(x, y, z);
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.7 + Math.random() * 0.3, 0.5 + Math.random() * 0.3);

        stars.push({
            id,
            name: generateRandomName(),
            position,
            color,
            size: Math.random() * 2 + 1, // Example size
            planets: generatePlanets(id),
            isKeySystem: Math.random() < 0.01, // Mark 1% of stars as key systems
        });

        sizes[i] = stars[stars.length-1].isKeySystem ? 2.5 : 1.0; // Key systems are larger

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    return { stars, positions, colors, sizes };
};