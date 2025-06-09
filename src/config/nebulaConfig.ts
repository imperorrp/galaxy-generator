// Nebula Texture and LOD Configuration
export const NUM_NEBULA_TEXTURES = 9;
export const NEBULA_LOD_CONFIG = [ // Index corresponds to LOD level
    { id: "far", opacityFactor: 1.0 },    // LOD 0 (Far)
    { id: "mid", opacityFactor: 0.85 },   // LOD 1 (Mid)
    { id: "near", opacityFactor: 0.65 },  // LOD 2 (Near)
    { id: "very_near", opacityFactor: 0.35 }, // LOD 3 (Very Near)
];

// Nebula Generation Parameters
export const NUM_NEBULAE_TO_GENERATE = 144;
// Factor of GALAXY_RADIUS, GALAXY_RADIUS will be imported where needed
export const GALACTIC_PLANE_THICKNESS_FACTOR = 0.05;

// Position Generation
export const NEBULA_RADIAL_DIST_POWER = 2.0; // Power for Math.random() for radial distribution
export const NEBULA_MAX_RADIAL_FACTOR_OF_GALAXY_RADIUS_FRACTION = 0.9; // Max radius for nebulae (factor of GALAXY_RADIUS * rFraction)

// Y Position (Height relative to galactic plane thickness)
export const NEBULA_Y_DEVIATION_BIAS_CHANCE = 0.1; // Chance for extra Y deviation
export const NEBULA_Y_DEVIATION_BIAS_MULTIPLIER_MIN = 1.0;
export const NEBULA_Y_DEVIATION_BIAS_MULTIPLIER_RANDOM_ADD = 1.0; // Max value will be MIN + RANDOM_ADD

// Scale (relative to GALAXY_RADIUS)
export const NEBULA_BASE_SCALE_MIN_FACTOR = 0.04; // Min base scale (factor of GALAXY_RADIUS)
export const NEBULA_BASE_SCALE_RANDOM_FACTOR = 0.08; // Random factor added to base scale
export const NEBULA_ASPECT_RATIO_VARIATION_BASE = 0.7;
export const NEBULA_ASPECT_RATIO_VARIATION_RANDOM = 0.6;

// Rotation
export const NEBULA_ROTATION_XY_PLANE_MAX_RADIANS = Math.PI * 0.1; // Max tilt from galactic plane for X and Z axes
// Y axis rotation is full 2 * Math.PI

// Appearance
export const NEBULA_OPACITY_BASE = 0.15;
export const NEBULA_OPACITY_RANDOM_FACTOR = 0.20;
export const NEBULA_MAX_ABSOLUTE_SPIN_SPEED = 0.0015; // Max absolute spin speed (e.g., rad/frame)