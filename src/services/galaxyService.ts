import * as THREE from 'three';
import type { StarData, PlanetData } from '../types/galaxy';
import { NUM_COMMON_STAR_TEXTURES, NUM_RARE_STAR_TEXTURES } from '../config/galaxyConfig';

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

// Spiral Galaxy Parameters
const NUM_ARMS = 2;
const ARM_SEPARATION_ANGLE = (2 * Math.PI) / NUM_ARMS;
const ARM_THICKNESS = GALAXY_RADIUS * 0.2; 
const ARM_LENGTH_FACTOR = 1.0; // Controls how far arms extend along the spiral curve relative to GALAXY_RADIUS
const SPIRAL_B = 0.35; // Tightness of the spiral (higher means tighter turns for a given change in r)
const BULGE_RATIO_STARS = 0.3; // 30% of stars in the bulge
const BULGE_RADIUS_XY = GALAXY_RADIUS * 0.20; // Radius of the bulge in XZ plane
const BULGE_RADIUS_Y = GALAXY_RADIUS * 0.10;  // Height of the bulge in Y axis
const SPIRAL_A = BULGE_RADIUS_XY; // Start radius of arms, from edge of bulge
const DISK_THICKNESS_Y = GALAXY_RADIUS * 0.025; // Thickness of the disk for arm stars

export const generateGalaxyData = (): GalaxyData => {
    const stars: StarData[] = [];
    const positions = new Float32Array(NUM_STARS * 3);
    const colors = new Float32Array(NUM_STARS * 3);
    const sizes = new Float32Array(NUM_STARS);

    // Calculate maxTheta for arm generation based on GALAXY_RADIUS
    // r = SPIRAL_A * exp(SPIRAL_B * theta) => GALAXY_RADIUS = SPIRAL_A * exp(SPIRAL_B * maxThetaArm)
    // maxThetaArm = ln(GALAXY_RADIUS / SPIRAL_A) / SPIRAL_B
    const maxThetaArm = (SPIRAL_A > 0 && SPIRAL_B > 0 && GALAXY_RADIUS > SPIRAL_A) ? Math.log(GALAXY_RADIUS / SPIRAL_A) / SPIRAL_B : Math.PI * 2;

    for (let i = 0; i < NUM_STARS; i++) {
        const id = `star-${i}`;
        let x, y, z;
        let isBulgeStarThisIteration = false;

        if (Math.random() < BULGE_RATIO_STARS) {
            isBulgeStarThisIteration = true;
            // Generate star in the central bulge (ellipsoidal distribution)
            let dx, dy, dz;
            do {
                dx = (Math.random() * 2 - 1) * BULGE_RADIUS_XY;
                dz = (Math.random() * 2 - 1) * BULGE_RADIUS_XY;
                dy = (Math.random() * 2 - 1) * BULGE_RADIUS_Y;
            } while ((dx * dx) / (BULGE_RADIUS_XY * BULGE_RADIUS_XY) +
                     (dz * dz) / (BULGE_RADIUS_XY * BULGE_RADIUS_XY) +
                     (dy * dy) / (BULGE_RADIUS_Y * BULGE_RADIUS_Y) > 1);
            x = dx;
            y = dy;
            z = dz;
        } else {
            // Generate star in a spiral arm
            const armIndex = Math.floor(Math.random() * NUM_ARMS);
            const armAngleOffset = armIndex * ARM_SEPARATION_ANGLE;

            // Angle along the spiral arm (theta for r = a*e^(b*theta))
            const theta = Math.random() * maxThetaArm * ARM_LENGTH_FACTOR;

            const rBase = SPIRAL_A * Math.exp(SPIRAL_B * theta);
            const finalAngle = theta + armAngleOffset;

            // Point on the arm's centerline
            const xSpiralCenter = rBase * Math.cos(finalAngle);
            const zSpiralCenter = rBase * Math.sin(finalAngle);

            // Add scatter to make the arm thicker (circular cross-section, denser towards center)
            const scatterAngleInArm = Math.random() * 2 * Math.PI;
            const scatterRadiusInArm = Math.sqrt(Math.random()) * ARM_THICKNESS;

            x = xSpiralCenter + scatterRadiusInArm * Math.cos(scatterAngleInArm);
            z = zSpiralCenter + scatterRadiusInArm * Math.sin(scatterAngleInArm);
            
            // Vertical position (disk thickness), concentrated towards y=0
            let y_rand_val = Math.random();
            y = Math.pow(y_rand_val, 2) * DISK_THICKNESS_Y * (Math.random() < 0.5 ? 1 : -1);
        }

        // Clamp positions to GALAXY_RADIUS to avoid stars too far out
        const distXZ = Math.sqrt(x * x + z * z);
        if (distXZ > GALAXY_RADIUS) {
            const scale = GALAXY_RADIUS / distXZ;
            x *= scale;
            z *= scale;
        }
        // Clamp y for extreme outliers
        const maxY = isBulgeStarThisIteration ? BULGE_RADIUS_Y * 1.1 : DISK_THICKNESS_Y * 1.5;
        if (Math.abs(y) > maxY) {
            y = Math.sign(y) * maxY * Math.random();
        }

        const position = new THREE.Vector3(x, y, z);
        const color = new THREE.Color();
        
        // Color variation based on location
        if (isBulgeStarThisIteration && position.length() < BULGE_RADIUS_XY * 0.6) { // Inner bulge
            color.setHSL(Math.random() * 0.1 + 0.05, 0.7 + Math.random() * 0.2, 0.6 + Math.random() * 0.2); // More yellowish/orange
        } else if (!isBulgeStarThisIteration && position.length() > SPIRAL_A * 1.2) { // Outer Arms
            color.setHSL(Math.random() * 0.2 + 0.55, 0.8 + Math.random() * 0.2, 0.7 + Math.random() * 0.1); // More bluish/white, brighter
        } else { // General / outer bulge / inner arms
            color.setHSL(Math.random(), 0.7 + Math.random() * 0.3, 0.5 + Math.random() * 0.3); // Default random
        }

        const totalStarTextures = NUM_COMMON_STAR_TEXTURES + NUM_RARE_STAR_TEXTURES;
        const probabilityCommon = 0.96; // 96% chance for common textures

        let textureIndex;
        if (Math.random() < probabilityCommon) {
            // Assign a common texture (0-7)
            textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES);
        } else {
            // Assign a rare texture (8-11)
            textureIndex = NUM_COMMON_STAR_TEXTURES + Math.floor(Math.random() * NUM_RARE_STAR_TEXTURES);
        }

        const baseSize = Math.random() * 1.5 + 0.5; // Base size for the star's data
        stars.push({
            id,
            name: generateRandomName(),
            position,
            color,
            size: baseSize, 
            planets: generatePlanets(id),
            isKeySystem: Math.random() < 0.01,
            textureIndex: textureIndex, // Use the new weighted textureIndex
        });

        // Size for the points material
        sizes[i] = stars[stars.length - 1].isKeySystem ? (baseSize * 1.8) : baseSize * 0.9;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    return { stars, positions, colors, sizes };
};