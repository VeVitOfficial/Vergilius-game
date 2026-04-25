import * as THREE from 'three';
import { BUILDINGS, HOME, COLORS } from '../config.js';

/**
 * BuildingManager — generuje budovy včetně trojúhelníkových střech,
 * fyzických AABB pro collision a Vergiliova domu se zlatým rámečkem.
 */
export class BuildingManager {
    constructor(scene) {
        this.scene = scene;
        this.colliders = []; // seznam THREE.Box3 pro AABB collision
    }

    generate() {
        BUILDINGS.forEach(b => this.createBuilding(b));
        this.createHome();
    }

    createBuilding({ x, z, w, d, h }) {
        // Tělo budovy
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.building });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, h / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Tmavší okraj (EdgesGeometry)
        const edges = new THREE.EdgesGeometry(geo);
        const lineMat = new THREE.LineBasicMaterial({ color: COLORS.roofEdge, linewidth: 1 });
        const wire = new THREE.LineSegments(edges, lineMat);
        wire.position.copy(mesh.position);
        this.scene.add(wire);

        // Střecha (pyramida z ConeGeometry se 4 segmenty)
        const roofH = 1.5;
        const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, roofH, 4);
        const roofMat = new THREE.MeshLambertMaterial({ color: COLORS.roof });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(x, h + roofH / 2, z);
        roof.rotation.y = Math.PI / 4; // otočit tak, aby hrany seděly
        roof.castShadow = true;
        this.scene.add(roof);

        // AABB collider (trošku větší než budova, aby se hráč nedostal do zdí)
        const box = new THREE.Box3().setFromObject(mesh);
        this.colliders.push(box);
    }

    createHome() {
        const { x, z, w, h, d } = HOME;

        // Tělo domu
        const geo = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.homeBg });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, h / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Zlatý rámeček
        const edges = new THREE.EdgesGeometry(geo);
        const goldLine = new THREE.LineBasicMaterial({ color: COLORS.homeBorder });
        const frame = new THREE.LineSegments(edges, goldLine);
        frame.position.copy(mesh.position);
        this.scene.add(frame);

        // Střecha
        const roofH = 2.5;
        const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, roofH, 4);
        const roofMat = new THREE.MeshLambertMaterial({ color: COLORS.roof });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(x, h + roofH / 2, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.scene.add(roof);

        // AABB collider
        const box = new THREE.Box3().setFromObject(mesh);
        this.colliders.push(box);
    }

    /**
     * Kontrola kolize hráče (AABB) s budovami.
     * Vrací true pokud nová pozice koliduje.
     */
    checkCollision(playerBox) {
        for (const box of this.colliders) {
            if (playerBox.intersectsBox(box)) return true;
        }
        return false;
    }
}
