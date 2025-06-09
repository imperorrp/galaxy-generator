# README & Specifications: Galactic Conquest (React Three Fiber Edition)

## 1. Project Overview

**Galactic Conquest** is an interactive web-based 3D galaxy map and light strategy game inspired by Star Wars. Users can explore a procedurally generated galaxy, zoom into star systems, view planets, and eventually engage in strategic gameplay involving factions, fleets, and resource management.

The application will be built using React, Three.js, and React Three Fiber (R3F) with Drei for enhanced 3D rendering and interaction within the browser.

## 2. Core Features (MVP & Future)

### 2.1. Galaxy View (MVP)
    - Procedurally generated spiral galaxy with tens of thousands of stars.
    - Stars represented as points with varying colors and potentially sizes.
    - Camera controls: Orbit (rotate), zoom, pan.
    - Star selection: Clicking a star highlights it and displays basic information.
    - Hover effect: Displaying star name on hover.
    - Transition to System View upon star selection.
    - Dynamic Level of Detail (LoD) for star rendering to optimize performance, managed by the `useGalaxyLOD` hook. This system uses an Octree (`src/utils/PointOctree.ts`) to find the nearest star to the camera, calculating LOD every 10 frames. If no star is found, distance to galaxy origin is used as a fallback.
    - Optimized Camera Mode (replaces High-Speed Rotation Mode, now externally controlled and monitors performance degradation) for performance adjustments during camera movement or when performance issues are detected.

### 2.2. System View (MVP)
    - Displays a selected star and its procedurally generated planets.
    - Planets orbit the star.
    - Planets have distinct (procedural for MVP) textures/colors and sizes.
    - Camera controls: Orbit around the system, zoom.
    - UI panel displaying system name and planet details.
    - Button to return to Galaxy View.

### 2.3. Important Systems (Post-MVP)
    - Designated "key" systems (e.g., Coruscant, Tatooine) with predefined names and potentially unique characteristics.
    - Visually distinct representation in the Galaxy View.

### 2.4. Galactic Trade Routes (Post-MVP)
    - Visual representation of major hyperlanes or trade routes connecting important systems.
    - Static lines in Galaxy View for MVP, potentially animated later.

### 2.5. Fleets & Basic Strategy (Future)
    - Representation of fleets belonging to factions.
    - Fleets can be stationed at star systems or move between them.
    - Basic faction data (e.g., Empire, Rebellion, Neutral).
    - Simple resource model for key systems.
    - UI for basic fleet commands (e.g., move).

### 2.6. UI/UX (Ongoing)
    - Clean, intuitive, and responsive user interface.
    - Information panels for selected objects (stars, planets, fleets).
    - Controls for game actions.
    - UI controls for toggling Level of Detail (LoD) modes.
    - UI controls for managing optimized camera mode (e.g., allowing user to request optimized state).

## 3. Technical Specifications

### 3.1. Frontend Stack
    - **React:** v18+ (with Hooks)
    - **React Three Fiber (@react-three/fiber):** Latest stable version
    - **Drei (@react-three/drei):** Latest stable version (for helpers like OrbitControls, Html, Stars, Loaders)
    - **Three.js:** Latest stable version (managed by R3F)
    - **JavaScript (ES6+):** Or TypeScript (recommended for larger projects, but optional for this plan)
    - **Vite:** As the build tool and development server.
    - **State Management:**
        - React Context API for simple global state (e.g., current view, selected star).
        - Zustand or Jotai for more complex game state management (fleets, resources, factions) - to be decided in later phases.
    - **Styling:** CSS Modules, Styled-Components, or Tailwind CSS (TBD, start with basic CSS).
    - **Routing (Optional for MVP):** React Router if multiple top-level "pages" are needed beyond the main map.

### 3.2. 3D Scene Details
    - **Galaxy Generation:**
        - Procedural galaxy generation is handled by a collection of specialized modules located in `src/services/galaxyGenerationModules/`. This modular system replaces the previous monolithic `galaxyService.ts`. Each module is responsible for a specific aspect of galaxy creation:
            - `globularClusterStarGenerator.ts`: Generates stars within globular clusters, defining their positions and characteristics.
            - `haloStarGenerator.ts`: Creates stars in the galactic halo, managing their distribution and properties.
            - `mainGalaxyStarGenerator.ts`: The primary module for generating stars in the main galactic structures (bulge, central bar, spiral arms, disk), employing complex algorithms for realistic placement and density.
            - `nameGenerator.ts`: A utility for generating random, plausible-sounding names for celestial objects.
            - `outerDiskStarGenerator.ts`: Populates the sparser, outer regions of the galactic disk with stars.
            - `planetGenerator.ts`: Manages the procedural generation of planets for individual star systems, including their number, types, and orbital parameters.
        - The overall generation process, likely orchestrated by a higher-level function (e.g., `generateGalaxyData.ts` which is not a module itself but uses them), integrates these modules to produce a comprehensive galaxy model. Functionality previously conceptualized for `starDataService.ts` (detailed star properties) and `generationUtils.ts` (common utilities) is now largely incorporated within these specific modules or the orchestrating logic, ensuring modularity and clear responsibilities. The generation process uses techniques inspired by `new-galaxy-generation-ideas` for realism (e.g., skewed radial distribution, logarithmic spirals, densified bulge, gradient coloring).
        - General utilities, such as the Octree implementation for spatial indexing (`PointOctree.ts`), are found in `src/utils/`.
        - Star attributes: Position (Vector3), color, size (optional), unique ID, name, metadata (faction, planets).
        - Galaxy data is typically generated once (e.g., using `useMemo` in a component that consumes the service).
        - Stars rendered using dynamic Level of Detail (LoD): The `useGalaxyLOD` hook determines the LOD level based on the camera's proximity to the nearest star (found via an Octree of all star positions, updated every 10 frames) or distance to origin as a fallback. This LOD level influences star sizes and potentially other visual aspects. Stars are primarily rendered using a single `<points>` R3F component.
        - **Star Texture Variety:** Multiple star particle textures (e.g., 2-3 variations) will be loaded and randomly assigned to stars to enhance visual diversity in the galaxy view.
        - **Loosely Scattered Stars:** Additional stars will be generated beyond the main galactic disk to create a more natural, less defined edge.
        - **Globular Clusters:** Small, dense clusters of stars will be procedurally generated and positioned both within the galactic halo and potentially embedded closer to the disk.
    - **Star System Generation:**
        - Star: `SphereGeometry`, emissive or basic material. Point light source.
        - Planets: `SphereGeometry`, `MeshStandardMaterial` with procedural or loaded textures.
        - Orbits: Animated via `useFrame` hook, optional visual lines (`LineLoop`).
    - **Asset Loading:**
        - `useLoader` from R3F/Drei for textures (planets, star sprites, nebulae).
        - `Suspense` for fallback UI during asset loading.
    - **Interactivity:**
        - Raycasting handled by R3F's event system (`onClick`, `onPointerOver`, `onPointerOut` on mesh/points components).
        - `OrbitControls` from Drei for camera manipulation.

### 3.3. Data Structures (Conceptual)
    - **Star Object:**
        ```typescript
        interface StarData {
            id: string;
            name: string;
            position: THREE.Vector3; // or [number, number, number] for serialization
            color: THREE.Color;      // or string hex
            size?: number;
            isKeySystem?: boolean;
            factionId?: string;
            planets: PlanetData[];
            // ... other strategic properties
        }
        ```
    - **Planet Object:**
        ```typescript
        interface PlanetData {
            id: string;
            name: string;
            type: 'terrestrial' | 'gas_giant' | 'ice' | 'desert' | 'volcanic'; // etc.
            size: number; // relative to star or absolute
            orbitRadius: number;
            orbitSpeed: number;
            axialTilt?: number;
            rotationSpeed?: number;
            textureUrl?: string;
            color?: string; // fallback if no texture
            // ... resources, population etc.
        }
        ```
    - **Fleet Object (Future):**
        ```typescript
        interface FleetData {
            id: string;
            ownerFactionId: string;
            locationStarId: string | null; // null if in transit
            destinationStarId?: string;
            composition: Ship[]; // Array of ship objects
            // ... stats, orders
        }
        ```
    - **Faction Object (Future):**
        ```typescript
        interface FactionData {
            id: string;
            name: string;
            color: string; // for UI/map representation
            // ... AI behavior, resources
        }
        ```

### 3.4. Directory Structure (Proposed)
    ```
    galactic-conquest-r3f/
    ├── public/
    │   └── assets/
    │       ├── textures/
    │       │   ├── stars/ (e.g., star_particle.png)
    │       │   ├── planets/ (e.g., desert.jpg, terran.jpg)
    │       │   └── nebulae/
    │       └── models/ (future)
    ├── src/
    │   ├── App.jsx               # Main application component, R3F Canvas setup
    │   ├── main.jsx              # Entry point
    │   ├── index.css             # Global styles
    │   ├── components/
    │   │   ├── scene/            # 3D scene specific components
    │   │   │   ├── GalaxyView.jsx
    │   │   │   ├── SystemView.jsx
    │   │   │   ├── StarPoint.jsx   # (If individual stars are components)
    │   │   │   ├── StarMesh.jsx    # For the central star in SystemView
    │   │   │   ├── PlanetMesh.jsx
    │   │   │   ├── NebulaPatches.jsx # Optional
    │   │   │   └── TradeRouteLine.jsx # Future
    │   │   │   └── FleetMarker.jsx    # Future
    │   │   └── ui/               # 2D UI components
    │   │       ├── InfoPanel.jsx
    │   │       ├── SystemInfoDisplay.jsx
    │   │       ├── GalaxyControls.jsx
    │   │       └── HUD.jsx
    │   ├── contexts/             # React Context for global state
    │   │   └── AppContext.jsx    # e.g., for view state, selected objects
    │   │   └── GameStateContext.jsx # Future, for game logic state
    │   ├── hooks/                # Custom React hooks
    │   │   └── useGalaxyLOD.ts   # Hook for managing Level of Detail (uses Octree for nearest star detection)
    │   │   └── useCameraDynamics.ts # Hook for camera movement analysis
    │   │   └── useTextureAnisotropy.ts # Hook for texture optimization
    │   ├── services/             # Business logic, data generation services
    │   │   ├── galaxyGenerationModules/  # Contains specialized modules for different aspects of galaxy generation (e.g., mainGalaxyStarGenerator.ts, planetGenerator.ts, etc.)
    │   ├── data/                 # Static data, predefined systems (if any)
    │   │   └── predefinedSystems.js
    │   └── utils/                # Utility functions
    │       ├── PointOctree.ts    # Octree implementation for spatial indexing (used by useGalaxyLOD)
    │       └── threeUtils.js     # Three.js specific helpers if needed
    ├── vite.config.js
    ├── package.json
    └── README-SPECS.md
    └── PLAN.MD
    ```

## 4. Non-Functional Requirements
    - **Performance:** Smooth rendering (aim for 60 FPS) even with many stars. Efficient data handling.
    - **Responsiveness:** Basic responsiveness for different screen sizes (UI panels adapt, canvas resizes).
    - **Maintainability:** Clean, well-commented, modular code.
    - **Extensibility:** Architecture should allow for easy addition of new features (game mechanics, UI elements).

## 5. Assumptions & Constraints
    - Browser-based, no backend required for MVP (game state in client).
    - Modern browser with WebGL support.
    - Initial focus on visualization and core interaction, strategy elements are secondary.
    - Assets (textures) will be sourced or created (placeholder initially).

## 6. Future Considerations (Beyond Scope of Initial Plan)
    - Backend for persistent game state and multiplayer.
    - Advanced AI for NPC factions.
    - More detailed 3D models for ships/stations.
    - Sound design and music.
    - Mobile optimization (challenging for 3D).