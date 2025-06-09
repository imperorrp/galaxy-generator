import type { PlanetData } from '../types/galaxy';

export const MIN_PLANETS_PER_SYSTEM = 3;
export const MAX_PLANETS_PER_SYSTEM = 8;

export const PLANET_TYPES: PlanetData['type'][] = [
    'terrestrial',
    'gas_giant',
    'ice',
    'desert',
    'volcanic',
    'oceanic',
    'barren'
];

export const MIN_PLANET_SIZE = 0.5;
export const MAX_PLANET_SIZE = 2.5;

// For orbitRadius: (i + 1) * (Math.random() * ORBIT_RADIUS_RANDOM_FACTOR + ORBIT_RADIUS_BASE_MIN)
// Example: (i + 1) * (Math.random() * 5 + 5) means ORBIT_RADIUS_BASE_MIN = 5, ORBIT_RADIUS_RANDOM_FACTOR = 5
export const ORBIT_RADIUS_BASE_MIN = 5;
export const ORBIT_RADIUS_RANDOM_FACTOR = 5;

export const MIN_PLANET_ORBIT_SPEED = 0.001;
export const MAX_PLANET_ORBIT_SPEED = 0.006;