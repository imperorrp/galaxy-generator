import React, { useMemo, Fragment } from 'react';
import * as THREE from 'three';
import { PointMaterial, useTexture } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { StarData } from '../../types/galaxy';
import { STAR_SIZE_LOD_CONFIG } from '../../config/galaxyConfig'; // Assuming this will be passed or imported if static

export interface StarGroup {
  stars: StarData[];
  positions: Float32Array;
  colors: Float32Array;
  textureIndex: number;
}

interface StarPointsProps {
  starGroups: StarGroup[];
  loadedStarTextures: THREE.Texture[];
  lodLevel: number;
  isHighSpeedMode: boolean;
  onStarHover: (starData: StarData | null, position: THREE.Vector3 | null) => void;
  onStarClick: (starData: StarData) => void;
  // STAR_SIZE_LOD_CONFIG is imported directly for now, can be passed as prop if dynamic
}

const StarPoints: React.FC<StarPointsProps> = ({
  starGroups,
  loadedStarTextures,
  lodLevel,
  isHighSpeedMode,
  onStarHover,
  onStarClick,
}) => {
  const circleAlphaMap = useTexture('/assets/textures/star_particle.png');
  const memoizedStarGeometries = useMemo(() => {
    return starGroups.map(group => {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(group.positions, 3));
      geom.setAttribute('color', new THREE.Float32BufferAttribute(group.colors, 3));
      return geom;
    });
  }, [starGroups]);

  const handlePointerOver = (event: ThreeEvent<PointerEvent>, groupStars: StarData[]) => {
    event.stopPropagation();
    if (event.index !== undefined && groupStars) {
      const starData = groupStars[event.index];
      if (starData) {
        onStarHover(starData, starData.position.clone());
        document.body.style.cursor = 'pointer';
      }
    }
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onStarHover(null, null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (event: ThreeEvent<MouseEvent>, groupStars: StarData[]) => {
    event.stopPropagation();
    if (event.index !== undefined && groupStars) {
      const starData = groupStars[event.index];
      if (starData) {
        onStarClick(starData);
      }
    }
  };

  const currentStarSize = STAR_SIZE_LOD_CONFIG[lodLevel] ?? STAR_SIZE_LOD_CONFIG[0];

  return (
    <>
      {starGroups.map((group, groupIndex) => (
        <Fragment key={`star-group-${group.textureIndex}-${groupIndex}`}>
          {/* Normal Mode Stars */}
          <points
            visible={!isHighSpeedMode}
            geometry={memoizedStarGeometries[groupIndex]}
            onPointerOver={(e) => handlePointerOver(e, group.stars)}
            onPointerOut={handlePointerOut}
            onClick={(e) => handleClick(e, group.stars)}
          >
            <PointMaterial
              transparent
              vertexColors
              size={currentStarSize}
              sizeAttenuation={true}
              depthWrite={false}
              alphaTest={0.01}
              blending={THREE.AdditiveBlending}
              map={loadedStarTextures[group.textureIndex % loadedStarTextures.length]}
            />
          </points>

          {/* High-Speed Mode Stars (Simplified - Circular Meshes) */}
          <points
            visible={isHighSpeedMode}
            geometry={memoizedStarGeometries[groupIndex]}
            // No interactions in high-speed mode for performance
          >
            <PointMaterial
              transparent
              vertexColors
              size={currentStarSize} // Using currentStarSize as per new requirement
              sizeAttenuation={true}
              depthWrite={false}
              alphaTest={0.01} // May need adjustment for circular appearance if not using alphaMap
              blending={THREE.AdditiveBlending}
              alphaMap={circleAlphaMap}
              // map prop removed to render as simple points.
              // Using alphaMap with star_particle.png to attempt circular points.
            />
          </points>
        </Fragment>
      ))}
    </>
  );
};

export default StarPoints;