import * as THREE from 'three';
import { COLORS, PLAYER } from '../config.js';

/**
 * InteriorManager — vytváří interiéry na vzdálených souřadnicích (x ≈ 1000)
 * a teleportuje hráče při vstupu/výstupu. Každý interiér má vlastní
 * osvětlení, kolizní stěny a návratové dveře.
 */
export class InteriorManager {
    constructor(scene) {
        this.scene = scene;
        this.interiors = new Map(); // id -> { group, colliders, spawnPos, returnPos }
        this.active = null;
    }

    generate() {
        this.createPantheon();
        this.createDomus();
        this.createColosseumUnderground();
        this.createTempleJovis();
    }

    enter(id, camera) {
        const data = this.interiors.get(id);
        if (!data) return false;
        this.active = id;
        camera.position.set(data.spawnPos.x, data.spawnPos.y, data.spawnPos.z);
        camera.rotation.set(0, 0, 0);
        return true;
    }

    exit(camera) {
        if (!this.active) return false;
        const data = this.interiors.get(this.active);
        this.active = null;
        camera.position.set(data.returnPos.x, PLAYER.eyeHeight, data.returnPos.z);
        camera.rotation.set(0, 0, 0);
        return true;
    }

    isInside() { return this.active !== null; }
    getActiveId() { return this.active; }

    checkCollision(playerBox) {
        if (!this.active) return false;
        for (const box of this.interiors.get(this.active).colliders) {
            if (playerBox.intersectsBox(box)) return true;
        }
        return false;
    }

    getNearestDoor(playerPos, doors, maxDist = 3) {
        let nearest = null;
        let minD = Infinity;
        for (const d of doors) {
            const dist = new THREE.Vector2(playerPos.x, playerPos.z).distanceTo(new THREE.Vector2(d.x, d.z));
            if (dist < minD && dist <= maxDist) {
                minD = dist;
                nearest = d;
            }
        }
        return nearest;
    }

    getNearestExit(playerPos, maxDist = 3) {
        if (!this.active) return null;
        const data = this.interiors.get(this.active);
        const dist = new THREE.Vector2(playerPos.x, playerPos.z).distanceTo(new THREE.Vector2(data.exitPos.x, data.exitPos.z));
        return (dist <= maxDist) ? data.exitPos : null;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PANTHEON
    // ═══════════════════════════════════════════════════════════════
    createPantheon() {
        const id = 'pantheon';
        const ox = 1000, oz = 0;
        const group = new THREE.Group();
        const marble = new THREE.MeshStandardMaterial({ color: COLORS.marble, roughness: 0.6, side: THREE.DoubleSide });
        const colliders = [];

        const floor = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.2, 32), marble);
        floor.position.set(ox, 0.1, oz);
        floor.receiveShadow = true;
        group.add(floor);

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sx = ox + Math.cos(angle) * 13;
            const sz = oz + Math.sin(angle) * 13;
            const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 12, 1.2), marble);
            wall.position.set(sx, 6, sz);
            wall.rotation.y = -angle;
            wall.castShadow = true;
            group.add(wall);
            colliders.push(new THREE.Box3().setFromObject(wall));
        }

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
            const sx = ox + Math.cos(angle) * 9;
            const sz = oz + Math.sin(angle) * 9;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 10, 8), marble);
            col.position.set(sx, 5, sz);
            col.castShadow = true;
            group.add(col);
        }

        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(14, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            marble
        );
        dome.position.set(ox, 12, oz);
        group.add(dome);

        const oculusGeo = new THREE.RingGeometry(1.5, 2.5, 16);
        const oculusMat = new THREE.MeshBasicMaterial({ color: 0xFFF8E0, side: THREE.DoubleSide });
        const oculus = new THREE.Mesh(oculusGeo, oculusMat);
        oculus.position.set(ox, 25.9, oz);
        oculus.rotation.x = -Math.PI / 2;
        group.add(oculus);

        const sunSpot = new THREE.SpotLight(0xFFF8E0, 2, 40, Math.PI / 6, 0.5, 1);
        sunSpot.position.set(ox, 26, oz);
        sunSpot.target.position.set(ox, 0, oz);
        group.add(sunSpot);
        group.add(sunSpot.target);

        const interiorLight = new THREE.PointLight(0xFFE8C0, 1, 30);
        interiorLight.position.set(ox, 8, oz);
        group.add(interiorLight);

        this.addExitDoor(group, ox, oz + 12, colliders);

        this.scene.add(group);
        this.interiors.set(id, {
            group, colliders,
            spawnPos: new THREE.Vector3(ox, PLAYER.eyeHeight, oz + 10),
            returnPos: new THREE.Vector3(-5, 0, 25),
            exitPos: new THREE.Vector3(ox, PLAYER.eyeHeight, oz + 12)
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  DOMUS VERGILII
    // ═══════════════════════════════════════════════════════════════
    createDomus() {
        const id = 'domus';
        const ox = 1020, oz = 0;
        const group = new THREE.Group();
        const plaster = new THREE.MeshStandardMaterial({ color: 0xD4C4A0, roughness: 0.8, side: THREE.DoubleSide });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9, side: THREE.DoubleSide });
        const colliders = [];

        const w = 10, h = 5, d = 8;

        const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), floorMat);
        floor.position.set(ox, 0.1, oz);
        floor.receiveShadow = true;
        group.add(floor);

        const walls = [
            { x: ox, z: oz - d / 2, rw: w, rd: 0.3 },
            { x: ox, z: oz + d / 2, rw: w, rd: 0.3 },
            { x: ox - w / 2, z: oz, rw: 0.3, rd: d },
            { x: ox + w / 2, z: oz, rw: 0.3, rd: d },
        ];
        walls.forEach(({ x, z, rw, rd }) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(rw, h, rd), plaster);
            wall.position.set(x, h / 2, z);
            wall.castShadow = true;
            group.add(wall);
            colliders.push(new THREE.Box3().setFromObject(wall));
        });

        [-2, 2].forEach(ox2 => {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 4.5, 8), plaster);
            col.position.set(ox + ox2, 2.25, oz);
            col.castShadow = true;
            group.add(col);
        });

        const bust = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color: COLORS.marble, side: THREE.DoubleSide }));
        bust.position.set(ox - 3, 1.2, oz - 2);
        group.add(bust);
        const bustBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), new THREE.MeshStandardMaterial({ color: 0x5C4033, side: THREE.DoubleSide }));
        bustBase.position.set(ox - 3, 0.3, oz - 2);
        group.add(bustBase);

        const desk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 1), new THREE.MeshStandardMaterial({ color: 0x5C4033, side: THREE.DoubleSide }));
        desk.position.set(ox + 2, 0.4, oz - 1);
        desk.castShadow = true;
        group.add(desk);
        colliders.push(new THREE.Box3().setFromObject(desk));

        const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0xF5F0E6, side: THREE.DoubleSide }));
        scroll.rotation.z = Math.PI / 2;
        scroll.position.set(ox + 2, 0.9, oz - 1);
        group.add(scroll);

        const light = new THREE.PointLight(0xFFE8C0, 0.8, 15);
        light.position.set(ox, 4, oz);
        group.add(light);

        this.addExitDoor(group, ox, oz + d / 2 - 0.5, colliders);

        this.scene.add(group);
        this.interiors.set(id, {
            group, colliders,
            spawnPos: new THREE.Vector3(ox, PLAYER.eyeHeight, oz + 2),
            returnPos: new THREE.Vector3(-5, 0, -1),
            exitPos: new THREE.Vector3(ox, PLAYER.eyeHeight, oz + d / 2 - 0.5)
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  COLOSSEUM UNDERGROUND
    // ═══════════════════════════════════════════════════════════════
    createColosseumUnderground() {
        const id = 'colosseum';
        const ox = 1040, oz = 0;
        const group = new THREE.Group();
        const stone = new THREE.MeshStandardMaterial({ color: 0x6B5D4F, roughness: 0.95, side: THREE.DoubleSide });
        const sand = new THREE.MeshStandardMaterial({ color: 0xC2B280, roughness: 1.0, side: THREE.DoubleSide });
        const colliders = [];

        const corridor = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 20), sand);
        corridor.position.set(ox, 0.1, oz);
        corridor.receiveShadow = true;
        group.add(corridor);

        [-1, 1].forEach(side => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.5, 20), stone);
            wall.position.set(ox + side * 2.25, 1.75, oz);
            wall.castShadow = true;
            group.add(wall);
            colliders.push(new THREE.Box3().setFromObject(wall));
        });

        for (let i = 0; i < 5; i++) {
            const az = oz - 8 + i * 4;
            [-1, 1].forEach(side => {
                const arch = new THREE.Mesh(new THREE.TorusGeometry(1, 0.2, 8, 12, Math.PI), stone);
                arch.position.set(ox + side * 2.25, 3.5, az);
                arch.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
                group.add(arch);
            });
        }

        for (let i = 0; i < 5; i++) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 0.4), stone);
            beam.position.set(ox, 3.8, oz - 8 + i * 4);
            group.add(beam);
        }

        const lift = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 1.5), new THREE.MeshStandardMaterial({ color: 0x4A3520, side: THREE.DoubleSide }));
        lift.position.set(ox, 1, oz + 6);
        lift.castShadow = true;
        group.add(lift);
        colliders.push(new THREE.Box3().setFromObject(lift));

        const torchLight = new THREE.PointLight(0xFF8822, 1, 12);
        torchLight.position.set(ox, 2.5, oz);
        group.add(torchLight);

        const torchLight2 = new THREE.PointLight(0xFF8822, 0.8, 10);
        torchLight2.position.set(ox, 2.5, oz + 6);
        group.add(torchLight2);

        this.addExitDoor(group, ox, oz + 10, colliders);

        this.scene.add(group);
        this.interiors.set(id, {
            group, colliders,
            spawnPos: new THREE.Vector3(ox, PLAYER.eyeHeight, oz + 8),
            returnPos: new THREE.Vector3(70, 0, 65),
            exitPos: new THREE.Vector3(ox, PLAYER.eyeHeight, oz + 10)
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  TEMPLUM JOVIS CAPITOLINI
    // ═══════════════════════════════════════════════════════════════
    createTempleJovis() {
        const id = 'temple';
        const ox = 1060, oz = 0;
        const group = new THREE.Group();
        const marble = new THREE.MeshStandardMaterial({ color: COLORS.marble, roughness: 0.6, side: THREE.DoubleSide });
        const gold = new THREE.MeshStandardMaterial({ color: COLORS.homeBorder, roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide });
        const colliders = [];

        const floor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 10), marble);
        floor.position.set(ox, 0.1, oz);
        floor.receiveShadow = true;
        group.add(floor);

        const wallDefs = [
            { x: ox, z: oz - 5, rw: 12, rd: 0.3 },
            { x: ox, z: oz + 5, rw: 12, rd: 0.3 },
            { x: ox - 6, z: oz, rw: 0.3, rd: 10 },
            { x: ox + 6, z: oz, rw: 0.3, rd: 10 },
        ];
        wallDefs.forEach(({ x, z, rw, rd }) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(rw, 6, rd), marble);
            wall.position.set(x, 3, z);
            wall.castShadow = true;
            group.add(wall);
            colliders.push(new THREE.Box3().setFromObject(wall));
        });

        for (let i = 0; i < 4; i++) {
            const sx = ox - 3 + i * 2;
            [-4, 4].forEach(sz => {
                const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 6, 8), marble);
                col.position.set(sx, 3, oz + sz);
                col.castShadow = true;
                group.add(col);
            });
        }

        const altar = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 1.5), marble);
        altar.position.set(ox, 0.6, oz - 2);
        altar.castShadow = true;
        group.add(altar);
        colliders.push(new THREE.Box3().setFromObject(altar));

        const statueBody = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 2.2, 8), gold);
        statueBody.position.set(ox, 2.6, oz - 2);
        statueBody.castShadow = true;
        group.add(statueBody);

        const statueHead = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), gold);
        statueHead.position.set(ox, 3.9, oz - 2);
        group.add(statueHead);

        const altarLight = new THREE.PointLight(0xFFE8C0, 1.2, 12);
        altarLight.position.set(ox, 5, oz - 2);
        group.add(altarLight);

        const ambient = new THREE.PointLight(0xE8DCC0, 0.6, 15);
        ambient.position.set(ox, 4, oz);
        group.add(ambient);

        this.addExitDoor(group, ox, oz + 5 - 0.5, colliders);

        this.scene.add(group);
        this.interiors.set(id, {
            group, colliders,
            spawnPos: new THREE.Vector3(ox, PLAYER.eyeHeight, oz + 3),
            returnPos: new THREE.Vector3(5, 0, -35),
            exitPos: new THREE.Vector3(ox, PLAYER.eyeHeight, oz + 5 - 0.5)
        });
    }

    addExitDoor(group, x, z, colliders) {
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 0.9, side: THREE.DoubleSide });
        const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.homeBorder, roughness: 0.5, side: THREE.DoubleSide });

        const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.2), doorMat);
        door.position.set(x, 1.25, z);
        group.add(door);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.7, 0.25), frameMat);
        frame.position.set(x, 1.35, z);
        group.add(frame);

        [-0.8, 0.8].forEach(ox2 => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 0.15), frameMat);
            post.position.set(x + ox2, 1.25, z);
            group.add(post);
            colliders.push(new THREE.Box3().setFromObject(post));
        });
    }
}
