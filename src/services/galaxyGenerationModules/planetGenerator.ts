import * as THREE from 'three';
import type { PlanetData } from '../../types/galaxy';
import {
    MIN_PLANETS_PER_SYSTEM,
    MAX_PLANETS_PER_SYSTEM,
    PLANET_TYPES,
    MIN_PLANET_SIZE,
    MAX_PLANET_SIZE,
    ORBIT_RADIUS_BASE_MIN,
    ORBIT_RADIUS_RANDOM_FACTOR,
    MIN_PLANET_ORBIT_SPEED,
    MAX_PLANET_ORBIT_SPEED
} from '../../config/planetConfig';

// Helper to generate some placeholder planets for a star
export const generatePlanets = (starId: string): PlanetData[] => {
    const numPlanets = Math.floor(Math.random() * (MAX_PLANETS_PER_SYSTEM - MIN_PLANETS_PER_SYSTEM + 1)) + MIN_PLANETS_PER_SYSTEM;
    const planets: PlanetData[] = [];

    for (let i = 0; i < numPlanets; i++) {
        planets.push({
            id: `${starId}-p${i}`,
            name: `Planet ${String.fromCharCode(65 + i)}`,
            type: PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)],
            size: Math.random() * (MAX_PLANET_SIZE - MIN_PLANET_SIZE) + MIN_PLANET_SIZE,
            orbitRadius: (i + 1) * (Math.random() * ORBIT_RADIUS_RANDOM_FACTOR + ORBIT_RADIUS_BASE_MIN),
            orbitSpeed: Math.random() * (MAX_PLANET_ORBIT_SPEED - MIN_PLANET_ORBIT_SPEED) + MIN_PLANET_ORBIT_SPEED,
            color: new THREE.Color(Math.random() * 0xffffff).getHexString(),
        });
    }
    return planets;
};