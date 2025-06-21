0. Context: Project Scope and Intent

   This project is a 3D procedural galaxy simulator built with React and React Three Fiber. The immediate goal is to create a visually rich and performant simulation of a galaxy. The long-term vision is for this simulator to serve as the foundation for a 4X style strategy game or a story-driven exploration game.

   -   **Core User Experience:** Exploring a vast, procedurally generated galaxy; seamless transitions between a galaxy-wide view and a detailed star-system view.
   -   **Key Technical Challenge:** Performance. Rendering tens of thousands of interactive objects (stars) at a smooth framerate is paramount.

1. **Best Practices:**  
   - Optimize for performance, maintainability, readability, and modularity.

2. **Functional Modularity:**  
   - Design well-defined, reusable functions to handle discrete tasks.  
   - Each function must have a single, clear purpose to avoid unnecessary fragmentation.

3. **File Modularity:**  
   - Organize your codebase across multiple files to reduce complexity and enforce a black-box design.  
   - Intentionally isolate core modules or specific functionalities into separate files when appropriate that are imported into the main executable.

4. **Comments and Documentation:**  
   - Begin EVERY file with a comment block that explains its purpose and role within the project.  
   - Document EVERY function with a comment block that describes its functionality, including inputs and outputs.  
   - Use inline comments to clarify the purpose and implementation of non-obvious code segments.  
   - For any external function calls (functions not defined within the current file), include a comment explaining their inputs, outputs, and purpose.

5. **Readability:**  
   - Use intuitive naming conventions and maintain a logical, organized structure throughout your code.

6. **Version Control and Logging:**  
   - Always log code changes made to the changelog.md file in the root directory, including the date, the change made, and a brief description of the change.
   - Utilize version control (e.g., Git) to manage and track changes to your codebase.
   - Commit changes with descriptive commit messages that accurately reflect the changes made.

7. **Error Handling:**  
   - Implement comprehensive error handling to prevent unexpected issues and provide meaningful feedback to users.

8. ** Core Stack & Dependencie:**

   - The project is built on the following stack. 

      -   **React:** `19.1.0`
      -   **Three.js:** `^0.177.0`
      -   **@react-three/fiber:** `^9.1.2`
      -   **@react-three/drei:** `^10.1.2`
      -   **TypeScript:** `~5.8.3` (with `strict` mode enabled)
      -   **Vite:** `^6.3.5`

9. Performance & Optimization

   This is a critical concern for this project.

   -   **`useFrame`:** Be extremely mindful of logic inside `useFrame`. Any calculation done here runs on every frame and is a potential performance bottleneck.
   -   **Memoization:** Use `useMemo` for expensive calculations (like galaxy generation) and `useCallback` for functions passed as props to memoized components to prevent unnecessary re-renders.
   -   **Geometry:** For large numbers of similar objects (like stars), prefer buffered geometries (`<points>` with attributes) over rendering thousands of individual meshes. The current `StarPoints.tsx` is the canonical example.

   