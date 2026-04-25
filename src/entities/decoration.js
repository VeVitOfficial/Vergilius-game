import * as THREE from 'three';
import { COLUMNS, TREES, TOMBSTONES, RUIN_STONES, COLORS } from '../config.js';

/**
 * DecorationManager — sloupy, stromy, náhrobky, kameny, mola,
 * sochy, lavičky, fontány, pochodně.
 */
export class DecorationManager {
    constructor(scene) {
        this.scene = scene;
    }

    generate() {
        this.createColumns();
        this.createTrees();
        this.createTombstones();
        this.createRuinStones();
        this.createPier();
        this.createStatues();
        this.createBenches();
        this.createFountains();
        this.createTorches();
    }

    /** Dórské sloupy — válec + abakus + echinus + base */
    createColumns() {
        const shaftMat = new THREE.MeshStandardMaterial({ color: COLORS.column, roughness: 0.6 });
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.7 });

        COLUMNS.forEach(({ x, z }) => {
            // Shaft (válec)
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.4, 4.2, 12),
                shaftMat
            );
            shaft.position.set(x, 2.6, z);
            shaft.castShadow = true;
            this.scene.add(shaft);

            // Echinus (zaoblená část pod hlavicí)
            const echinus = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.35, 0.3, 12),
                shaftMat
            );
            echinus.position.set(x, 4.9, z);
            this.scene.add(echinus);

            // Abakus (čtvercová deska na vrcholu)
            const abakus = new THREE.Mesh(
                new THREE.BoxGeometry(0.9, 0.15, 0.9),
                baseMat
            );
            abakus.position.set(x, 5.1, z);
            this.scene.add(abakus);

            // Base
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.25, 1.2),
                baseMat
            );
            base.position.set(x, 0.125, z);
            this.scene.add(base);
        });
    }

    /** Stromy: cypřiše, pinie, olivovníky */
    createTrees() {
        TREES.forEach(({ x, z }, i) => {
            const type = i % 3;
            if (type === 0) this.createCypress(x, z);
            else if (type === 1) this.createPine(x, z);
            else this.createOlive(x, z);
        });
    }

    /** Cypřiš — vysoký tenký kužel */
    createCypress(x, z) {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.18, 2, 6),
            new THREE.MeshStandardMaterial({ color: COLORS.treeTrunk })
        );
        trunk.position.set(x, 1, z);
        trunk.castShadow = true;
        this.scene.add(trunk);

        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(0.7, 5, 8),
            new THREE.MeshStandardMaterial({ color: 0x1E3A1E, roughness: 0.9 })
        );
        leaf.position.set(x, 4, z);
        leaf.castShadow = true;
        this.scene.add(leaf);
    }

    /** Pinie — krátký kmen + široká plochá koruna */
    createPine(x, z) {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6),
            new THREE.MeshStandardMaterial({ color: COLORS.treeTrunk })
        );
        trunk.position.set(x, 0.75, z);
        trunk.castShadow = true;
        this.scene.add(trunk);

        const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(1.4, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0x2D5A2D, roughness: 0.9 })
        );
        leaf.position.set(x, 2.2, z);
        leaf.scale.y = 0.6;
        leaf.castShadow = true;
        this.scene.add(leaf);
    }

    /** Olivovník — zkroucený kmen + stříbřitě-zelená koruna */
    createOlive(x, z) {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.25, 1.8, 6),
            new THREE.MeshStandardMaterial({ color: 0x5C4033 })
        );
        trunk.position.set(x, 0.9, z);
        trunk.rotation.z = (Math.random() - 0.5) * 0.3;
        trunk.castShadow = true;
        this.scene.add(trunk);

        const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(1.0, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0x8FA88F, roughness: 0.95 })
        );
        leaf.position.set(x, 2.2, z);
        leaf.castShadow = true;
        this.scene.add(leaf);
    }

    /** Náhrobky */
    createTombstones() {
        const mat = new THREE.MeshStandardMaterial({ color: COLORS.tombstone, roughness: 0.9 });
        TOMBSTONES.forEach(({ x, z }) => {
            const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.2), mat);
            t.position.set(x, 0.4, z);
            t.rotation.y = (Math.random() - 0.5) * 0.5;
            t.castShadow = true;
            this.scene.add(t);
        });
    }

    /** Rozházené kameny */
    createRuinStones() {
        const mat = new THREE.MeshStandardMaterial({ color: COLORS.ruinStone, roughness: 0.95 });
        RUIN_STONES.forEach(({ x, z }) => {
            const size = 0.5 + Math.random() * 1.0;
            const stone = new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.6, size), mat);
            stone.position.set(x, size * 0.3, z);
            stone.rotation.y = Math.random() * Math.PI;
            stone.castShadow = true;
            this.scene.add(stone);
        });
    }

    /** Molo */
    createPier() {
        const mat = new THREE.MeshStandardMaterial({ color: COLORS.pier, roughness: 0.9 });
        const pier = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 3), mat);
        pier.position.set(35, 0.3, 35);
        pier.castShadow = true;
        pier.receiveShadow = true;
        this.scene.add(pier);

        for (let i = -5; i < 5; i += 2) {
            const plank = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.22, 2.8),
                new THREE.MeshStandardMaterial({ color: 0x4A3520 })
            );
            plank.position.set(35 + i, 0.35, 35);
            this.scene.add(plank);
        }
    }

    /** Sochy — mramor, cylindr + sphere + arms (zjednodušené) */
    createStatues() {
        const marble = new THREE.MeshStandardMaterial({ color: 0xF0EAD6, roughness: 0.5 });
        const positions = [
            { x: -5, z: -5 }, { x: 5, z: -5 },
            { x: -5, z: 5 },  { x: 5, z: 5 },
            { x: 10, z: 0 },  { x: -10, z: 0 }
        ];

        positions.forEach(({ x, z }) => {
            // Podstavec
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), marble);
            base.position.set(x, 0.4, z);
            base.castShadow = true;
            this.scene.add(base);

            // Tělo
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8), marble);
            body.position.set(x, 1.4, z);
            body.castShadow = true;
            this.scene.add(body);

            // Hlava
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), marble);
            head.position.set(x, 2.1, z);
            head.castShadow = true;
            this.scene.add(head);
        });
    }

    /** Lavičky */
    createBenches() {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.9 });
        const stone = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.8 });

        const positions = [
            { x: 38, z: 2 }, { x: 42, z: 5 }, { x: 44, z: -2 }
        ];

        positions.forEach(({ x, z }) => {
            // Sedák
            const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.5), wood);
            seat.position.set(x, 0.5, z);
            seat.castShadow = true;
            this.scene.add(seat);

            // Nohy
            [-0.6, 0.6].forEach(ox => {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.4), stone);
                leg.position.set(x + ox, 0.25, z);
                this.scene.add(leg);
            });
        });
    }

    /** Fontány */
    createFountains() {
        const stone = new THREE.MeshStandardMaterial({ color: 0x9B8B7F, roughness: 0.7 });
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4A7A9A, transparent: true, opacity: 0.7, roughness: 0.1
        });

        // Fontána u fóra
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.5, 16), stone);
        basin.position.set(0, 0.25, 15);
        basin.receiveShadow = true;
        this.scene.add(basin);

        const water = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.1, 16), waterMat);
        water.position.set(0, 0.45, 15);
        this.scene.add(water);

        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8), stone);
        pillar.position.set(0, 1, 15);
        pillar.castShadow = true;
        this.scene.add(pillar);
    }

    /** Pochodně / lampy s point light */
    createTorches() {
        const positions = [
            { x: -12, z: 0 }, { x: 12, z: 0 },
            { x: 0, z: -12 }, { x: 0, z: 12 }
        ];

        positions.forEach(({ x, z }) => {
            // Tyč
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6),
                new THREE.MeshStandardMaterial({ color: 0x3A2F25 })
            );
            pole.position.set(x, 1.25, z);
            this.scene.add(pole);

            // Miska
            const bowl = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.08, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x5C4033 })
            );
            bowl.position.set(x, 2.5, z);
            this.scene.add(bowl);

            // Plamen (glowing sphere)
            const flame = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0xFFAA33 })
            );
            flame.position.set(x, 2.65, z);
            this.scene.add(flame);

            // Point light
            const light = new THREE.PointLight(0xFF8822, 2, 8);
            light.position.set(x, 2.7, z);
            this.scene.add(light);
        });
    }
}
