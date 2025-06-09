import { useState, useMemo, useEffect, useRef } from 'react'; // Added useRef
import { useFrame, useThree } from '@react-three/fiber';
import { GALAXY_RADIUS, LOD_THRESHOLDS_CONFIG, STAR_SIZE_LOD_CONFIG } from '../config/galaxyConfig';
import * as THREE from 'three'; // Added for THREE.Vector3
import { PointOctree, type IPointOctree } from '../utils/PointOctree'; // Import Octree

const LOD_CALCULATION_INTERVAL_FRAMES = 10; // Calculate LOD e.g. every 10 frames

interface UseGalaxyLODProps {
    manualLodOverride?: number | null;
    isLodManual?: boolean;
    onLodLevelChange?: (level: number) => void;
    allStarPositions?: THREE.Vector3[]; // Prop for all star positions
}

export const useGalaxyLOD = ({ manualLodOverride, isLodManual, onLodLevelChange, allStarPositions }: UseGalaxyLODProps) => {
    const { camera } = useThree();
    const [lodLevel, setLodLevel] = useState(0); // 0: Far, 1: Mid, 2: Near, 3: Very Near
    const frameCounterRef = useRef(0); // For throttling LOD calculations
    const octreeRef = useRef<IPointOctree | null>(null); // Ref to store the Octree instance

    const LOD_THRESHOLDS = useMemo(() => ({
        MID: GALAXY_RADIUS * LOD_THRESHOLDS_CONFIG.MID_FACTOR,
        NEAR: GALAXY_RADIUS * LOD_THRESHOLDS_CONFIG.NEAR_FACTOR,
        VERY_NEAR: GALAXY_RADIUS * LOD_THRESHOLDS_CONFIG.VERY_NEAR_FACTOR,
    }), []);

    useEffect(() => {
        if (onLodLevelChange) {
            onLodLevelChange(lodLevel);
        }
    }, [lodLevel, onLodLevelChange]);

    // Effect to build/rebuild the Octree when star positions change
    useEffect(() => {
        if (allStarPositions && allStarPositions.length > 0) {
            // The PointOctree constructor will compute the bounding box from the points.
            octreeRef.current = new PointOctree(allStarPositions);
        } else {
            octreeRef.current = null;
        }
    }, [allStarPositions]);

    useFrame(() => {
        if (!camera) return;

        if (isLodManual && manualLodOverride !== null && manualLodOverride !== undefined) {
            if (manualLodOverride !== lodLevel) {
                setLodLevel(manualLodOverride);
            }
            return;
        }

        frameCounterRef.current++;
        if (frameCounterRef.current % LOD_CALCULATION_INTERVAL_FRAMES === 0) {
            let effectiveDist: number;
            const cameraPos = camera.position;

            if (octreeRef.current) {
                const nearestStarPos = octreeRef.current.findClosestPoint(cameraPos);
                if (nearestStarPos) {
                    effectiveDist = cameraPos.distanceTo(nearestStarPos);
                } else {
                    // Fallback if Octree is empty or finds no point
                    effectiveDist = cameraPos.length(); // Distance to origin
                }
            } else {
                // Fallback if Octree is not available (e.g., no stars provided, or initial state)
                effectiveDist = cameraPos.length(); // Distance to origin
            }

            let newCalculatedLodLevel = 0; // Default to far
            if (effectiveDist < LOD_THRESHOLDS.VERY_NEAR) newCalculatedLodLevel = 3;
            else if (effectiveDist < LOD_THRESHOLDS.NEAR) newCalculatedLodLevel = 2;
            else if (effectiveDist < LOD_THRESHOLDS.MID) newCalculatedLodLevel = 1;

            if (newCalculatedLodLevel !== lodLevel) {
                setLodLevel(newCalculatedLodLevel);
            }
        }
    });

    const lodLevelChecked = useMemo(() => {
        const configExistsAndHasLength = STAR_SIZE_LOD_CONFIG && STAR_SIZE_LOD_CONFIG.length > 0;
        let levelToUse = lodLevel;

        if (isLodManual && manualLodOverride !== null && manualLodOverride !== undefined) {
            if (configExistsAndHasLength && manualLodOverride >= 0 && manualLodOverride < STAR_SIZE_LOD_CONFIG.length) {
                levelToUse = manualLodOverride;
            } else {
                levelToUse = lodLevel;
            }
        }

        if (configExistsAndHasLength) {
            return Math.max(0, Math.min(levelToUse, STAR_SIZE_LOD_CONFIG.length - 1));
        }
        return levelToUse;
    }, [isLodManual, manualLodOverride, lodLevel]);

    return { lodLevel, lodLevelChecked };
};