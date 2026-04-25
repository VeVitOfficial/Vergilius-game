import * as THREE from 'three';
import { BUILDINGS, HOME, COLORS } from '../config.js';
import { WALL_MATERIALS, ROOF_MATERIAL } from './textures.js';

/**
 * BuildingManager — generuje budovy s PBR materiály (MeshStandardMaterial)
 * a procedurálními texturami. Včetně Vergiliova domu se zlatým rámečkem.
 */
export class BuildingManager {
    constructor(scene) {
        this.scene = scene;
        this.colliders = []; // seznam THREE.Box3 pro AABB collision
    }

    generate() {
        BUILDINGS.forEach((b, i) => this.createBuilding(b, i));
        this.createHome();
    }

    createBuilding({ x, z, w, d, h }, index) {
        // Náhodně vyber materiál ze 3 typů
        const wallMat = WALL_MATERIALS[index % WALL_MATERIALS.length].clone();
        // Jemná variace barvy pro každou budovu
        const hueShift = (Math.random() - 0.5) * 0.05;
        wallMat.color.offsetHSL(hueShift, 0, (Math.random() - 0.5) * 0.05);

        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, wallMat);
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

        // Střecha (pyramida)
        const roofH = 1.5;
        const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, roofH, 4);
        const roofMat = ROOF_MATERIAL.clone();
        roofMat.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.04);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(x, h + roofH / 2, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.scene.add(roof);

        // AABB collider
        const box = new THREE.Box3().setFromObject(mesh);
        this.colliders.push(box);
    }

    createHome() {
        const { x, z, w, h, d } = HOME;

        // Domus Vergilii — luxusnější omítka
        const homeMat = WALL_MATERIALS[1].clone(); // omítka
        homeMat.color.setHex(0xD4C4A0);

        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, homeMat);
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
        const roofMat = ROOF_MATERIAL.clone();
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(x, h + roofH / 2, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.scene.add(roof);

        // AABB collider
        const box = new THREE.Box3().setFromObject(mesh);
        this.colliders.push(box);
    }

    checkCollision(playerBox) {
        for (const box of this.colliders) {
            if (playerBox.intersectsBox(box)) return true;
        }
        return false;
    }
}
