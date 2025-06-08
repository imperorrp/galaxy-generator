import * as THREE from 'three';
import type { StarData, PlanetData } from '../types/galaxy';
import { NUM_COMMON_STAR_TEXTURES, NUM_RARE_STAR_TEXTURES } from '../config/galaxyConfig';

const NUM_STARS = 1000; // Reverted star count, implementing user requests for structure changes
export const GALAXY_RADIUS = 1000;

// Helper function to generate a random name (simple version)
const generateRandomName = (): string => {
  const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
  const suffixes = ['Centauri', 'Reticuli', 'Orionis', 'Draconis', 'Lyrae', 'Cygnus', 'Aquilae', 'Pegasi'];
  const numbers = Math.floor(Math.random() * 1000);
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${numbers}`;
};

// Helper to generate some placeholder planets for a star
const generatePlanets = (starId: string): PlanetData[] => {
    const numPlanets = Math.floor(Math.random() * 6) + 3; // 3 to 8 planets
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

// New Galaxy Parameters (inspired by new-galaxy-generation-ideas)
const GALAXY_PARAMS = {
    numArms: 4, // Number of spiral arms
    spiralTightness: 0.4, // Controls how tightly arms are wound
    spiralAngleFactor: 12, // Multiplier for the angle calculation, affecting arm curvature

    armWidth: 120.0, // Increased for thicker arms
    armPointDensityPower: 2.5, // Adjusted for arm density
    diskYScaleForArms: 0.30, // Flatter arms - Increased for thicker arms near core to show taper
    subArmChance: 0.15, // Chance for a star to be part of a sub-arm like feature
    subArmScatterFactor: 1.5, // How much more scatter for sub-arms
    subArmAngleOffsetRange: Math.PI / 6, // Angular deviation for sub-arms

    bulgeSizeFactor: 0.28, // Increased for a wider bulge (28% of GALAXY_RADIUS)
    bulgeYScale: 0.6, // Bulge height is 60% of its radius, making it thicker
    bulgeDensityPower: 1.5, // Power for Math.random() in bulge radius generation. Lower values (<1) spread more, higher values (>1) concentrate more towards center. Adjusted for less dense core.

    centralBarLengthFactor: 0.25, // Bar length is 25% of GALAXY_RADIUS
    centralBarWidthFactor: 0.05,  // Bar width is 5% of GALAXY_RADIUS
    centralBarYScale: 0.8, // Thickness of the bar

    diskStarFraction: 0.30, // 30% of stars are general disk stars (not strictly in arms)
    diskStarYScale: 0.18, // General disk stars Y scale - now for inner edge of disk, will taper

    colorInHex: '#ff9040', // Hotter/younger stars (e.g., orange-yellow)
    colorOutHex: '#5070cc', // Cooler/older stars (e.g., blue-ish)
};

export const generateGalaxyData = (): GalaxyData => {
    const MIN_STAR_DISTANCE = 25.0; // Minimum distance between stars
    const MIN_STAR_DISTANCE_SQUARED = MIN_STAR_DISTANCE * MIN_STAR_DISTANCE;
    const MAX_PLACEMENT_ATTEMPTS = 10; // Max attempts to find a valid position

    const stars: StarData[] = [];
    const positions = new Float32Array(NUM_STARS * 3);
    const colors = new Float32Array(NUM_STARS * 3);
    const sizes = new Float32Array(NUM_STARS);

    const actualBulgeRadius = GALAXY_RADIUS * GALAXY_PARAMS.bulgeSizeFactor;
    const actualArmWidth = GALAXY_PARAMS.armWidth;
    const actualBarLength = GALAXY_RADIUS * GALAXY_PARAMS.centralBarLengthFactor;
    const actualBarWidth = GALAXY_RADIUS * GALAXY_PARAMS.centralBarWidthFactor;

    const colorInside = new THREE.Color(GALAXY_PARAMS.colorInHex);
    const colorOutside = new THREE.Color(GALAXY_PARAMS.colorOutHex);

    for (let i = 0; i < NUM_STARS; i++) {
        const id = `star-${i}`;
        const i3 = i * 3;
        // Declare variables that will be set inside the placement attempt loop
        let x: number = 0, y: number = 0, z: number = 0;
        let starPrimaryRadius: number = 0;
        let starTypeGenerated: 'bar' | 'bulge' | 'arm' | 'disk_general' = 'disk_general'; // Default, will be overwritten

        let positionIsValid = false;
        let attempts = 0;

        while (!positionIsValid && attempts < MAX_PLACEMENT_ATTEMPTS) {
            attempts++;

            // Determine star type and generate initial position
            // This entire block (position generation + clamping) is now inside the while loop
            const typeRoll = Math.random();

        if (typeRoll < 0.15) { // 15% chance for bar
            starTypeGenerated = 'bar';
            // === CENTRAL BAR LOGIC ===
            const fuzzinessFactor = 1.5; // How much "wider" the random placement can be
            const barPosFactor = Math.pow(Math.random(), 1.5); // Skews towards center of bar length

            x = (Math.random() - 0.5) * 2 * actualBarLength * barPosFactor;
            z = (Math.random() - 0.5) * 2 * actualBarWidth * (1 + (Math.random() - 0.5) * (fuzzinessFactor -1));
            y = (Math.random() - 0.5) * 2 * actualBarWidth * GALAXY_PARAMS.centralBarYScale * (1 + (Math.random() - 0.5) * (fuzzinessFactor -1));
            starPrimaryRadius = Math.sqrt(x*x + z*z); // Effective radius for this bar star

        } else if (typeRoll < 0.35) { // Next 20% for bulge (total 35%)
            starTypeGenerated = 'bulge';
            // === BULGE LOGIC ===
            // Bulge stars are primarily outside the bar's main influence but can be close.
            let r_bulge = Math.pow(Math.random(), GALAXY_PARAMS.bulgeDensityPower) * actualBulgeRadius;
            // Ensure bulge stars are mostly outside the bar's core length, or start where bar ends.
            if (r_bulge < actualBarLength * 0.6) {
                r_bulge = actualBarLength * 0.6 + Math.random() * (actualBulgeRadius - actualBarLength * 0.6);
            }
            starPrimaryRadius = Math.max(r_bulge, actualBarLength * 0.5); // Ensure bulge radius is somewhat significant
            starPrimaryRadius = Math.min(starPrimaryRadius, actualBulgeRadius); // Clamp to bulge radius

            const phi = Math.random() * Math.PI * 2;
            const costheta = Math.random() * 2 - 1;
            const theta = Math.acos(costheta);

            x = starPrimaryRadius * Math.sin(theta) * Math.cos(phi);
            z = starPrimaryRadius * Math.sin(theta) * Math.sin(phi);
            y = starPrimaryRadius * Math.cos(theta) * GALAXY_PARAMS.bulgeYScale;

        } else if (typeRoll < 0.85) { // Next 50% for arms (total 85%)
            starTypeGenerated = 'arm';
            // === ARM LOGIC ===
            // Arms start from outside the bar length.
            // Generate radial position for the star along an arm.
            starPrimaryRadius = actualBarLength + Math.pow(Math.random(), 1.8) * (GALAXY_RADIUS - actualBarLength);
            starPrimaryRadius = Math.min(starPrimaryRadius, GALAXY_RADIUS); // Clamp to galaxy radius

            const armIndex = i % GALAXY_PARAMS.numArms;
            // effectiveRadiusForSpiral is 0 at bar end, up to (GALAXY_RADIUS - actualBarLength)
            const effectiveRadiusForSpiral = Math.max(0, starPrimaryRadius - actualBarLength);
            // normalizedEffectiveRadius is 0 at bar end, 1 at galaxy edge
            const normalizedEffectiveRadius = Math.min(1, effectiveRadiusForSpiral / (GALAXY_RADIUS - actualBarLength));

            const baseAngle = normalizedEffectiveRadius * GALAXY_PARAMS.spiralTightness * GALAXY_PARAMS.spiralAngleFactor;
            let armAngleOffset = (armIndex / GALAXY_PARAMS.numArms) * Math.PI * 2;

            // Tapered arm width: thicker near the bar (normalizedEffectiveRadius close to 0), thinner at the edge.
            let taperFactorArm = Math.max(0.15, 1.0 - normalizedEffectiveRadius * 0.85); // Min thickness 15%, tapers to 15% at edge
            let currentArmWidthArm = actualArmWidth * taperFactorArm;

            if (Math.random() < GALAXY_PARAMS.subArmChance) {
                // Sub-arm features: slightly offset angle and more scatter
                armAngleOffset += (Math.random() - 0.5) * GALAXY_PARAMS.subArmAngleOffsetRange;
                currentArmWidthArm *= GALAXY_PARAMS.subArmScatterFactor;
            }

            const totalAngle = baseAngle + armAngleOffset;

            // Scatter points within the arm width
            const scatterMagnitude = Math.pow(Math.random(), GALAXY_PARAMS.armPointDensityPower) * currentArmWidthArm;
            const randomScatterX = scatterMagnitude * (Math.random() - 0.5) * 2;
            const randomScatterZ = scatterMagnitude * (Math.random() - 0.5) * 2;

            // Rotate scatter to align with arm direction
            const rotatedScatterX = randomScatterX * Math.cos(totalAngle) - randomScatterZ * Math.sin(totalAngle);
            const rotatedScatterZ = randomScatterX * Math.sin(totalAngle) + randomScatterZ * Math.cos(totalAngle);

            x = Math.cos(totalAngle) * starPrimaryRadius + rotatedScatterX;
            z = Math.sin(totalAngle) * starPrimaryRadius + rotatedScatterZ;
            y = (Math.random() - 0.5) * 2 * currentArmWidthArm * GALAXY_PARAMS.diskYScaleForArms; // Y scatter for arm thickness

        } else { // Remaining are general disk stars (total 15%)
            starTypeGenerated = 'disk_general';
            // === GENERAL DISK STAR LOGIC ===
            // These stars are outside the bulge and not strictly in arms, forming a flatter disk.
            starPrimaryRadius = actualBulgeRadius + Math.random() * (GALAXY_RADIUS - actualBulgeRadius);
            starPrimaryRadius = Math.min(starPrimaryRadius, GALAXY_RADIUS);

            const angle = Math.random() * Math.PI * 2;
            x = Math.cos(angle) * starPrimaryRadius;
            z = Math.sin(angle) * starPrimaryRadius;
            
            // GENERAL DISK STAR LOGIC (Revised Y for tapering)
            const diskRadiusRatio = Math.max(0, Math.min(1, (starPrimaryRadius - actualBulgeRadius) / (GALAXY_RADIUS - actualBulgeRadius)));
            const taperFactorDisk = Math.max(0.15, 1.0 - diskRadiusRatio * 0.85); // Tapers to 15% thickness at the edge
            const baseThicknessAtInnerDisk = GALAXY_RADIUS * GALAXY_PARAMS.diskStarYScale;
            y = (Math.random() - 0.5) * 2 * baseThicknessAtInnerDisk * taperFactorDisk;
        }

        // === ADD GLOBAL FUZZINESS/NOISE ===
        const noiseFactor = 0.02; // 2% of GALAXY_RADIUS as max noise
        x += (Math.random() - 0.5) * 2 * GALAXY_RADIUS * noiseFactor;
        y += (Math.random() - 0.5) * 2 * GALAXY_RADIUS * noiseFactor * 0.5; // Less Y noise
        z += (Math.random() - 0.5) * 2 * GALAXY_RADIUS * noiseFactor;

        // === CLAMPING (ensure stars stay within defined galaxy bounds) ===
        // Clamp XZ to GALAXY_RADIUS (circular boundary)
        const distSqXZ_clamp = x * x + z * z; 
        if (distSqXZ_clamp > GALAXY_RADIUS * GALAXY_RADIUS) {
            const scale = GALAXY_RADIUS / Math.sqrt(distSqXZ_clamp);
            x *= scale;
            z *= scale;
        }

        // Clamp Y based on star type and its generated primary radius
        let maxYMagnitude_clamp; 
        switch (starTypeGenerated) {
            case 'bar':
                maxYMagnitude_clamp = actualBarWidth * GALAXY_PARAMS.centralBarYScale * 1.3; 
                break;
            case 'bulge':
                maxYMagnitude_clamp = actualBulgeRadius * GALAXY_PARAMS.bulgeYScale * 0.8; 
                break;
            case 'arm':
                const normalizedEffRadForArmY = Math.min(1, Math.max(0, starPrimaryRadius - actualBarLength) / (GALAXY_RADIUS - actualBarLength));
                const taperFactorForArmY = Math.max(0.15, 1.0 - normalizedEffRadForArmY * 0.85);
                maxYMagnitude_clamp = actualArmWidth * taperFactorForArmY * GALAXY_PARAMS.diskYScaleForArms * 1.8; 
                break;
            case 'disk_general':
            default:
                // Recalculate taperFactorDisk for clamping, consistent with y-generation
                const diskRadiusRatio_clamp = Math.max(0, Math.min(1, (starPrimaryRadius - actualBulgeRadius) / (GALAXY_RADIUS - actualBulgeRadius)));
                const taperFactorDisk_clamp = Math.max(0.15, 1.0 - diskRadiusRatio_clamp * 0.85);
                const baseThicknessAtInnerDisk_clamp = GALAXY_RADIUS * GALAXY_PARAMS.diskStarYScale;
                maxYMagnitude_clamp = baseThicknessAtInnerDisk_clamp * taperFactorDisk_clamp * 1.5;
                break;
        }

        if (Math.abs(y) > maxYMagnitude_clamp) {
            y = Math.sign(y) * maxYMagnitude_clamp * (0.7 + Math.random() * 0.3); 
        }

            // Check distance to other already placed stars
            positionIsValid = true; // Assume valid for this attempt
            for (let k = 0; k < stars.length; k++) {
                // Using the current x, y, z for the star being placed
                const dx_check = x - stars[k].position.x;
                const dy_check = y - stars[k].position.y;
                const dz_check = z - stars[k].position.z;
                const distSq = dx_check * dx_check + dy_check * dy_check + dz_check * dz_check;
                if (distSq < MIN_STAR_DISTANCE_SQUARED) {
                    positionIsValid = false;
                    break; // Too close to star k, try a new position
                }
            }

            if (!positionIsValid && attempts >= MAX_PLACEMENT_ATTEMPTS) {
                // Optional: console.warn(`Star ${id} (type: ${starTypeGenerated}) placed despite proximity after ${MAX_PLACEMENT_ATTEMPTS} attempts.`);
                positionIsValid = true; // Force accept if max attempts reached
            }
        } // End of while (!positionIsValid && attempts < MAX_PLACEMENT_ATTEMPTS)
        
        // === COLOR LOGIC ===
        const effectiveRadiusForColor = starPrimaryRadius; 
        const mixedColor = colorInside.clone();
        let lerpFactor;

        if (starTypeGenerated === 'bulge' || (starTypeGenerated === 'bar' && effectiveRadiusForColor < actualBulgeRadius * 0.7)) {
            lerpFactor = Math.min(effectiveRadiusForColor / (actualBulgeRadius * 0.8), 1.0) * 0.4; 
        } else {
            lerpFactor = Math.min(effectiveRadiusForColor / GALAXY_RADIUS, 1.0);
        }
        mixedColor.lerp(colorOutside, lerpFactor);

        // === STAR DATA ===
        const totalStarTextures = NUM_COMMON_STAR_TEXTURES + NUM_RARE_STAR_TEXTURES;
        const probabilityCommon = 0.96;
        let textureIndex;
        if (Math.random() < probabilityCommon) {
            textureIndex = Math.floor(Math.random() * NUM_COMMON_STAR_TEXTURES);
        } else {
            textureIndex = NUM_COMMON_STAR_TEXTURES + Math.floor(Math.random() * NUM_RARE_STAR_TEXTURES);
        }

        let baseSize = Math.random() * 1.5 + 0.5; 
        if (starTypeGenerated === 'bulge' || starTypeGenerated === 'bar') {
            baseSize *= 1.2; 
        } else if (starTypeGenerated === 'arm') {
            const normalizedEffRadForArmSize = Math.min(1, Math.max(0, starPrimaryRadius - actualBarLength) / (GALAXY_RADIUS - actualBarLength));
            baseSize *= (1.1 - normalizedEffRadForArmSize * 0.3); 
        }
        baseSize = Math.max(0.4, Math.min(baseSize, 2.5)); 


        stars.push({
            id,
            name: generateRandomName(),
            position: new THREE.Vector3(x, y, z),
            color: mixedColor.clone(),
            size: baseSize,
            textureIndex,
            planets: generatePlanets(id),
        });

        positions[i3 + 0] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        sizes[i] = baseSize;
    }

    return {
        stars,
        positions,
        colors,
        sizes
    };
};