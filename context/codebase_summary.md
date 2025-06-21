# Codebase Summary

This document provides a summary of the files in the `galactic-conquest-r3f` project.

## `src/App.css`
- **Purpose**: Contains global styles for the application.
- **Details**: Styles for `#root`, `.logo`, `.card`, keyframes for `logo-spin`, and general layout styling.

## `src/App.tsx`
- **Purpose**: Main application component. Manages views (galaxy/system), state, and renders the 3D canvas with appropriate scenes and UI controls. It now includes a live configuration system for galaxy and nebula parameters.
- **Components**: 
    - `App`: Main functional component.
- **Functions**:
    - `handleStarSelect`: Switches view to 'system' and sets the selected star data.
    - `handleBackToGalaxy`: Switches view back to 'galaxy' and clears selected star data.
    - `handleToggleLodMode`: Toggles the LOD mode between manual and automatic.
    - `handleSetManualLodLevel`: Sets the desired manual LOD level.
    - `handleEffectiveLodChange`: Callback passed to `GalaxyView` to receive updates on the currently active LOD level.
    - `handleHighSpeedModeChange`: Callback passed to `GalaxyView` to receive updates on the high-speed camera mode status.
    - `handleAppConfigChange`: Updates the `appConfig` state when a value in the `GalaxyConfigPanel` is changed.
    - `handleResetAppConfig`: Resets the galaxy and nebula configuration to their default values.
- **State**: Manages `currentView`, `selectedStarData`, `isLodManual`, `manualLodLevel`, `effectiveLodLevel`, `isHighSpeedActive`, and `appConfig` (which holds the live configuration for the galaxy and nebulae).
- **Hooks**: `useState`, `useRef`, `useEffect`, `useCallback`.
- **Key Features**: 
    - Sets up the main R3F `Canvas`, `OrbitControls`, and conditionally renders `GalaxyView` or `SystemView`.
    - Renders UI components like `LodControls`, `SystemInfoDisplay`, and the new `GalaxyConfigPanel`.
    - Passes the `appConfig.galaxy` and `appConfig.nebula` objects as props to `GalaxyView`, allowing for dynamic, real-time updates to the galaxy's appearance.

## `src/components/scene/GalaxyView.tsx`
- **Purpose**: Renders the main galaxy view, including stars, nebulae, and handles interactions like star selection and hover.
- **Components**:
    - `GalaxyView`: React functional component.
- **Props**: `onStarSelect`, `manualLodOverride`, `isLodManual`, `onLodLevelChange`, `onHighSpeedModeChange`.
- **Functions**:
    - `handleStarHover`: Updates state for hovered star and changes cursor.
    - `handleStarClick`: Calls `onStarSelect` prop with clicked star data.
- **Hooks**: `useMemo` (for `galaxyData`, `starGroups`), `useRef`, `useEffect`, `useState` (for `hoveredStar`, `selectedStar`), `useCameraDynamics`, `useGalaxyLOD`, `useTextureAnisotropy`, `useThree`, `useTexture`.
- **Key Features**: 
    - Generates galaxy data using `generateGalaxyData` (which utilizes modules from `src/services/galaxyGenerationModules/`).
    - Renders stars using the `StarPoints` component.
    - Renders nebulae using the `NebulaRenderer` component.
    - Uses `DreiStars` for distant background stars.
    - Displays interactive HTML tooltips for hovered stars.
    - Integrates LOD (via `useGalaxyLOD` hook) and optimized camera mode (via `useCameraDynamics` hook) detection for performance optimization.

## `src/components/scene/NebulaCloud.tsx`
- **Purpose**: Renders a single procedurally generated nebula cloud as a textured plane that always faces the camera.
- **Components**:
    - `NebulaCloud`: React functional component.
- **Props**: `textureUrl`, `position`, `scale`, `opacity`, `isRotating`, `isVisible`.
- **Hooks**: `useTexture`, `useFrame`, `useThree`, `useRef`, `useEffect`.
- **Key Features**: 
    - Loads nebula texture.
    - Uses `planeGeometry` and `meshBasicMaterial` with additive blending.
    - `useFrame` ensures the nebula plane always looks at the camera.
    - Manages texture anisotropy based on `isRotating` and `isVisible` props for performance.

## `src/components/scene/NebulaRenderer.tsx`
- **Purpose**: Manages and renders a collection of `NebulaCloud` components, applying LOD and visibility rules. Its generation is now driven by dynamic configuration props.
- **Components**:
    - `NebulaRenderer`: React functional component.
- **Props**: `nebulaTexturePaths`, `lodLevel`, `isLodManual`, `manualLodOverride`, `isHighSpeedMode`, `config: ConfigurableNebulaParams`, `galaxyRadius`.
- **Hooks**: `useMemo` (for `baseGeneratedNebulae`, `processedNebulae`).
- **Key Features**: 
    - Generates a list of nebula properties (position, scale, rotation, opacity, texture) based on the `config` prop, not just the static `nebulaConfig.ts` file.
    - Adjusts nebula opacity based on the current LOD level.
    - Hides all nebulae when `isHighSpeedMode` is active.

## `src/components/scene/PlanetMesh.tsx`
- **Purpose**: Renders a single planet mesh, handling its orbital motion around a star and axial rotation.
- **Components**:
    - `PlanetMesh`: React functional component.
- **Props**: `planetData` (contains planet's properties), `starPosition` (center of orbit).
- **Hooks**: `useRef` (for mesh and angle), `useFrame`.
- **Key Features**: 
    - Simulates orbital motion using `useFrame` by updating position based on `orbitRadius` and `orbitSpeed`.
    - Simulates axial rotation based on `rotationSpeed`.
    - Renders the planet as a `sphereGeometry` with `meshStandardMaterial`.

## `src/components/scene/StarPoints.tsx`
- **Purpose**: Renders stars as points, optimized for performance, and handles interactions like hover and click.
- **Components**:
    - `StarPoints`: React functional component.
- **Props**: `starGroups` (pre-processed star data), `loadedStarTextures`, `lodLevel`, `isHighSpeedMode`, `onStarHover`, `onStarClick`.
- **Hooks**: `useMemo` (for `memoizedStarGeometries`).
- **Key Features**: 
    - Uses `THREE.Points` with `PointMaterial` for rendering stars.
    - Star data is grouped by texture to optimize draw calls.
    - Handles `onPointerOver`, `onPointerOut`, `onClick` events for star interactions.
    - Star size is dynamically adjusted based on `lodLevel` and `STAR_SIZE_LOD_CONFIG`.
    - Renders smaller stars when `isHighSpeedMode` is active.

## `src/components/scene/SystemView.tsx`
- **Purpose**: Renders the detailed view of a selected star system, including the central star and its planets.
- **Components**:
    - `SystemView`: React functional component.
- **Props**: `starData` (data of the selected star), `onBackToGalaxy` (callback, though button is in UI component).
- **Key Features**: 
    - Renders the central star as a sphere with emissive material and a point light.
    - Iterates over `starData.planets` and renders each using the `PlanetMesh` component.

## `src/components/ui/LodControls.tsx`
- **Purpose**: Provides a UI for users to control and observe the Level of Detail (LOD) settings.
- **Components**:
    - `LodControls`: React functional component.
- **Props**: `isLodManual`, `manualLodLevel`, `currentAutoLodLevel`, `onToggleLodMode`, `onSetManualLodLevel`, `lodLevels` (labels for LOD levels), `isHighSpeedActive`.
- **Key Features**: 
    - Checkbox to toggle manual LOD mode.
    - Dropdown to select manual LOD level if manual mode is active.
    - Displays the current LOD level (auto or manual) and its label.
    - Displays the status of the high-speed camera mode.

## `src/components/ui/SystemInfoDisplay.tsx`
- **Purpose**: Displays detailed information about the currently selected star system.
- **Components**:
    - `SystemInfoDisplay`: React functional component.
- **Props**: `starData`, `onBackToGalaxy`.
- **Key Features**: 
    - Shows star's name, ID, position, color, and size.
    - Lists planets with their name, type, size, orbit radius, orbit speed, and color.
    - Provides a "Back to Galaxy View" button.

## `src/components/ui/GalaxyConfigPanel.tsx`
- **Purpose**: Provides a powerful UI panel that allows for the live, dynamic configuration of galaxy and nebula generation parameters. This component turns the application from a static simulator into an interactive generator tool.
- **Components**:
    - `GalaxyConfigPanel`: A React functional component.
- **Props**:
    - `initialConfig: AppConfig`: The starting configuration object.
    - `onConfigChange: (newConfig: AppConfig) => void`: A callback function invoked when the user clicks "Apply Changes".
    - `onResetConfig: () => void`: A callback invoked when the user clicks "Reset to Defaults".
- **State**:
    - `currentConfig`: A local state that holds the form's current values as the user edits them.
    - `showAdvancedGalaxy`, `showAdvancedNebula`: Boolean states to toggle the visibility of advanced configuration sections for better UI organization.
- **Key Features**:
    - `Comprehensive Controls`: Renders a form with input fields for nearly every parameter defined in `ConfigurableGalaxyParams` and `ConfigurableNebulaParams`.
    - `Collapsible Sections`: Organizes parameters into "Basic" and "Advanced" sections for both the galaxy and nebulae, which can be expanded or collapsed to reduce clutter.
    - `State Management`: Manages its own form state and only propagates changes to the parent component (`App.tsx`) upon explicit user submission, preventing re-generation on every keystroke.
    - `Reset Functionality`: Allows the user to revert all parameters back to the application's default values.

## `src/config/galaxyConfig.ts`
- **Purpose**: Stores all configuration constants related to galaxy generation, star appearance, LOD thresholds, and high-speed mode parameters.
- **Exports**: Numerous constants including:
    - `NUM_COMMON_STAR_TEXTURES`, `NUM_RARE_STAR_TEXTURES`
    - `LOD_THRESHOLDS_CONFIG`: Defines distance factors for LOD transitions (MID, NEAR, VERY_NEAR).
    - `STAR_SIZE_LOD_CONFIG`: Array of star sizes corresponding to each LOD level.
    - `DEFAULT_LOD_LEVELS`: UI labels for LOD levels.
    - `HIGH_SPEED_ENTER_THRESHOLD`, `HIGH_SPEED_EXIT_THRESHOLD`: Angular speed thresholds for camera high-speed mode.
    - `NUM_STARS`, `GALAXY_RADIUS`.
    - Star distribution parameters (fractions for main galaxy, halo, globular clusters).
    - Globular cluster generation parameters.
    - Halo generation parameters.
    - `GALAXY_PARAMS`: A large object detailing parameters for spiral arms, bulge, central bar, and disk characteristics.

## `src/config/nebulaConfig.ts`
- **Purpose**: Stores configuration constants for generating and rendering nebulae.
- **Exports**: Constants including:
    - `NUM_NEBULA_TEXTURES`
    - `NEBULA_LOD_CONFIG`: Opacity multipliers for nebulae at different LOD levels.
    - `NUM_NEBULAE_TO_GENERATE`
    - Parameters for nebula positioning (e.g., `GALACTIC_PLANE_THICKNESS_FACTOR`, `NEBULA_RADIAL_DIST_POWER`), scale, aspect ratio, rotation, and appearance (opacity, spin speed).

## `src/config/planetConfig.ts`
- **Purpose**: Stores configuration constants for generating planets within star systems.
- **Exports**: Constants including:
    - `MIN_PLANETS_PER_SYSTEM`, `MAX_PLANETS_PER_SYSTEM`
    - `PLANET_TYPES`: An array of possible planet types (e.g., 'terrestrial', 'gas_giant').
    - `MIN_PLANET_SIZE`, `MAX_PLANET_SIZE`
    - Parameters for orbit radius and orbit speed generation.

## `src/contexts/`
- **Purpose**: This directory is intended to hold React Context API related files.
- **Status**: Currently empty.

## `src/hooks/useCameraDynamics.ts`
- **Purpose**: A custom React hook to monitor camera movement, calculate its angular speed, and manage an "optimized mode". This mode can be controlled externally and is also influenced by performance degradation detection. It helps in optimizing rendering during fast camera movements or when performance issues are detected.
- **Exports**:
    - `useCameraDynamics`: The hook function.
- **Returns**: An object containing `isRotating` (boolean), `isOptimizedMode` (boolean), `smoothedAngularSpeed` (number), `rawAngularSpeed` (number), `cameraRef` (React.MutableRefObject), and `averageFrameTime` (number).
- **Props**:
    - `onOptimizedModeChange` (optional callback: `(isActive: boolean) => void`): Notifies parent components of changes to the optimized mode status.
    - `userRequestedOptimizedMode` (optional boolean, default: `false`): Allows external control to enable or disable the optimized mode.
- **Key Features**:
    - Uses `useFrame` to check camera quaternion changes for rotation detection and angular speed calculation.
    - Tracks `averageFrameTime` over a sample window to monitor rendering performance.
    - Sets `isOptimizedMode` based on `userRequestedOptimizedMode` prop.
    - Reports changes to `isOptimizedMode` via the `onOptimizedModeChange` callback.
    - Detects performance degradation (high `averageFrameTime` during rotation) and can influence optimization strategies (though direct auto-toggling based on this is currently removed, the state `isPerformanceDegraded` is available).
    - Calculates both raw and smoothed angular speed of the camera.

## `src/hooks/useGalaxyLOD.ts`
- **Purpose**: A custom React hook responsible for determining the appropriate Level of Detail (LOD) for the galaxy view. It manages automatic LOD switching based on camera proximity to the nearest star and supports manual overrides.
- **Exports**:
    - `useGalaxyLOD`: The hook function.
- **Returns**: An object containing `lodLevel` (the calculated dynamic LOD level, e.g., 0-3) and `lodLevelChecked` (the LOD level, validated and clamped for safe use with configuration arrays like star sizes).
- **Props**: `manualLodOverride` (optional number for manual LOD selection), `isLodManual` (boolean indicating if manual LOD mode is active), `onLodLevelChange` (optional callback invoked when the LOD level changes), `allStars` (array of `StarData` used to build the Octree).
- **Key Features**:
    - Builds an Octree data structure (`PointOctree.ts` from `src/utils/`) using all star positions to efficiently find the star closest to the camera.
    - The distance to this nearest star determines the LOD level (0: Far, 1: Mid, 2: Near, 3: Very Near) based on predefined thresholds in `LOD_THRESHOLDS_CONFIG`.
    - This LOD calculation, including the nearest star search via the Octree, is performed every 10 frames (`LOD_CALCULATION_INTERVAL_FRAMES` from `galaxyConfig.ts`) to optimize performance.
    - If the Octree is unavailable (e.g., no stars provided) or no nearest star is found, the distance to the galaxy's origin (0,0,0) is used as a fallback for LOD determination.
    - Supports manual LOD override, allowing users to fix the detail level.
    - Ensures the output LOD level is always a valid index for related configurations (e.g., `STAR_SIZE_LOD_CONFIG`).
    - Communicates LOD level changes to parent components via the `onLodLevelChange` callback.

## `src/hooks/useTextureAnisotropy.ts`
- **Purpose**: A custom React hook to dynamically adjust texture anisotropy and filtering settings for an array of textures. This is used to improve performance during camera movement and visual quality when static.
- **Exports**:
    - `useTextureAnisotropy`: The hook function.
- **Props**: `textures` (array of `THREE.Texture`), `isRotating` (boolean), `isHighSpeedMode` (boolean), `gl` (`THREE.WebGLRenderer`).
- **Key Features**:
    - In high-speed mode, sets filters to `NearestFilter` and anisotropy to 1.
    - When rotating (but not high-speed), sets filters to `LinearFilter` and anisotropy to 1.
    - When static, sets filters to `LinearMipmapLinearFilter` (min) / `LinearFilter` (mag) and anisotropy to a higher value (e.g., Math.min(8, maxAnisotropy)).
    - Marks textures for update (`texture.needsUpdate = true`) when settings change.

## `src/index.css`
- **Purpose**: Provides basic global CSS resets and styles to ensure the application and canvas take up the full viewport.
- **Details**: Sets `margin: 0`, `padding: 0`, `overflow: hidden` for `html`, `body`. Sets `width: 100%`, `height: 100%` for `html`, `body`, `#root`.

## `src/main.tsx`
- **Purpose**: The main entry point for the React application.
- **Key Features**:
    - Uses `createRoot` from `react-dom/client` to render the application.
    - Renders the `<App />` component into the DOM element with `id='root'`.
    - Wraps `<App />` in `<React.StrictMode>` for development checks.

## `src/services/galaxyGenerationModules/`
- **Purpose**: This directory contains a set of specialized modules, each responsible for a specific aspect of the procedural generation of the galaxy's stellar components.

### `src/services/galaxyGenerationModules/mainGalaxyStarGenerator.ts`
- **Purpose**: The core generation module responsible for creating stars within the primary structures of a spiral galaxy: the central bulge, the bar, the spiral arms, and the inner disk.
- **Key Functions**:
    - `generateMainGalaxyStars`: The main export, which contains complex logic for placing stars according to spiral arm mathematics, density falloffs, and configurable parameters like arm width, bulge size, and bar dimensions.

### `src/services/galaxyGenerationModules/haloStarGenerator.ts`
- **Purpose**: Populates the galactic halo, the sparse, roughly spherical region of stars that surrounds the main galaxy.
- **Key Functions**:
    - `generateHaloStars`: Generates stars in a wide, low-density distribution outside the main disk, contributing to the galaxy's overall volume and realism.

### `src/services/galaxyGenerationModules/outerDiskStarGenerator.ts`
- **Purpose**: Generates stars for the sparse, thin outer disk that lies just beyond the main spiral arms.
- **Key Functions**:
    - `generateOuterDiskStars`: Creates a low-density, flat disk of stars that provides a subtle transition from the main galaxy to the empty halo.

### `src/services/galaxyGenerationModules/globularClusterStarGenerator.ts`
- **Purpose**: Creates globular clusters—dense, spherical collections of old stars that orbit the galaxy.
- **Key Functions**:
    - `generateGlobularClusterStars`: First generates random positions for the cluster centers in the halo, then populates each cluster with a dense, centrally-condensed sphere of stars.

### `src/services/galaxyGenerationModules/planetGenerator.ts`
- **Purpose**: Handles the procedural generation of planets for individual star systems.
- **Key Functions**:
    - `generatePlanets`: Given a star's ID, it generates a random number of planets with varying types, sizes, and orbital characteristics based on values from `planetConfig.ts`.

### `src/services/galaxyGenerationModules/nameGenerator.ts`
- **Purpose**: A simple utility module for generating plausible-sounding, procedural names for celestial objects.
- **Key Functions**:
    - `generateRandomName`: Creates a random name by combining a prefix, a suffix, and a number, providing variety for star names.

## `src/services/galaxyService.ts` (Conceptual - Functionality largely moved or integrated)
- **Purpose**: This file's original role was to orchestrate galaxy generation. However, its functionality has been largely refactored and distributed into `src/services/galaxyGenerationModules/` (for specific generation tasks like stars, planets, names) and a top-level `generateGalaxyData.ts` (or similar, possibly within `GalaxyView.tsx`'s `useMemo` or a dedicated orchestrator file if created) which calls upon these modules.
- **Key Functions/Responsibilities (Now handled by `generateGalaxyData.ts` and modules)**:
  - The main `generateGalaxyData` function accepts a `config: ConfigurableGalaxyParams` object as its primary argument, making the entire generation process dynamic. It integrates outputs from the various generation modules in `src/services/galaxyGenerationModules/`.
  - Manages the overall galaxy generation pipeline and ensures data consistency.
  - Serves as the primary interface for other parts of the application (e.g., `GalaxyView.tsx`) to request and receive complete galaxy data based on the provided configuration.
- **Dependencies**: The generation process relies heavily on the specialized modules within `src/services/galaxyGenerationModules/`.
- **Note**: While `galaxyService.ts` might still exist or be referenced, its core responsibilities for generating the full galaxy model are now primarily within the modular structure and the orchestrating `generateGalaxyData` function.

## `src/types/galaxy.ts`
- **Purpose**: Defines core TypeScript interfaces used throughout the application for celestial bodies.
- **Exports**:
    - `PlanetData`: Interface describing properties of a planet (id, name, type, size, orbitRadius, orbitSpeed, color, etc.).
    - `StarData`: Interface describing properties of a star (id, name, position (`THREE.Vector3`), color (`THREE.Color`), size, planets (array of `PlanetData`), textureIndex, etc.).

## `src/utils/PointOctree.ts`
- **Purpose**: Implements a Point Octree, a hierarchical data structure for partitioning 3D space. Its primary role in this project is to enable extremely fast spatial queries, specifically finding the star closest to the camera, which is essential for the dynamic Level of Detail (LOD) system.
- **Exports**:
    - `PointOctree`: The main class for the data structure.
    - `IPointOctree`: A TypeScript interface for the Octree.
    - `PointOctreeNode`: The internal class representing a single node (or cube) in the tree.
- **Key Features**:
    - `Construction`: The `PointOctree` constructor takes an array of `THREE.Vector3` points and automatically calculates the bounding box required to contain all of them. It then recursively inserts the points into the tree.
    - `Subdivision`: When a node's capacity of points is exceeded, it subdivides into eight children (octants), distributing its points among them.
    - `Efficient Search`: Implements a `findClosestPoint` method that intelligently traverses the tree. It prioritizes searching child nodes closer to the target point and prunes entire branches that are farther away than the current best match, dramatically reducing the number of points that need to be checked.
    - `Usage`: This utility is consumed by the `useGalaxyLOD` hook, which builds an Octree of all star positions to perform its nearest-neighbor search efficiently on every frame interval.

## `src/vite-env.d.ts`
- **Purpose**: A TypeScript declaration file used by Vite to provide type information for Vite-specific client features (e.g., environment variables, importing assets).
- **Details**: Contains `/// <reference types="vite/client" />`.

## Root Directory Files

### `.gitignore`
- **Purpose**: Specifies intentionally untracked files that Git should ignore.

### `README.md`
- **Purpose**: Provides an overview of the project, setup instructions, and other relevant information.

### `eslint.config.js`
- **Purpose**: Configuration file for ESLint, a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

### `index.html`
- **Purpose**: The main HTML page that serves as the entry point for the web application. It typically includes the script tag for the main JavaScript bundle.

### `package-lock.json`
- **Purpose**: Records the exact versions of dependencies used in the project, ensuring reproducible builds. Automatically generated and modified by npm.

### `package.json`
- **Purpose**: Contains metadata about the project, including its name, version, dependencies, scripts (e.g., for starting, building, testing), and other configurations.

### `tsconfig.app.json`
- **Purpose**: TypeScript configuration file specifically for the application code (typically `src`), extending the base `tsconfig.json`.

### `tsconfig.json`
- **Purpose**: The main TypeScript configuration file for the project. Defines compiler options, files to include/exclude, and other settings for the TypeScript compiler.

### `tsconfig.node.json`
- **Purpose**: TypeScript configuration file for Node.js specific parts of the project, like build scripts or server-side code (e.g., `vite.config.ts`).

### `vite.config.ts`
- **Purpose**: Configuration file for Vite, the build tool used for the project. Defines build options, plugins, server settings, etc.

## `public/` Directory
- **Purpose**: Contains static assets that are served directly by the web server and are not processed by Vite's build pipeline (unless referenced from HTML).
- **Contents**:
    - `assets/`: Directory for static assets like images, textures.
        - `textures/`: Contains texture files for stars, nebulae, etc. (Details in Assets section)
    - `vite.svg`: The Vite logo SVG file.

## `context/` Directory
- **Purpose**: Contains project-related documentation and context files.
- **Contents**:
    - `CURRENT-PROGRESS-STATUS.md`: Document tracking the current progress and status of the project.
    - `PLAN.md`: Document outlining the project plan or roadmap.
    - `README-SPECS.md`: Document containing specifications or detailed requirements for the project.
    - `codebase_summary.md`: This document, summarizing the project's codebase.

## Assets
- **`public/vite.svg`**: The Vite logo SVG file, located in the `public` directory.
- **`public/assets/textures/star_particle.png`**: A texture image, likely used for a generic particle effect or as a fallback star texture. (Path corrected from `src/assets/textures/` to `public/assets/textures/`)
- **`public/assets/textures/stars/`**: Contains individual PNG images for star textures (e.g., `star_0.png` to `star_6.png` for common stars, `star_a.png` to `star_e.png` for rare stars). (Path corrected from `src/assets/textures/stars/`)
- **`public/assets/textures/nebulae/`**: Contains individual PNG images for nebula textures (e.g., `nebula_1.png` to `nebula_9.png`). (Path corrected from `src/assets/textures/nebulae/`)