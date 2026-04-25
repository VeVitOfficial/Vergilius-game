import * as THREE from 'three';
import { WORLD_SIZE, COLORS } from '../config.js';

/**
 * TerrainManager — generuje podlahu světa, biomy a cesty.
 * Používá PlaneGeometry s barevnými materiály a překrývajícími plochami pro biomy.
 */
export class TerrainManager {
    constructor(scene) {
        this.scene = scene;
        this.meshes = [];
    }

    generate() {
        this.createGround();
        this.createRoads();
        this.createBiomes();
        this.createWater();
    }

    /** Hlavní kamenná podlaha 100×100 */
    createGround() {
        const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 1, 1);
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.ground });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.meshes.push(mesh);
    }

    /** Cesty — pruhy podél hlavních os */
    createRoads() {
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.road });

        // Hlavní východozápadní cesta (osa Z = 0)
        const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE, 4), mat);
        hRoad.rotation.x = -Math.PI / 2;
        hRoad.position.y = 0.02;
        this.scene.add(hRoad);

        // Hlavní severojížní cesta (osa X = 0)
        const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(4, WORLD_SIZE), mat);
        vRoad.rotation.x = -Math.PI / 2;
        vRoad.position.y = 0.02;
        this.scene.add(vRoad);

        // Vedlejší cesta: přístav (JZ)
        const pierRoad = new THREE.Mesh(new THREE.PlaneGeometry(20, 2), mat);
        pierRoad.rotation.x = -Math.PI / 2;
        pierRoad.position.set(35, 0.02, 30);
        this.scene.add(pierRoad);
    }

    /** Barevné biomy jako tenké plochy nad zemí */
    createBiomes() {
        const biomes = [
            // Forum uprostřed
            { x: 0, z: 0, w: 20, d: 20, color: COLORS.forum },
            // Pole SZ
            { x: -35, z: -10, w: 25, d: 25, color: COLORS.field },
            // Hřbitov S
            { x: 0, z: 42, w: 20, d: 20, color: COLORS.cemetery },
            // Park V
            { x: 42, z: 0, w: 20, d: 25, color: COLORS.park },
            // Ruiny SV
            { x: -42, z: -42, w: 15, d: 15, color: COLORS.ruinFloor }
        ];

        biomes.forEach(b => {
            const geo = new THREE.PlaneGeometry(b.w, b.d);
            const mat = new THREE.MeshLambertMaterial({ color: b.color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(b.x, 0.03, b.z);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });

        // Brázdy v poli (tmavší proužky)
        const furrowMat = new THREE.MeshLambertMaterial({ color: COLORS.furrow });
        for (let i = 0; i < 6; i++) {
            const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 0.8), furrowMat);
            f.rotation.x = -Math.PI / 2;
            f.position.set(-35, 0.04, -22 + i * 4);
            this.scene.add(f);
        }
    }

    /** Voda v přístavu (JZ roh) — animovaná posunem vertexů */
    createWater() {
        const geo = new THREE.PlaneGeometry(25, 20, 10, 8);
        const mat = new THREE.MeshLambertMaterial({
            color: COLORS.water,
            transparent: true,
            opacity: 0.85
        });
        this.waterMesh = new THREE.Mesh(geo, mat);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.set(37, 0.1, 37);
        this.scene.add(this.waterMesh);

        // Uložíme původní pozice pro animaci
        this.waterOriginalPositions = geo.attributes.position.array.slice();
    }

    /** Animace vody — vlnění podle času */
    update(time) {
        if (!this.waterMesh) return;
        const positions = this.waterMesh.geometry.attributes.position;
        const arr = positions.array;
        const orig = this.waterOriginalPositions;

        for (let i = 0; i < arr.length; i += 3) {
            const x = orig[i];
            const y = orig[i + 1];
            arr[i + 2] = Math.sin(x * 0.5 + time * 2) * 0.08 + Math.cos(y * 0.4 + time * 1.5) * 0.06;
        }
        positions.needsUpdate = true;
    }
}
