export const NUM_COMMON_STAR_TEXTURES = 7;
export const NUM_RARE_STAR_TEXTURES = 5;

// LOD Configurations
export const LOD_THRESHOLDS_CONFIG = {
    MID_FACTOR: 0.6, // Factor of GALAXY_RADIUS for Mid distance
    NEAR_FACTOR: 0.4, // Factor of GALAXY_RADIUS
    VERY_NEAR_FACTOR: 0.2, // Factor of GALAXY_RADIUS
};

export const STAR_SIZE_LOD_CONFIG = [15, 12, 9, 6]; // LOD 0, 1, 2, 3 sizes for stars (Far, Mid, Near, Very Near)

export const DEFAULT_LOD_LEVELS = [
  { value: 0, label: 'Far (LOD 0)' },
  { value: 1, label: 'Mid (LOD 1)' },
  { value: 2, label: 'Near (LOD 2)' },
  { value: 3, label: 'Very Near (LOD 3)' },
];

// High-Speed Mode Thresholds - REMOVED
// export const HIGH_SPEED_ENTER_THRESHOLD = 1.2; // Radians per second (approx 69 deg/sec).
// export const HIGH_SPEED_EXIT_THRESHOLD = 0.3;  // Radians per second (approx 17 deg/sec).

// Galaxy Generation Parameters from galaxyService.ts
export const NUM_STARS = 2000; // Total stars to generate
export const GALAXY_RADIUS = 1000;

// Fractions for star types
export const MAIN_GALAXY_STAR_FRACTION = 0.825; // Stars in arms, bulge, bar, inner disk
export const OUTER_DISK_STAR_FRACTION = 0.025; // Stars in the outer, sparser disk plane
export const HALO_STAR_FRACTION = 0.10;       // Loosely scattered stars around the galaxy
export const GLOBULAR_CLUSTER_STAR_FRACTION = 0.05; // Stars in dense clusters

// Globular Cluster parameters
export const NUM_GLOBULAR_CLUSTERS = 5; // Number of globular clusters
export const GLOBULAR_CLUSTER_RADIUS_MIN = 20; // Min radius of a star within its cluster's local space
export const GLOBULAR_CLUSTER_RADIUS_MAX = 40; // Max radius of a star within its cluster's local space
export const GLOBULAR_CLUSTER_DENSITY_POWER = 2.5; // Higher values make clusters more centrally condensed
export const GLOBULAR_CLUSTER_POSITION_RADIUS_MIN_FACTOR = 0.5; // Min distance of cluster center from galaxy center (factor of GALAXY_RADIUS)
export const GLOBULAR_CLUSTER_POSITION_RADIUS_MAX_FACTOR = 1.2; // Max distance of cluster center

// Halo parameters
export const HALO_MIN_RADIUS_FACTOR = 0.8; // Halo stars start at GALAXY_RADIUS
export const HALO_MAX_RADIUS_FACTOR = 1.4; // Halo stars extend to 1.8 * GALAXY_RADIUS
export const HALO_Y_SCALE = 0.7;           // Vertical scale of the halo (less flat than disk, but not perfectly spherical)
export const HALO_DENSITY_POWER = 2.0;     // Higher values concentrate halo stars closer to GALAXY_RADIUS

// Outer Disk parameters
export const OUTER_DISK_MIN_RADIUS_FACTOR = 1.0; // Outer disk stars start at GALAXY_RADIUS
export const OUTER_DISK_MAX_RADIUS_FACTOR = 1.1; // Outer disk stars extend to 1.3 * GALAXY_RADIUS
export const OUTER_DISK_Y_SCALE = 0.025;          // Vertical scale of the outer disk (very flat)

// Galaxy Parameters Object
export const GALAXY_PARAMS = {
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