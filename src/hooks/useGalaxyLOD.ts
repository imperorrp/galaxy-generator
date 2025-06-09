import { useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GALAXY_RADIUS, LOD_THRESHOLDS_CONFIG, STAR_SIZE_LOD_CONFIG } from '../config/galaxyConfig';

interface UseGalaxyLODProps {
    manualLodOverride?: number | null;
    isLodManual?: boolean;
    onLodLevelChange?: (level: number) => void;
}

export const useGalaxyLOD = ({ manualLodOverride, isLodManual, onLodLevelChange }: UseGalaxyLODProps) => {
    const { camera } = useThree();
    const [lodLevel, setLodLevel] = useState(0); // 0: Far, 1: Mid, 2: Near, 3: Very Near

    const LOD_THRESHOLDS = useMemo(() => ({
        MID: GALAXY_RADIUS * LOD_THRESHOLDS_CONFIG.MID_FACTOR,
        NEAR: GALAXY_RADIUS * LOD_THRESHOLDS_CONFIG.NEAR_FACTOR,
        VERY_NEAR: GALAXY_RADIUS * LOD_THRESHOLDS_CONFIG.VERY_NEAR_FACTOR,
    }), []); // GALAXY_RADIUS and LOD_THRESHOLDS_CONFIG are stable constants

    // Effect to call onLodLevelChange whenever lodLevel changes, including the initial state
    useEffect(() => {
        if (onLodLevelChange) {
            onLodLevelChange(lodLevel);
        }
    }, [lodLevel, onLodLevelChange]);

    useFrame(() => {
        if (!camera) return;

        let newCalculatedLodLevel = lodLevel; // Start with current LOD level

        if (isLodManual && manualLodOverride !== null && manualLodOverride !== undefined) {
            newCalculatedLodLevel = manualLodOverride;
        } else {
            const distToOrigin = camera.position.length();
            if (distToOrigin < LOD_THRESHOLDS.VERY_NEAR) newCalculatedLodLevel = 3;
            else if (distToOrigin < LOD_THRESHOLDS.NEAR) newCalculatedLodLevel = 2;
            else if (distToOrigin < LOD_THRESHOLDS.MID) newCalculatedLodLevel = 1;
            else newCalculatedLodLevel = 0; // Default to far
        }

        if (newCalculatedLodLevel !== lodLevel) {
            setLodLevel(newCalculatedLodLevel);
        }
    });

    const lodLevelChecked = useMemo(() => {
        const configExistsAndHasLength = STAR_SIZE_LOD_CONFIG && STAR_SIZE_LOD_CONFIG.length > 0;
        let levelToUse = lodLevel;

        if (isLodManual && manualLodOverride !== null && manualLodOverride !== undefined) {
            // Prefer manual override if it's valid for the config
            if (configExistsAndHasLength && manualLodOverride >= 0 && manualLodOverride < STAR_SIZE_LOD_CONFIG.length) {
                levelToUse = manualLodOverride;
            } else {
                // If manual override is invalid (e.g. out of bounds), use current dynamic lodLevel (which will be clamped below)
                levelToUse = lodLevel;
            }
        }
        // If not in manual mode, levelToUse is already lodLevel

        // Clamp the chosen level to be a safe index for STAR_SIZE_LOD_CONFIG
        if (configExistsAndHasLength) {
            return Math.max(0, Math.min(levelToUse, STAR_SIZE_LOD_CONFIG.length - 1));
        }
        return levelToUse; // Fallback if STAR_SIZE_LOD_CONFIG is not usable (should not happen in practice)
    }, [isLodManual, manualLodOverride, lodLevel]);

    return { lodLevel, lodLevelChecked };
};