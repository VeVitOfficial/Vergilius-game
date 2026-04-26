import * as THREE from 'three';
import { WORLD_SIZE, COLORS } from '../config.js';
import { PAVEMENT_MATERIAL, GRASS_MATERIAL } from './textures.js';

/**
 * TerrainManager — generuje podlahu světa s texturami, biomy a animovanou vodou.
 */
export class TerrainManager {
    constructor(scene, assetLoader = null) {
        this.scene = scene;
        this.assetLoader = assetLoader;
        this.meshes = [];
    }

    generate() {
        this.createGround();
        this.createRoads();
        this.createBiomes();
        this.createWater();
    }

    /** Hlavní kamenná podlaha — PBR textura nebo fallback */
    createGround() {
        const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 1, 1);
        let mat;

        const pbrMat = this.assetLoader ? this.assetLoader.createMaterial('paving', { repeat: [40, 40], roughness: 0.95 }) : null;
        if (pbrMat) {
            mat = pbrMat;
            mat.color.setHex(COLORS.ground);
        } else {
            mat = PAVEMENT_MATERIAL.clone();
            mat.color.setHex(COLORS.ground);
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.meshes.push(mesh);
    }

    /** Cesty — PBR textura nebo fallback */
    createRoads() {
        let roadMat;
        const pbrMat = this.assetLoader ? this.assetLoader.createMaterial('concrete', { repeat: [20, 4], roughness: 0.9 }) : null;
        if (pbrMat) {
            roadMat = pbrMat;
            roadMat.color.setHex(COLORS.road);
        } else {
            roadMat = PAVEMENT_MATERIAL.clone();
            roadMat.color.setHex(COLORS.road);
        }

        const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE, 4), roadMat);
        hRoad.rotation.x = -Math.PI / 2;
        hRoad.position.y = 0.02;
        this.scene.add(hRoad);

        const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(4, WORLD_SIZE), roadMat);
        vRoad.rotation.x = -Math.PI / 2;
        vRoad.position.y = 0.02;
        this.scene.add(vRoad);

        const pierRoad = new THREE.Mesh(new THREE.PlaneGeometry(20, 2), roadMat);
        pierRoad.rotation.x = -Math.PI / 2;
        pierRoad.position.set(35, 0.02, 30);
        this.scene.add(pierRoad);
    }

    /** Barevné biomy jako tenké plochy nad zemí */
    createBiomes() {
        const biomes = [
            { x: 0, z: 0, w: 20, d: 20, color: COLORS.forum },
            { x: -35, z: -10, w: 25, d: 25, color: COLORS.field },
            { x: 0, z: 42, w: 20, d: 20, color: COLORS.cemetery },
            { x: 42, z: 0, w: 20, d: 25, color: COLORS.park },
            { x: -42, z: -42, w: 15, d: 15, color: COLORS.ruinFloor }
        ];

        biomes.forEach(b => {
            const geo = new THREE.PlaneGeometry(b.w, b.d);
            const mat = new THREE.MeshStandardMaterial({
                color: b.color,
                roughness: 0.95,
                metalness: 0.0
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(b.x, 0.03, b.z);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });

        // Brázdy v poli
        const furrowMat = new THREE.MeshStandardMaterial({ color: COLORS.furrow, roughness: 1.0 });
        for (let i = 0; i < 6; i++) {
            const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 0.8), furrowMat);
            f.rotation.x = -Math.PI / 2;
            f.position.set(-35, 0.04, -22 + i * 4);
            this.scene.add(f);
        }

        // Park s texturovanou trávou
        const parkGeo = new THREE.PlaneGeometry(18, 22);
        const parkMesh = new THREE.Mesh(parkGeo, GRASS_MATERIAL);
        parkMesh.rotation.x = -Math.PI / 2;
        parkMesh.position.set(42, 0.035, 0);
        this.scene.add(parkMesh);
    }

    /** Voda v přístavu — animovaná */
    createWater() {
        const geo = new THREE.PlaneGeometry(25, 20, 20, 16);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x4A7A9A,
            transparent: true,
            opacity: 0.85,
            roughness: 0.1,
            metalness: 0.3
        });
        this.waterMesh = new THREE.Mesh(geo, mat);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.set(37, -0.2, 37);
        this.scene.add(this.waterMesh);

        this.waterOriginalPositions = geo.attributes.position.array.slice();
    }

    /** Animace vody */
    update(time) {
        if (!this.waterMesh) return;
        const positions = this.waterMesh.geometry.attributes.position;
        const arr = positions.array;
        const orig = this.waterOriginalPositions;

        for (let i = 0; i < arr.length; i += 3) {
            const x = orig[i];
            const y = orig[i + 1];
            arr[i + 2] = Math.sin(x * 0.5 + time * 2) * 0.12 + Math.cos(y * 0.4 + time * 1.5) * 0.10;
        }
        positions.needsUpdate = true;
    }
}
