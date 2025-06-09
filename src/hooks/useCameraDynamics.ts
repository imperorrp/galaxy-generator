import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface UseCameraDynamicsProps {
    onOptimizedModeChange?: (isActive: boolean) => void;
    userRequestedOptimizedMode?: boolean; // New: To control optimized mode externally
}

interface UseCameraDynamicsReturn {
    isRotating: boolean;
    isOptimizedMode: boolean;
    smoothedAngularSpeed: number;
    rawAngularSpeed: number;
    cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>;
    averageFrameTime: number;
    // toggleOptimizedMode: () => void; // REMOVED: Mode is now controlled by prop
}

const PERFORMANCE_ISSUE_FRAME_TIME_THRESHOLD = 1 / 20;
const PERFORMANCE_SAMPLE_WINDOW_SIZE = 30;

export const useCameraDynamics = ({
    onOptimizedModeChange,
    userRequestedOptimizedMode = false, // Default to false
}: UseCameraDynamicsProps): UseCameraDynamicsReturn => {
    const { camera: threeCamera } = useThree();
    const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(threeCamera);

    useEffect(() => {
        cameraRef.current = threeCamera;
    }, [threeCamera]);

    const [isRotating, setIsRotating] = useState(false);
    const [isOptimizedMode, setIsOptimizedMode] = useState(userRequestedOptimizedMode);
    const [rawAngularSpeed, setRawAngularSpeed] = useState(0);
    const [smoothedAngularSpeed, setSmoothedAngularSpeed] = useState(0);
    const [averageFrameTime, setAverageFrameTime] = useState(0);
    const cameraRotationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastCameraQuaternionRef = useRef(new THREE.Quaternion());
    const prevCameraQuaternionRef = useRef(new THREE.Quaternion());
    const recentFrameTimesRef = useRef<number[]>([]);
    const [isPerformanceDegraded, setIsPerformanceDegraded] = useState(false);

    useEffect(() => {
        if (cameraRef.current) {
            const isDefaultQuaternion = (q: THREE.Quaternion) => q.x === 0 && q.y === 0 && q.z === 0 && q.w === 1;
            if (isDefaultQuaternion(lastCameraQuaternionRef.current)) {
                lastCameraQuaternionRef.current.copy(cameraRef.current.quaternion);
            }
            if (isDefaultQuaternion(prevCameraQuaternionRef.current)) {
                prevCameraQuaternionRef.current.copy(cameraRef.current.quaternion);
            }
        }
    }, [cameraRef.current]);

    // Effect to synchronize isOptimizedMode with userRequestedOptimizedMode and report changes
    useEffect(() => {
        setIsOptimizedMode(userRequestedOptimizedMode);
        onOptimizedModeChange?.(userRequestedOptimizedMode);
        console.log(
            `useCameraDynamics Effect: userRequestedOptimizedMode is ${userRequestedOptimizedMode}. Setting internal isOptimizedMode. Calling onOptimizedModeChange.`
        );
    }, [userRequestedOptimizedMode, onOptimizedModeChange]);

    useFrame((state, delta) => {
        const currentCamera = cameraRef.current;
        if (!currentCamera) return;

        // Rotation detection logic
        if (!lastCameraQuaternionRef.current.equals(currentCamera.quaternion)) {
            if (!isRotating) {
                setIsRotating(true);
            }
            if (cameraRotationTimerRef.current) {
                clearTimeout(cameraRotationTimerRef.current);
            }
            cameraRotationTimerRef.current = setTimeout(() => {
                setIsRotating(false);
            }, 200);
            lastCameraQuaternionRef.current.copy(currentCamera.quaternion);
        }

        // Calculate raw and smoothed angular speed
        const angleChange = prevCameraQuaternionRef.current.angleTo(currentCamera.quaternion);
        let newRawSpeed = 0;
        const MIN_DELTA_FOR_SPEED_CALCULATION = 0.001;

        if (delta > 1e-5) {
            const effectiveDelta = Math.max(delta, MIN_DELTA_FOR_SPEED_CALCULATION);
            newRawSpeed = angleChange / effectiveDelta;
        }
        prevCameraQuaternionRef.current.copy(currentCamera.quaternion);

        const newSmoothedSpeed = smoothedAngularSpeed * 0.50 + newRawSpeed * 0.50;
        setRawAngularSpeed(newRawSpeed);
        setSmoothedAngularSpeed(newSmoothedSpeed);

        // Performance monitoring & averageFrameTime calculation
        let currentReportedFrameTime = delta;
        if (delta > 0) {
            recentFrameTimesRef.current.push(delta);
            if (recentFrameTimesRef.current.length > PERFORMANCE_SAMPLE_WINDOW_SIZE) {
                recentFrameTimesRef.current.shift();
            }

            if (recentFrameTimesRef.current.length === PERFORMANCE_SAMPLE_WINDOW_SIZE) {
                currentReportedFrameTime = recentFrameTimesRef.current.reduce((a, b) => a + b, 0) / PERFORMANCE_SAMPLE_WINDOW_SIZE;
            }
            setAverageFrameTime(currentReportedFrameTime);

            if (isRotating) {
                if (recentFrameTimesRef.current.length === PERFORMANCE_SAMPLE_WINDOW_SIZE) {
                    const avgFrameTimeForPerfCheck = currentReportedFrameTime;
                    if (avgFrameTimeForPerfCheck > PERFORMANCE_ISSUE_FRAME_TIME_THRESHOLD) {
                        if (!isPerformanceDegraded) setIsPerformanceDegraded(true);
                    } else {
                        if (isPerformanceDegraded) setIsPerformanceDegraded(false);
                    }
                }
            } else {
                if (isPerformanceDegraded) {
                    setIsPerformanceDegraded(false);
                }
                recentFrameTimesRef.current = [];
            }
        } else {
            setAverageFrameTime(0);
            currentReportedFrameTime = 0;
            if (isPerformanceDegraded) {
                setIsPerformanceDegraded(false);
            }
            recentFrameTimesRef.current = [];
        }

        // REMOVED: Dynamic threshold calculation logic


    });

    // console.log(`useCameraDynamics Return: isOptimizedMode = ${isOptimizedMode}, userRequestedOptimizedMode_prop = ${userRequestedOptimizedMode}`); // This line will be removed
    return {
        isRotating,
        isOptimizedMode,
        smoothedAngularSpeed,
        rawAngularSpeed,
        cameraRef,
        averageFrameTime,
    };
};