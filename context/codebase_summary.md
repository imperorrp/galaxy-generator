# Codebase Summary

This document provides a summary of the files in the `galactic-conquest-r3f` project.

## `src/App.css`
- **Purpose**: Contains global styles for the application.
- **Details**: Styles for `#root`, `.logo`, `.card`, keyframes for `logo-spin`, and general layout styling.

## `src/App.tsx`
- **Purpose**: Main application component. Manages views (galaxy/system), state, and renders the 3D canvas with appropriate scenes and UI controls.
- **Components**: 
    - `App`: Main functional component.
- **Functions**:
    - `handleStarSelect`: Switches view to 'system' and sets the selected star data.
    - `handleBackToGalaxy`: Switches view back to 'galaxy' and clears selected star data.
    - `handleToggleLodMode`: Toggles the LOD mode between manual and automatic.
    - `handleSetManualLodLevel`: Sets the desired manual LOD level.
    - `handleEffectiveLodChange`: Callback passed to `GalaxyView` to receive updates on the currently active LOD level.
    - `handleHighSpeedModeChange`: Callback passed to `GalaxyView` to receive updates on the high-speed camera mode status.
- **State**: Manages `currentView`, `selectedStarData`, `isLodManual`, `manualLodLevel`, `effectiveLodLevel`, `isHighSpeedActive`.
- **Hooks**: `useState`, `useRef`, `useEffect`.
- **Key Features**: Sets up the main R3F `Canvas`, `OrbitControls`, and conditionally renders `GalaxyView` or `SystemView`. Also renders UI components like `LodControls` and `SystemInfoDisplay`.

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
    - Generates galaxy data using `generateGalaxyData` service.
    - Renders stars using the `StarPoints` component.
    - Renders nebulae using the `NebulaRenderer` component.
    - Uses `DreiStars` for distant background stars.
    - Displays interactive HTML tooltips for hovered stars.
    - Integrates LOD and high-speed mode detection for performance optimization.

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
- **Purpose**: Manages and renders a collection of `NebulaCloud` components, applying LOD and visibility rules.
- **Components**:
    - `NebulaRenderer`: React functional component.
- **Props**: `nebulaTexturePaths`, `lodLevel`, `isLodManual`, `manualLodOverride`, `isHighSpeedMode`.
- **Hooks**: `useMemo` (for `baseGeneratedNebulae`, `processedNebulae`).
- **Key Features**: 
    - Generates a list of nebula properties (position, scale, rotation, opacity, texture) based on `nebulaConfig.ts`.
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
- **Purpose**: A custom React hook to manage the Level of Detail (LOD) for the galaxy view. It determines the appropriate LOD level based on camera distance to the origin or a manual override.
- **Exports**:
    - `useGalaxyLOD`: The hook function.
- **Returns**: An object containing `lodLevel` (the calculated dynamic LOD level, 0-3) and `lodLevelChecked` (the LOD level to be used, clamped to be a valid index for `STAR_SIZE_LOD_CONFIG`).
- **Props**: `manualLodOverride` (optional number for manual LOD), `isLodManual` (boolean indicating if manual LOD is active), `onLodLevelChange` (optional callback for LOD level changes).
- **Key Features**:
    - Calculates LOD based on `camera.position.length()` and thresholds from `LOD_THRESHOLDS_CONFIG`.
    - Allows manual LOD override.
    - Clamps the final LOD level to ensure it's a valid index for `STAR_SIZE_LOD_CONFIG`.
    - Reports LOD changes via the `onLodLevelChange` callback.

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

## `src/services/galaxyService.ts`
- **Purpose**: Contains the core logic for procedurally generating the galaxy, including all its stars and their initial properties (like planets).
- **Exports**:
    - `generateGalaxyData()`: The main function that returns an object containing arrays of `StarData`, and Float32Arrays for positions, colors, and sizes.
    - `GalaxyData` (interface): Defines the structure of the returned galaxy data.
- **Functions**:
    - `generateRandomName()`: A helper function to create plausible random names for stars.
    - `generatePlanets()`: A helper function to generate a random set of planets for a given star, based on `planetConfig.ts`.
    - `generateGalaxyData()`: This is the main procedural generation algorithm. It creates stars based on `NUM_STARS` and distributes them according to `GALAXY_PARAMS` from `galaxyConfig.ts` into structures like:
        - Central Bar
        - Bulge
        - Spiral Arms (with sub-arms and tapering)
        - General Disk
        - Halo
        - Globular Clusters
        It assigns positions, colors (based on distance from galactic center, interpolating between `colorInHex` and `colorOutHex`), sizes, a random texture index, and calls `generatePlanets()` for each star. It also attempts to ensure a minimum distance between stars.

## `src/types/galaxy.ts`
- **Purpose**: Defines core TypeScript interfaces used throughout the application for celestial bodies.
- **Exports**:
    - `PlanetData`: Interface describing properties of a planet (id, name, type, size, orbitRadius, orbitSpeed, color, etc.).
    - `StarData`: Interface describing properties of a star (id, name, position (`THREE.Vector3`), color (`THREE.Color`), size, planets (array of `PlanetData`), textureIndex, etc.).

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