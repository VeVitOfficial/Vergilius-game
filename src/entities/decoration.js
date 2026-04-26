import * as THREE from 'three';
import { COLUMNS, TREES, TOMBSTONES, RUIN_STONES, COLORS } from '../config.js';

/**
 * DecorationManager — sloupy, stromy, náhrobky, kameny, mola,
 * sochy, lavičky, fontány, pochodně.
 */
export class DecorationManager {
    constructor(scene, assetLoader = null) {
        this.scene = scene;
        this.assetLoader = assetLoader;
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
        this.createStreetItems();
        this.createMarketStalls();
        this.createStreetFountains();
        this.createBoundaryStones();
        this.createCarts();
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
            shaft.castShadow = false;
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
        trunk.castShadow = false;
        this.scene.add(trunk);

        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(0.7, 5, 8),
            new THREE.MeshStandardMaterial({ color: 0x1E3A1E, roughness: 0.9 })
        );
        leaf.position.set(x, 4, z);
        leaf.castShadow = false;
        this.scene.add(leaf);
    }

    /** Pinie — krátký kmen + široká plochá koruna */
    createPine(x, z) {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6),
            new THREE.MeshStandardMaterial({ color: COLORS.treeTrunk })
        );
        trunk.position.set(x, 0.75, z);
        trunk.castShadow = false;
        this.scene.add(trunk);

        const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(1.4, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0x2D5A2D, roughness: 0.9 })
        );
        leaf.position.set(x, 2.2, z);
        leaf.scale.y = 0.6;
        leaf.castShadow = false;
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
        trunk.castShadow = false;
        this.scene.add(trunk);

        const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(1.0, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0x8FA88F, roughness: 0.95 })
        );
        leaf.position.set(x, 2.2, z);
        leaf.castShadow = false;
        this.scene.add(leaf);
    }

    /** Náhrobky */
    createTombstones() {
        const mat = new THREE.MeshStandardMaterial({ color: COLORS.tombstone, roughness: 0.9 });
        TOMBSTONES.forEach(({ x, z }) => {
            const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.2), mat);
            t.position.set(x, 0.4, z);
            t.rotation.y = (Math.random() - 0.5) * 0.5;
            t.castShadow = false;
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
            stone.castShadow = false;
            this.scene.add(stone);
        });
    }

    /** Molo */
    createPier() {
        const mat = new THREE.MeshStandardMaterial({ color: COLORS.pier, roughness: 0.9 });
        const pier = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 3), mat);
        pier.position.set(35, 0.3, 35);
        pier.castShadow = false;
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

    /** Sochy — GLB modely nebo fallback cylindr + sphere */
    createStatues() {
        const statueKeys = ['statue_bacchus', 'statue_woman', 'statue_pincio', 'statue_asklepios'];
        const positions = [
            { x: -5, z: -5 }, { x: 5, z: -5 },
            { x: -5, z: 5 },  { x: 5, z: 5 },
            { x: 10, z: 0 },  { x: -10, z: 0 }
        ];

        positions.forEach(({ x, z }, i) => {
            const key = statueKeys[i % statueKeys.length];
            const glb = this.assetLoader ? this.assetLoader.getModel(key) : null;

            if (glb) {
                const clone = glb.clone();
                const bounds = this.assetLoader.getModelBounds(key);
                if (bounds) {
                    const size = new THREE.Vector3();
                    bounds.getSize(size);
                    const scale = 2.5 / size.y;
                    clone.scale.set(scale, scale, scale);
                }
                clone.position.set(x, 0, z);
                const tmpBox = new THREE.Box3().setFromObject(clone);
                clone.position.y -= tmpBox.min.y;
                this.scene.add(clone);
                return;
            }

            // Fallback
            const marble = new THREE.MeshStandardMaterial({ color: 0xF0EAD6, roughness: 0.5 });
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), marble);
            base.position.set(x, 0.4, z);
            base.castShadow = false;
            this.scene.add(base);
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.2, 8), marble);
            body.position.set(x, 1.4, z);
            body.castShadow = false;
            this.scene.add(body);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), marble);
            head.position.set(x, 2.1, z);
            head.castShadow = false;
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
            seat.castShadow = false;
            this.scene.add(seat);

            // Nohy
            [-0.6, 0.6].forEach(ox => {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.4), stone);
                leg.position.set(x + ox, 0.25, z);
                this.scene.add(leg);
            });
        });
    }

    /** Fontány — GLB model nebo fallback */
    createFountains() {
        const glb = this.assetLoader ? this.assetLoader.getModel('fountain') : null;
        if (glb) {
            const clone = glb.clone();
            const bounds = this.assetLoader.getModelBounds('fountain');
            if (bounds) {
                const size = new THREE.Vector3();
                bounds.getSize(size);
                const scale = 3.5 / size.y;
                clone.scale.set(scale, scale, scale);
            }
            clone.position.set(0, 0, 15);
            const tmpBox = new THREE.Box3().setFromObject(clone);
            clone.position.y -= tmpBox.min.y;
            this.scene.add(clone);
            return;
        }

        const stone = new THREE.MeshStandardMaterial({ color: 0x9B8B7F, roughness: 0.7 });
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4A7A9A, transparent: true, opacity: 0.7, roughness: 0.1
        });

        const basin = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.5, 16), stone);
        basin.position.set(0, 0.25, 15);
        basin.receiveShadow = true;
        this.scene.add(basin);

        const water = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.1, 16), waterMat);
        water.position.set(0, 0.45, 15);
        this.scene.add(water);

        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8), stone);
        pillar.position.set(0, 1, 15);
        pillar.castShadow = false;
        this.scene.add(pillar);
    }

    /** Pochodně / lampy s point light */
    createTorches() {
        const positions = [
            { x: -12, z: 0 }, { x: 12, z: 0 },
            { x: 0, z: -12 }, { x: 0, z: 12 }
        ];

        positions.forEach(({ x, z }) => {
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6),
                new THREE.MeshStandardMaterial({ color: 0x3A2F25 })
            );
            pole.position.set(x, 1.25, z);
            this.scene.add(pole);

            const bowl = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.08, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x5C4033 })
            );
            bowl.position.set(x, 2.5, z);
            this.scene.add(bowl);

            const flame = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0xFFAA33 })
            );
            flame.position.set(x, 2.65, z);
            this.scene.add(flame);

            const light = new THREE.PointLight(0xFF8822, 2, 8);
            light.position.set(x, 2.7, z);
            this.scene.add(light);
        });
    }

    /** Uliční předměty — amfory, sudy, košíky */
    createStreetItems() {
        const terakota = new THREE.MeshStandardMaterial({ color: 0xA06030, roughness: 0.85 });
        const wood = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.9 });

        const amphoraPositions = [
            { x: -8, z: 5 }, { x: -6, z: 8 }, { x: 12, z: -5 },
            { x: 20, z: 20 }, { x: 25, z: 18 }, { x: 30, z: 22 },
            { x: -20, z: 15 }, { x: -25, z: 20 }, { x: 40, z: -20 },
            { x: 50, z: -30 }, { x: 55, z: -25 }, { x: -50, z: 40 },
            { x: -55, z: 45 }, { x: 60, z: 60 }, { x: 65, z: 55 }
        ];

        amphoraPositions.forEach(({ x, z }) => {
            const group = new THREE.Group();
            group.position.set(x, 0, z);

            // Tělo amfory — zúžená
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.2, 0.6, 8),
                terakota
            );
            body.position.y = 0.4;
            group.add(body);

            // Ucho
            const handle = new THREE.Mesh(
                new THREE.TorusGeometry(0.08, 0.02, 6, 8, Math.PI),
                terakota
            );
            handle.position.set(0.15, 0.5, 0);
            handle.rotation.z = Math.PI / 2;
            group.add(handle);

            // Hrdlo
            const neck = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.12, 0.2, 8),
                terakota
            );
            neck.position.y = 0.8;
            group.add(neck);

            group.rotation.y = Math.random() * Math.PI;
            this.scene.add(group);
        });

        // Soudky
        const barrelPositions = [
            { x: -15, z: 10 }, { x: 15, z: -10 }, { x: 35, z: 30 }
        ];
        barrelPositions.forEach(({ x, z }) => {
            const barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 0.7, 8),
                wood
            );
            barrel.position.set(x, 0.35, z);
            barrel.rotation.z = Math.PI / 2;
            barrel.castShadow = false;
            this.scene.add(barrel);
        });
    }

    /** Tržištní stánky (mensae) */
    createMarketStalls() {
        const wood = new THREE.MeshStandardMaterial({ color: 0x6B4B2B, roughness: 0.9 });
        const cloth = new THREE.MeshStandardMaterial({ color: 0xC8A060, roughness: 0.95, side: THREE.DoubleSide });

        const stalls = [
            { x: 22, z: 32 }, { x: 26, z: 35 }, { x: 18, z: 36 },
            { x: 24, z: 30 }, { x: 28, z: 33 }, { x: 20, z: 34 }
        ];

        stalls.forEach(({ x, z }) => {
            const group = new THREE.Group();
            group.position.set(x, 0, z);

            // Stůl
            const table = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.8), wood);
            table.position.y = 0.4;
            table.castShadow = false;
            group.add(table);

            // Nohy
            [-0.6, 0.6].forEach(ox => {
                [-0.3, 0.3].forEach(oz => {
                    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), wood);
                    leg.position.set(ox, 0.4, oz);
                    group.add(leg);
                });
            });

            // Zboží na stole — malé barevné krychličky
            for (let i = 0; i < 5; i++) {
                const item = new THREE.Mesh(
                    new THREE.BoxGeometry(0.12, 0.12, 0.12),
                    new THREE.MeshStandardMaterial({
                        color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5)
                    })
                );
                item.position.set(-0.4 + i * 0.2, 0.9, (Math.random() - 0.5) * 0.3);
                group.add(item);
            }

            // Plachta / střecha
            const awning = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 1.2), cloth);
            awning.position.set(0, 1.4, 0);
            awning.castShadow = false;
            group.add(awning);

            // Tyče plachty
            [-0.9, 0.9].forEach(ox => {
                const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), wood);
                pole.position.set(ox, 0.75, 0);
                group.add(pole);
            });

            this.scene.add(group);
        });
    }

    /** Pouliční kašny (lacus) — každých ~30 jednotek */
    createStreetFountains() {
        const stone = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.8 });
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4A7A9A, transparent: true, opacity: 0.7, roughness: 0.1
        });

        const positions = [
            { x: 10, z: 10 }, { x: -20, z: -20 }, { x: 40, z: -10 },
            { x: -40, z: 30 }, { x: 0, z: -30 }, { x: -60, z: -10 }
        ];

        positions.forEach(({ x, z }) => {
            // Nádrž
            const basin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), stone);
            basin.position.set(x, 0.3, z);
            basin.castShadow = false;
            this.scene.add(basin);

            // Voda
            const water = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 1), waterMat);
            water.position.set(x, 0.55, z);
            this.scene.add(water);

            // Sloupek
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.2, 8), stone);
            pillar.position.set(x, 1.0, z);
            this.scene.add(pillar);
        });
    }

    /** Hraniční kameny (hermai) */
    createBoundaryStones() {
        const stone = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.85 });

        const positions = [
            { x: -5, z: -15 }, { x: 15, z: 5 }, { x: -25, z: 25 },
            { x: 35, z: -25 }, { x: 5, z: 35 }
        ];

        positions.forEach(({ x, z }) => {
            // Sloupek
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.5, 0.3), stone);
            pillar.position.set(x, 0.75, z);
            pillar.castShadow = false;
            this.scene.add(pillar);

            // Hlava (koule)
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), stone);
            head.position.set(x, 1.6, z);
            this.scene.add(head);
        });
    }

    /** Vozíky (carrus) */
    createCarts() {
        const wood = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.9 });
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 0.95 });

        const carts = [
            { x: 5, z: 5, r: 0.3 },
            { x: -15, z: -5, r: -0.5 },
            { x: 25, z: -15, r: 0.8 }
        ];

        carts.forEach(({ x, z, r }) => {
            const group = new THREE.Group();
            group.position.set(x, 0, z);
            group.rotation.y = r;

            // Korba
            const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.0), wood);
            bed.position.y = 0.6;
            bed.castShadow = false;
            group.add(bed);

            // Kola
            [-0.8, 0.8].forEach(ox => {
                const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 8, 12), wheelMat);
                wheel.position.set(ox, 0.25, 0.6);
                group.add(wheel);
                const wheel2 = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 8, 12), wheelMat);
                wheel2.position.set(ox, 0.25, -0.6);
                group.add(wheel2);
            });

            // Osa
            const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), wood);
            axle.rotation.x = Math.PI / 2;
            axle.position.y = 0.25;
            group.add(axle);

            this.scene.add(group);
        });
    }
}
