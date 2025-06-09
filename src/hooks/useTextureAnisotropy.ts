import { useEffect } from 'react';
import * as THREE from 'three';
import type { Texture, WebGLRenderer } from 'three';

interface UseTextureAnisotropyProps {
    textures: Texture[];
    isRotating: boolean;
    isHighSpeedMode: boolean;
    gl: WebGLRenderer;
}

export const useTextureAnisotropy = ({
    textures,
    isRotating,
    isHighSpeedMode,
    gl,
}: UseTextureAnisotropyProps) => {
    useEffect(() => {
        if (textures.some(t => !t)) {
            return;
        }

        const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
        let targetMinFilter: THREE.TextureFilter;
        let targetMagFilter: THREE.TextureFilter;
        let targetAnisotropy: number;

        if (isHighSpeedMode) {
            targetMinFilter = THREE.NearestFilter;
            targetMagFilter = THREE.NearestFilter;
            targetAnisotropy = 1;
        } else if (isRotating) {
            targetMinFilter = THREE.LinearFilter;
            targetMagFilter = THREE.LinearFilter;
            targetAnisotropy = 1;
        } else {
            targetMinFilter = THREE.LinearMipmapLinearFilter;
            targetMagFilter = THREE.LinearFilter;
            targetAnisotropy = Math.min(8, maxAnisotropy);
        }

        textures.forEach(texture => {
            let needsUpdate = false;
            if (texture.minFilter !== targetMinFilter) { texture.minFilter = targetMinFilter; needsUpdate = true; }
            if (texture.magFilter !== targetMagFilter) { texture.magFilter = targetMagFilter; needsUpdate = true; }
            if (texture.anisotropy !== targetAnisotropy) { texture.anisotropy = targetAnisotropy; needsUpdate = true; }
            if (needsUpdate) texture.needsUpdate = true;
        });
    }, [isRotating, isHighSpeedMode, textures, gl]);
};