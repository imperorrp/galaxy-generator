# Development Plan: Galactic Conquest (React Three Fiber Edition)

This document outlines the step-by-step development plan for the Galactic Conquest project. Each phase focuses on delivering a functional increment.

## Phase 0: Project Setup & Foundation (1-2 days)

1.  **[TASK]** Initialize React Project:
    *   Use Vite: `npm create vite@latest galactic-conquest-r3f -- --template react` (or `react-ts`)
    *   Navigate into the project directory.
2.  **[TASK]** Install Core Dependencies:
    *   `npm install three @react-three/fiber @react-three/drei`
    *   (Optional) State management: `npm install zustand` (or `jotai`)
3.  **[TASK]** Setup Basic Directory Structure:
    *   Create `src/components/scene`, `src/components/ui`, `src/contexts`, `src/hooks`, `src/assets` (inside `public/`).
4.  **[TASK]** Basic R3F Canvas Setup in `App.jsx`:
    *   Render a `<Canvas>` with basic camera and `OrbitControls` from Drei.
    *   Add a simple placeholder like a rotating cube to confirm setup.
    *   Add basic ambient and point lights.
5.  **[TASK]** Implement Global Styles & CSS Reset:
    *   In `index.css`, ensure `body, html { margin: 0; padding: 0; overflow: hidden; background: #000; }` and `canvas { display: block; }`.
6.  **[TASK]** Version Control:
    *   Initialize Git repository (`git init`).
    *   Create initial commit.
7.  **[DOCUMENTATION]** Populate `README-SPECS.md` and `PLAN.MD` (this file) with initial details.

**Deliverable:** A blank canvas with basic 3D controls and a sample object, project structure in place.

## Phase 1: Galaxy View - Visualization (3-5 days)

1.  **[TASK]** Galaxy Data Generation Logic:
    *   Galaxy data generation is now handled by a set of specialized modules within the `src/services/galaxyGenerationModules/` directory. This modular approach replaces the formerly monolithic `galaxyService.ts`. The key modules and their responsibilities are:
        - `globularClusterStarGenerator.ts`: Manages the procedural generation of stars within globular clusters, including their positioning and characteristics.
        - `haloStarGenerator.ts`: Responsible for creating stars in the galactic halo, defining their distribution and properties distinct from the main galaxy body.
        - `mainGalaxyStarGenerator.ts`: The core module for generating stars within the primary galactic structures, such as the central bulge, spiral arms, and the galactic disk. It implements complex algorithms for realistic star placement and density variations.
        - `nameGenerator.ts`: A utility module providing functions to generate random, plausible-sounding names for stars and other celestial objects.
        - `outerDiskStarGenerator.ts`: Focuses on populating the sparser, outer regions of the galactic disk with stars.
        - `planetGenerator.ts`: Handles the procedural generation of planets for individual star systems, determining the number, types, and orbital characteristics of planets around a given star.
    *   The functionality previously envisioned for `starDataService.ts` (detailed star properties) and `generationUtils.ts` (common utilities) has been largely integrated into these specific modules or the main `generateGalaxyData.ts` orchestrator, ensuring that each module is self-contained or relies on clearly defined inputs.
    *   The core generation process, orchestrated by `generateGalaxyData.ts` (which utilizes these modules), produces star positions, colors, sizes, and metadata (ID, name, position Vector3, color object, texture index, planets) using techniques inspired by `new-galaxy-generation-ideas` for enhanced realism.
    *   This results in an array of `StarData` objects and pre-calculated `Float32Array`s for positions, colors, and sizes, optimized for use with `bufferGeometry` in R3F.
2.  **[TASK]** `GalaxyView.jsx` Component:
    *   Use the galaxy generation logic (e.g., via `useMemo` to run once).
    *   Render stars using a single `<points>` R3F component.
    *   Pass generated positions and colors to `bufferGeometry` attributes.
    *   Use `<pointsMaterial>` (or Drei's `<PointMaterial>`) with `vertexColors: true`.
    *   Adjust star size and appearance.
    *   Integrate `GalaxyView` into `App.jsx`.
3.  **[TASK]** Camera Configuration for Galaxy View:
    *   Set appropriate initial camera position, FOV, near/far planes in `App.jsx` for viewing the entire galaxy.
    *   Configure `OrbitControls` min/max distance, damping.
4.  **[TASK]** Basic Star Hover Effect:
    *   Add `onPointerOver` and `onPointerOut` to the `<points>` component.
    *   On hover, identify the hovered star's index (from `event.index`).
    *   Use Drei's `<Html>` component to display the star's name near the cursor or star.
    *   Update cursor style on hover.
5.  **[TASK]** Basic Star Selection State:
    *   Create `AppContext.jsx` (or use Zustand store) for global state: `selectedStar`, `currentView`.
    *   On `onClick` event on the `<points>` component:
        *   Identify the clicked star's index and retrieve its data.
        *   Update `selectedStar` in the global state.
        *   (For now, log selected star data to console).
6.  **[TASK]** Placeholder UI:
    *   Create `src/components/ui/InfoPanel.jsx`.
    *   Display basic info of the `selectedStar` from global state (if any).
    *   Style it minimally.
7.  **[TASK]** Background Stars (Optional):
    *   Use Drei's `<Stars />` component for a distant starfield effect.

**Deliverable:** A navigable 3D spiral galaxy where stars can be hovered over (showing name) and clicked (logging data and updating a basic info panel).

## Phase 2: System View - Visualization (3-5 days)

1.  **[TASK]** `SystemView.jsx` Component:
    *   Takes `starData` (of the selected star) as a prop or retrieves it from global state.
    *   Conditionally rendered in `App.jsx` based on `currentView === 'system'`.
2.  **[TASK]** `StarMesh.jsx` Component (for System View):
    *   Renders the central star of the system using `<sphereGeometry>` and `<meshBasicMaterial>` or `<meshStandardMaterial>` with an emissive color.
    *   Takes star properties (size, color) from `starData`.
    *   Add a `<pointLight />` parented to the star mesh to illuminate planets.
3.  **[TASK]** `PlanetMesh.jsx` Component:
    *   Takes `planetData` (from `starData.planets`) as a prop.
    *   Renders a planet using `<sphereGeometry>` and `<meshStandardMaterial>`.
    *   Implement basic planet textures (load a few generic ones using `useLoader` from Drei and `Suspense`).
    *   Use `useFrame` hook for orbital animation: update planet's position around the star based on `planetData.orbitRadius` and `orbitSpeed`.
    *   Add simple axial rotation.
4.  **[TASK]** Integrate System View Components:
    *   In `SystemView.jsx`, map over `starData.planets` to render multiple `<PlanetMesh />` components.
    *   Add `StarMesh.jsx`.
5.  **[TASK]** View Transition Logic:
    *   In `AppContext.jsx` or `App.jsx`:
        *   When a star is selected in `GalaxyView`, set `currentView = 'system'` and store `selectedStar` data.
        *   Adjust camera position, target, near/far planes, and `OrbitControls` settings (min/max zoom, target) to focus on the new system.
        *   This might involve a function in `App.jsx` or context that `SystemView` calls on mount to configure the camera.
6.  **[TASK]** System UI Panel:
    *   Create `src/components/ui/SystemInfoDisplay.jsx`.
    *   Display selected system's name and a list of its planets with basic details.
    *   Add a "Back to Galaxy" button.
7.  **[TASK]** "Back to Galaxy" Functionality:
    *   Button click sets `currentView = 'galaxy'` in global state.
    *   `App.jsx` reconfigures camera and controls for Galaxy View.
    *   Ensure proper cleanup/hiding of `SystemView` components.
8.  **[TASK]** Orbit Lines (Optional Enhancement):
    *   In `PlanetMesh.jsx` or `SystemView.jsx`, draw orbit lines using Drei's `<Line>` or by creating a `LineLoop` with `EllipseCurve`.

**Deliverable:** Clicking a star transitions to a 3D view of that star system with orbiting planets. A UI panel shows system info, and a button allows returning to the galaxy view.

## Phase 3: Enhancements & Important Systems (2-4 days)

1.  **[TASK]** Galaxy Visual Polish:
    *   **[DONE]** Implement realistic spiral galaxy structure (central bulge, spiral arms, skewed radial distribution, logarithmic math, refined scatter, densified bulge, gradient coloring based on `new-galaxy-generation-ideas`). (Covered by previous work, now refactored into `src/services/galaxyGenerationModules/` from `galaxyService.ts`)
    *   **[DONE]** Implement Star Texture Variety: Load multiple star particle textures (e.g., 2-3 variations) and randomly assign them to stars for a more diverse visual appearance in the galaxy view. (Implemented, requires user to add textures)
    *   **[TODO]** Add nebula textures using `PlaneGeometry` and transparent textures, or more `<points>` clouds. (Deferred as per `CURRENT-PROGRESS-STATUS.md`)
    *   **[TODO]** Refine star particle appearance (general, beyond spiral structure).
    *   **[TODO]** Add loosely scattered stars beyond the main galaxy disk.
    *   **[TODO]** Implement globular clusters within and around the galaxy.
    *   Consider a skybox (CubeTexture) for a richer background.
    *   **[TASK]** Implement Dynamic Level of Detail (LoD) for star rendering: The `useGalaxyLOD` hook manages automatic LOD switching. An Octree (`PointOctree.ts`) is built from all star positions to find the nearest star to the camera. The distance to this star determines the LOD level (0-3). This calculation occurs every 10 frames. If no star is found or the Octree is unavailable, distance to the galaxy origin is used as a fallback. The system also supports manual LOD overrides.
    *   **[TASK]** Implement Optimized Camera Mode (replaces High-Speed Rotation Mode, now externally controlled and monitors performance degradation) for performance adjustments.
2.  **[TASK]** Define Important Systems:
    *   Create `src/data/predefinedSystems.js` with data for a few key systems (name, specific planet configurations if desired, `isKeySystem: true`).
    *   Merge this data with procedurally generated stars in `useGalaxyGenerator.js` or apply it post-generation.
3.  **[TASK]** Visual Distinction for Important Systems:
    *   **Option A (Galaxy Points):** Modify the color/size attribute in the `bufferGeometry` for these stars.
    *   **Option B (Separate Components):** In `GalaxyView.jsx`, filter out important systems from the main points cloud and render them as individual `<KeyStarMarker />` components (e.g., a small Sprite or Mesh). This allows for easier individual interaction.
4.  **[TASK]** Planet Texture Variety:
    *   Source/create more planet textures.
    *   Update `PlanetData` and `PlanetMesh.jsx` to use a wider range of textures, possibly based on `planetData.type`.
5.  **[TASK]** UI Styling and Polish:
    *   Improve the CSS for `InfoPanel.jsx` and `SystemInfoDisplay.jsx`.
    *   Ensure consistent look and feel.
    *   **[TASK]** Implement UI controls for toggling LoD modes and managing optimized camera mode (e.g., allowing user to request optimized state).

**Deliverable:** A more visually appealing galaxy with distinct key systems. Planets have varied textures. UI is more polished.

## Phase 4: Basic Game Data & Representation (3-5 days)

1.  **[TASK]** Expand Data Models:
    *   In `README-SPECS.md` (and types if using TS), define `FactionData` and initial `FleetData`.
    *   Add `factionId` to `StarData`. Assign factions to some key systems or procedurally.
2.  **[TASK]** Faction Representation:
    *   Visually indicate star system ownership/faction (e.g., color-coding star markers, UI elements).
3.  **[TASK]** Trade Route Data & Visualization:
    *   Define a simple list of trade routes connecting key system IDs in `src/data/tradeRoutes.js`.
    *   Create `src/components/scene/TradeRouteLine.jsx`.
    *   In `GalaxyView.jsx`, map over trade route data, get start/end star positions, and render `<TradeRouteLine />` components (using Drei's `<Line>` or `THREE.LineSegments`).
    *   Style lines (e.g., dashed, color).
4.  **[TASK]** Basic Fleet Data & Representation:
    *   Create initial fleet data (e.g., a few fleets belonging to factions, stationed at specific stars).
    *   Store this in global state (e.g., Zustand store `gameState.fleets`).
    *   Create `src/components/scene/FleetMarker.jsx` (e.g., a simple `Sprite` or small `Mesh` like a cone/arrow).
    *   In `GalaxyView.jsx`, render `<FleetMarker />` components for each fleet at its star's location.
5.  **[TASK]** Update UI Panels:
    *   `InfoPanel.jsx` (for selected star) should show faction and any fleets present.
    *   Consider a dedicated `FactionPanel.jsx` or `FleetPanel.jsx` for later.

**Deliverable:** Galaxy map shows faction ownership, trade routes between key systems, and static fleet markers at systems.

## Phase 5: Basic Strategy - Fleet Movement (4-6 days)

1.  **[TASK]** Implement Fleet Movement Logic:
    *   In global state manager (e.g., Zustand store actions):
        *   Action: `moveFleet(fleetId, targetStarId)`.
        *   Logic:
            *   Set `fleet.destinationStarId = targetStarId`.
            *   Mark fleet as `inTransit = true`.
            *   Calculate travel time (e.g., based on distance).
            *   Store `departureTime` or `arrivalTime`.
2.  **[TASK]** Animate Fleet Markers:
    *   In `FleetMarker.jsx` or a controlling component:
        *   Use `useFrame`. If fleet is `inTransit`:
            *   Lerp (linearly interpolate) the fleet marker's position from its origin star towards its destination star over the calculated travel time.
            *   When destination is reached, update `fleet.locationStarId = fleet.destinationStarId`, `fleet.inTransit = false`.
3.  **[TASK]** UI for Fleet Commands:
    *   When a star with a friendly fleet is selected, or a fleet itself is selected (requires making fleet markers clickable):
        *   Show a "Move Fleet" button in the UI.
        *   Allow selecting a destination star (e.g., by clicking another star on the map while in "move mode").
4.  **[TASK]** Turn-Based System (Simple):
    *   Introduce a "Next Turn" button.
    *   Game state updates (like fleet arrival, resource generation) happen when "Next Turn" is clicked.
    *   OR: Real-time tick if preferred (fleet movement would be continuous). For simplicity, turn-based might be easier initially.
5.  **[TASK]** Game State Persistence (Basic):
    *   On "Next Turn" or significant game events, save the current game state (fleets, factions, star ownership) to `localStorage`.
    *   Implement a "Load Game" function to restore state from `localStorage` on app start.

**Deliverable:** Users can select fleets and order them to move to other star systems. Fleet markers animate along their paths. A basic turn or time progression system is in place. Game state can be saved/loaded locally.


## Ongoing Tasks (Throughout all phases)

*   **[TASK]** Code Refactoring & Optimization: Regularly review and improve code.
*   **[TASK]** Component Reusability: Identify and create reusable components.
*   **[TASK]** Error Handling & Robustness: Add checks and balances.
*   **[TASK]** Testing (Manual for now, consider unit/integration tests later): Test all features thoroughly.
*   **[DOCUMENTATION]** Keep `README-SPECS.md` and `PLAN.MD` updated with any changes or new insights. Add JSDoc comments to complex functions/components.
*   **[PERFORMANCE]** Monitor performance using browser dev tools, especially with increasing numbers of objects or complex animations.

This plan is ambitious. Adjust timelines based on complexity and available time. Focus on getting each phase's core deliverables working before moving to extensive polish or advanced features.