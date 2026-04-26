import * as THREE from 'three';

export class CullingManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.tracked = [];
        this.lastCheck = 0;
        this.checkInterval = 0.15;
    }

    scan() {
        this.tracked = [];

        this.scene.traverse(obj => {
            if (!obj.isMesh && !obj.isInstancedMesh) return;

            const name = (obj.name || '').toLowerCase();
            if (name.includes('ground') || name.includes('terrain') ||
                name.includes('road') || name.includes('water') ||
                name.includes('sky') || name.includes('tiber')) {
                return;
            }

            if (obj.geometry && !obj.geometry.boundingSphere) {
                obj.geometry.computeBoundingSphere();
            }
            const radius = obj.geometry?.boundingSphere?.radius || 1;

            let range;
            if (radius > 15) range = 200;
            else if (radius > 5) range = 100;
            else if (radius > 2) range = 60;
            else range = 40;

            this.tracked.push({ obj, range, rangeSq: range * range });
        });

        console.log('[Culling] Tracking', this.tracked.length, 'objects');
    }

    update(time) {
        if (time - this.lastCheck < this.checkInterval) return;
        this.lastCheck = time;

        const camPos = this.camera.position;

        for (const item of this.tracked) {
            const pos = item.obj.position;
            const dx = pos.x - camPos.x;
            const dz = pos.z - camPos.z;
            const distSq = dx * dx + dz * dz;

            item.obj.visible = distSq <= item.rangeSq;
        }
    }
}
