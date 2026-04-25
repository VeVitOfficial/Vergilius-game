import * as THREE from 'three';
import { LANDMARKS, FORUM_COLUMNS, FORUM_RUINS, OBELISK, TERME_RUINS, TREVI_FOUNTAIN, COLORS } from '../config.js';
import { ROOF_MATERIAL } from './textures.js';

/**
 * LandmarkManager — ikonické památky Říma: Koloseum, Pantheon, Vatikán,
 * Castel Sant'Angelo, Pyramida, Vittoriano, Forum, Terme, Piazza del Popolo.
 */
export class LandmarkManager {
    constructor(scene) {
        this.scene = scene;
    }

    generate() {
        this.createColosseum();
        this.createPantheon();
        this.createVatican();
        this.createCastel();
        this.createPyramid();
        this.createVittoriano();
        this.createForumRuins();
        this.createTermeRuins();
        this.createObelisk();
        this.createTreviFountain();
    }

    /** Koloseum — velký ovál, 4 patra oblouků, poškozená stěna */
    createColosseum() {
        const { x, z, rx, rz, h } = LANDMARKS.COLOSSEUM;
        const marble = new THREE.MeshStandardMaterial({ color: COLORS.travertine, roughness: 0.85 });

        // Vnější eliptický prstenec (částečně otevřený)
        const outerGeo = new THREE.CylinderGeometry(rx, rz, h, 32, 1, true, 0, Math.PI * 1.7);
        const outer = new THREE.Mesh(outerGeo, marble);
        outer.position.set(x, h / 2, z);
        outer.castShadow = true;
        this.scene.add(outer);

        // Vnitřní elipsa
        const innerGeo = new THREE.CylinderGeometry(rx - 3, rz - 3, h, 32, 1, true, 0, Math.PI * 1.7);
        const inner = new THREE.Mesh(innerGeo, marble);
        inner.position.set(x, h / 2, z);
        this.scene.add(inner);

        // Podlaha arény
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(rx * 1.8, rz * 1.8),
            new THREE.MeshStandardMaterial({ color: 0x9B8B7B, roughness: 0.95 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x, 0.1, z);
        this.scene.add(floor);

        // Zbylé sloupy na vnější straně
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 1.7;
            const sx = x + Math.cos(angle) * rx;
            const sz = z + Math.sin(angle) * rz;
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.5, h, 8),
                marble
            );
            col.position.set(sx, h / 2, sz);
            col.castShadow = true;
            this.scene.add(col);
        }
    }

    /** Pantheon — kruhová budova s kupolí + portikus */
    createPantheon() {
        const { x, z, r, h } = LANDMARKS.PANTHEON;
        const marble = new THREE.MeshStandardMaterial({ color: COLORS.marble, roughness: 0.6 });

        // Hlavní válec
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(r, r, h, 24),
            marble
        );
        body.position.set(x, h / 2, z);
        body.castShadow = true;
        this.scene.add(body);

        // Kupole (dome) — Hemisphere
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            marble
        );
        dome.position.set(x, h, z);
        dome.castShadow = true;
        this.scene.add(dome);

        // Portikus — 8 sloupů + trojúhelníkový tympanon
        for (let i = 0; i < 8; i++) {
            const px = x - r - 2 + (i % 4) * 2;
            const pz = z - 6 + Math.floor(i / 4) * 12;
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.5, h * 0.8, 8),
                marble
            );
            col.position.set(px, h * 0.4, pz);
            col.castShadow = true;
            this.scene.add(col);
        }

        // Tympanon
        const tymp = new THREE.Mesh(
            new THREE.BoxGeometry(8, 3, 1),
            marble
        );
        tymp.position.set(x - r - 2, h * 0.85, z);
        this.scene.add(tymp);
    }

    /** Vatikán — velký plac + bazilika s kupolí */
    createVatican() {
        const { x, z, w, d, h, domeH } = LANDMARKS.VATICAN;
        const marble = new THREE.MeshStandardMaterial({ color: COLORS.marble, roughness: 0.6 });

        // Bazilika
        const basilica = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            marble
        );
        basilica.position.set(x, h / 2, z);
        basilica.castShadow = true;
        this.scene.add(basilica);

        // Kupole
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(w * 0.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0xE8DCC0, roughness: 0.5 })
        );
        dome.position.set(x, h, z);
        dome.castShadow = true;
        this.scene.add(dome);

        // Náměstí (dlážděný plac)
        const plaza = new THREE.Mesh(
            new THREE.PlaneGeometry(w * 2, d * 1.5),
            new THREE.MeshStandardMaterial({ color: 0xA09070, roughness: 0.9 })
        );
        plaza.rotation.x = -Math.PI / 2;
        plaza.position.set(x, 0.05, z + d);
        this.scene.add(plaza);
    }

    /** Castel Sant'Angelo — kruhová pevnost */
    createCastel() {
        const { x, z, r, h } = LANDMARKS.CASTEL;
        const stone = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.85 });

        // Hlavní válec
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(r, r, h, 16),
            stone
        );
        body.position.set(x, h / 2, z);
        body.castShadow = true;
        this.scene.add(body);

        // Andělská socha na vrcholu
        const angel = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 8, 8),
            new THREE.MeshStandardMaterial({ color: COLORS.marble })
        );
        angel.position.set(x, h + 0.6, z);
        this.scene.add(angel);

        // Zlatý nástavec
        const spike = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.1, 1.5, 6),
            new THREE.MeshStandardMaterial({ color: COLORS.homeBorder })
        );
        spike.position.set(x, h + 1.8, z);
        this.scene.add(spike);
    }

    /** Pyramida Cestia */
    createPyramid() {
        const { x, z, w, h } = LANDMARKS.PYRAMID;
        const marble = new THREE.MeshStandardMaterial({ color: COLORS.marble, roughness: 0.7 });

        const pyramid = new THREE.Mesh(
            new THREE.ConeGeometry(w * 0.7, h, 4),
            marble
        );
        pyramid.position.set(x, h / 2, z);
        pyramid.rotation.y = Math.PI / 4;
        pyramid.castShadow = true;
        this.scene.add(pyramid);
    }

    /** Vittoriano — bílý monument */
    createVittoriano() {
        const { x, z, w, d, h } = LANDMARKS.VITTORIANO;
        const marble = new THREE.MeshStandardMaterial({ color: 0xF5F0E6, roughness: 0.5 });

        // Schodiště (3 stupně)
        for (let i = 0; i < 3; i++) {
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(w + i * 2, 0.8, d + i * 1),
                marble
            );
            step.position.set(x, 0.4 + i * 0.8, z);
            step.castShadow = true;
            this.scene.add(step);
        }

        // Monumentální stěna
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            marble
        );
        wall.position.set(x, 2.5 + h / 2, z);
        wall.castShadow = true;
        this.scene.add(wall);

        // Sloupy
        for (let i = 0; i < 6; i++) {
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.5, h, 8),
                marble
            );
            col.position.set(x - w / 2 + 2 + i * (w - 4) / 5, 2.5 + h / 2, z + d / 2 + 0.5);
            col.castShadow = true;
            this.scene.add(col);
        }
    }

    /** Forum Romano — ruiny sloupů a zdí */
    createForumRuins() {
        const stone = new THREE.MeshStandardMaterial({ color: COLORS.ruinStone, roughness: 0.95 });

        // Sloupy
        FORUM_COLUMNS.forEach(({ x, z }) => {
            const h = 2 + Math.random() * 3;
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.4, h, 8),
                stone
            );
            col.position.set(x, h / 2, z);
            col.castShadow = true;
            this.scene.add(col);
        });

        // Rozpadlé zdi
        FORUM_RUINS.forEach(({ x, z, w, h, d }) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone);
            wall.position.set(x, h / 2, z);
            wall.rotation.y = (Math.random() - 0.5) * 0.3;
            wall.castShadow = true;
            this.scene.add(wall);
        });
    }

    /** Terme di Caracalla */
    createTermeRuins() {
        const stone = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.9 });
        TERME_RUINS.forEach(({ x, z, w, h, d }) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone);
            wall.position.set(x, h / 2, z);
            wall.castShadow = true;
            this.scene.add(wall);
        });

        // Oblouky v zdi
        for (let i = 0; i < 4; i++) {
            const arch = new THREE.Mesh(
                new THREE.TorusGeometry(1.5, 0.3, 8, 12, Math.PI),
                stone
            );
            arch.position.set(80, 2.5, 75 + i * 4);
            this.scene.add(arch);
        }
    }

    /** Obelisk na Piazza del Popolo */
    createObelisk() {
        const { x, z } = OBELISK;
        const marble = new THREE.MeshStandardMaterial({ color: 0xF0EAD6, roughness: 0.6 });

        const obelisk = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 10, 4),
            marble
        );
        obelisk.position.set(x, 5, z);
        obelisk.rotation.y = Math.PI / 4;
        obelisk.castShadow = true;
        this.scene.add(obelisk);

        // Podstavec
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 1, 1.2),
            marble
        );
        base.position.set(x, 0.5, z);
        this.scene.add(base);
    }

    /** Fontána di Trevi */
    createTreviFountain() {
        const { x, z } = TREVI_FOUNTAIN;
        const stone = new THREE.MeshStandardMaterial({ color: COLORS.marble, roughness: 0.6 });
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4A7A9A, transparent: true, opacity: 0.7, roughness: 0.1
        });

        // Půlkruhová zeď proti budově
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(12, 6, 2),
            stone
        );
        wall.position.set(x, 3, z - 3);
        wall.castShadow = true;
        this.scene.add(wall);

        // Socha (placeholder)
        const statue = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 3, 8),
            new THREE.MeshStandardMaterial({ color: 0xE8DCC0 })
        );
        statue.position.set(x, 1.5, z - 1.5);
        this.scene.add(statue);

        // Bazén
        const basin = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.3, 4),
            waterMat
        );
        basin.position.set(x, 0.2, z + 1);
        this.scene.add(basin);

        // Podstavec bazénu
        const basinWall = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.8, 4),
            stone
        );
        basinWall.position.set(x, 0.4, z + 1);
        this.scene.add(basinWall);
    }
}
