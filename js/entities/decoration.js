import * as THREE from 'three';
import { COLUMNS, TREES, TOMBSTONES, RUIN_STONES, COLORS } from '../config.js';

/**
 * DecorationManager — sloupy, stromy, náhrobky, kameny, mola.
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
    }

    /** Sloupy kolem fóra (CylinderGeometry) */
    createColumns() {
        const geo = new THREE.CylinderGeometry(0.4, 0.5, 5, 8);
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.column });

        COLUMNS.forEach(({ x, z }) => {
            const col = new THREE.Mesh(geo, mat);
            col.position.set(x, 2.5, z);
            col.castShadow = true;
            this.scene.add(col);

            // Základ
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.3, 1.2),
                new THREE.MeshLambertMaterial({ color: COLORS.column })
            );
            base.position.set(x, 0.15, z);
            this.scene.add(base);
        });
    }

    /** Stromy v parku (válec kmen + koule koruna) */
    createTrees() {
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 2, 6);
        const trunkMat = new THREE.MeshLambertMaterial({ color: COLORS.treeTrunk });

        const leafGeo = new THREE.SphereGeometry(0.9, 6, 6);
        const leafMat = new THREE.MeshLambertMaterial({ color: COLORS.treeLeaf });

        TREES.forEach(({ x, z }) => {
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(x, 1, z);
            trunk.castShadow = true;
            this.scene.add(trunk);

            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(x, 2.4, z);
            leaf.castShadow = true;
            this.scene.add(leaf);
        });
    }

    /** Náhrobky na hřbitově */
    createTombstones() {
        const geo = new THREE.BoxGeometry(0.5, 0.8, 0.2);
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.tombstone });

        TOMBSTONES.forEach(({ x, z }) => {
            const t = new THREE.Mesh(geo, mat);
            t.position.set(x, 0.4, z);
            t.rotation.y = (Math.random() - 0.5) * 0.5; // náhodný natočení
            t.castShadow = true;
            this.scene.add(t);
        });
    }

    /** Rozházené kameny v ruinách */
    createRuinStones() {
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.ruinStone });

        RUIN_STONES.forEach(({ x, z }) => {
            const size = 0.5 + Math.random() * 1.0;
            const geo = new THREE.BoxGeometry(size, size * 0.6, size);
            const stone = new THREE.Mesh(geo, mat);
            stone.position.set(x, size * 0.3, z);
            stone.rotation.y = Math.random() * Math.PI;
            stone.castShadow = true;
            this.scene.add(stone);
        });
    }

    /** Molo v přístavu */
    createPier() {
        const geo = new THREE.BoxGeometry(12, 0.2, 3);
        const mat = new THREE.MeshLambertMaterial({ color: COLORS.pier });
        const pier = new THREE.Mesh(geo, mat);
        pier.position.set(35, 0.3, 35);
        pier.castShadow = true;
        pier.receiveShadow = true;
        this.scene.add(pier);

        // Prkna na molu
        for (let i = -5; i < 5; i += 2) {
            const plank = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.22, 2.8),
                new THREE.MeshLambertMaterial({ color: 0x4A3520 })
            );
            plank.position.set(35 + i, 0.35, 35);
            this.scene.add(plank);
        }
    }
}
