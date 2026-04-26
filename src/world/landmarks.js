import * as THREE from 'three';
import { LANDMARKS, FORUM_COLUMNS, FORUM_RUINS, OBELISK, TERME_RUINS, TREVI_FOUNTAIN, COLORS } from '../config.js';
import { ROOF_MATERIAL, MARBLE_MATERIAL } from './textures.js';

/**
 * LandmarkManager — ikonické památky antického Říma (1. stol. n.l.).
 * Koloseum, Pantheon, Forum, Thermae, Circus, Templum Jovis,
 * Mausoleum Augusti, Pyramida, obelisk, fontána.
 */
export class LandmarkManager {
    constructor(scene, assetLoader = null) {
        this.scene = scene;
        this.assetLoader = assetLoader;
    }

    generate() {
        this.createColosseum();
        this.createPantheon();
        this.createForum();
        this.createThermae();
        this.createCircus();
        this.createTempleJovis();
        this.createMausoleum();
        this.createPyramid();
        this.createObelisk();
        this.createTreviFountain();
    }

    // ═══════════════════════════════════════════════════════════════
    //  KOLOSEUM — 4 patra oblouků, částečně zborcené
    // ═══════════════════════════════════════════════════════════════
    createColosseum() {
        const { x, z, rx, rz } = LANDMARKS.COLOSSEUM;

        // Zkus použít GLB model
        const glbModel = this.assetLoader ? this.assetLoader.getModel('colosseum') : null;
        if (glbModel) {
            const clone = glbModel.clone();
            const bounds = this.assetLoader.getModelBounds('colosseum');
            if (bounds) {
                const size = new THREE.Vector3();
                bounds.getSize(size);
                const scale = Math.max((rx * 2) / size.x, (rz * 2) / size.z);
                clone.scale.set(scale, scale, scale);
            }
            clone.position.set(x, 0, z);
            const tmpBox = new THREE.Box3().setFromObject(clone);
            clone.position.y -= tmpBox.min.y;
            this.scene.add(clone);
            return;
        }

        // Fallback — procedurální Koloseum
        const travertine = new THREE.MeshStandardMaterial({
            color: COLORS.travertine, roughness: 0.85, side: THREE.DoubleSide
        });

        const tiers = [
            { y: 2, h: 3.5, rScale: 1.0, order: 'doric' },
            { y: 5.5, h: 3.5, rScale: 0.97, order: 'ionic' },
            { y: 9, h: 3.5, rScale: 0.94, order: 'corinthian' },
            { y: 12.5, h: 3, rScale: 0.91, order: 'corinthian' }
        ];

        tiers.forEach((tier, tierIdx) => {
            const count = 80;
            const archGeo = new THREE.TorusGeometry(0.8, 0.15, 6, 10, Math.PI);
            const archMat = travertine.clone();
            const archMesh = new THREE.InstancedMesh(archGeo, archMat, count);
            const colGeo = new THREE.CylinderGeometry(0.25, 0.3, tier.h, 6);
            const colMesh = new THREE.InstancedMesh(colGeo, archMat, count);

            const dummy = new THREE.Object3D();
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                if (angle > Math.PI * 1.5 && tierIdx < 2) continue;

                const sx = x + Math.cos(angle) * rx * tier.rScale;
                const sz = z + Math.sin(angle) * rz * tier.rScale;

                dummy.position.set(sx, tier.y + tier.h / 2, sz);
                dummy.rotation.set(0, -angle + Math.PI / 2, 0);
                dummy.updateMatrix();
                archMesh.setMatrixAt(i, dummy.matrix);

                const nextAngle = ((i + 1) / count) * Math.PI * 2;
                const cx = x + Math.cos((angle + nextAngle) / 2) * rx * tier.rScale;
                const cz = z + Math.sin((angle + nextAngle) / 2) * rz * tier.rScale;
                dummy.position.set(cx, tier.y + tier.h / 2, cz);
                dummy.rotation.set(0, 0, 0);
                dummy.updateMatrix();
                colMesh.setMatrixAt(i, dummy.matrix);
            }

            archMesh.castShadow = true;
            colMesh.castShadow = true;
            this.scene.add(archMesh);
            this.scene.add(colMesh);
        });

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(rx * 1.8, rz * 1.8),
            new THREE.MeshStandardMaterial({ color: 0x9B8B7B, roughness: 0.95 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x, 0.1, z);
        this.scene.add(floor);

        for (let i = 0; i < 6; i++) {
            const hole = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.2, 2),
                new THREE.MeshStandardMaterial({ color: 0x2A2018 })
            );
            hole.position.set(
                x + (Math.random() - 0.5) * rx * 0.6,
                0.05,
                z + (Math.random() - 0.5) * rz * 0.6
            );
            this.scene.add(hole);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  PANTHEON — 16 korintských sloupů, tympanon s nápisem
    // ═══════════════════════════════════════════════════════════════
    createPantheon() {
        const { x, z, r, h } = LANDMARKS.PANTHEON;
        const marble = MARBLE_MATERIAL.clone();

        // Hlavní válec
        const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), marble);
        body.position.set(x, h / 2, z);
        body.castShadow = true;
        this.scene.add(body);

        // Kupole
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            marble
        );
        dome.position.set(x, h, z);
        dome.castShadow = true;
        this.scene.add(dome);

        // Portikus — 16 sloupů (8 vpředu, 8 vzadu v hloubce)
        const colH = h * 0.75;
        const colR = 0.45;
        const colPositions = [];
        for (let row = 0; row < 2; row++) {
            for (let i = 0; i < 8; i++) {
                const px = x - r - 3 + i * 2;
                const pz = z - 8 + row * 4;
                colPositions.push({ x: px, z: pz });

                // Sloup
                const col = new THREE.Mesh(
                    new THREE.CylinderGeometry(colR * 0.8, colR, colH, 10),
                    marble
                );
                col.position.set(px, colH / 2, pz);
                col.castShadow = true;
                this.scene.add(col);

                // Korintská hlavice (zjednodušená — válec)
                const cap = new THREE.Mesh(
                    new THREE.CylinderGeometry(colR * 1.4, colR * 0.8, 0.5, 10),
                    marble
                );
                cap.position.set(px, colH + 0.25, pz);
                this.scene.add(cap);
            }
        }

        // Entablature (překlad nad sloupy)
        const entW = 8 * 2 + 2;
        const entablature = new THREE.Mesh(
            new THREE.BoxGeometry(entW, 1.2, 5),
            marble
        );
        entablature.position.set(x - r - 3 + 7, colH + 1.1, z - 6);
        entablature.castShadow = true;
        this.scene.add(entablature);

        // Tympanon s nápisem M·AGRIPPA·L·F·COS·TERTIVM·FECIT
        const tympanonCanvas = document.createElement('canvas');
        tympanonCanvas.width = 256;
        tympanonCanvas.height = 128;
        const tCtx = tympanonCanvas.getContext('2d');
        tCtx.fillStyle = '#E8DCC0';
        tCtx.fillRect(0, 0, 256, 128);
        tCtx.fillStyle = '#5A4A3A';
        tCtx.font = '16px serif';
        tCtx.textAlign = 'center';
        tCtx.fillText('M·AGRIPPA·L·F·COS·TERTIVM', 128, 50);
        tCtx.fillText('FECIT', 128, 75);
        const tympTex = new THREE.CanvasTexture(tympanonCanvas);
        const tympanon = new THREE.Mesh(
            new THREE.BoxGeometry(entW * 0.8, 2.5, 0.3),
            new THREE.MeshStandardMaterial({ map: tympTex, roughness: 0.6 })
        );
        tympanon.position.set(x - r - 3 + 7, colH + 2.8, z - 6);
        this.scene.add(tympanon);

        // Bronzové dveře
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(3, 5, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x2A3A2A, roughness: 0.4, metalness: 0.6 })
        );
        door.position.set(x - r - 3 + 7, 2.5, z - 3.5);
        this.scene.add(door);
    }

    // ═══════════════════════════════════════════════════════════════
    //  FORUM ROMANUM — Vestiny chrámy, Curia, Rostra, Arch, Lapis Niger
    // ═══════════════════════════════════════════════════════════════
    createForum() {
        const stone = new THREE.MeshStandardMaterial({ color: COLORS.ruinStone, roughness: 0.95 });
        const marble = MARBLE_MATERIAL.clone();

        // 1) Vestiny chrámy — 3 kruhové stavby s kupolí
        const templePositions = [
            { x: 28, z: 32 }, { x: 32, z: 36 }, { x: 24, z: 38 }
        ];
        templePositions.forEach(({ x, z }) => {
            const r = 3.5;
            const th = 6;
            const cella = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r * 0.7, th, 12), marble);
            cella.position.set(x, th / 2, z);
            cella.castShadow = true;
            this.scene.add(cella);

            // Kupole
            const dome = new THREE.Mesh(
                new THREE.SphereGeometry(r * 0.7, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                marble
            );
            dome.position.set(x, th, z);
            this.scene.add(dome);

            // Sloupy kolem
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const sx = x + Math.cos(angle) * r;
                const sz = z + Math.sin(angle) * r;
                const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, th, 8), marble);
                col.position.set(sx, th / 2, sz);
                this.scene.add(col);
            }
        });

        // 2) Curia Iulia — obdélníková budova
        const curia = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 12), marble);
        curia.position.set(35, 3, 38);
        curia.castShadow = true;
        this.scene.add(curia);

        // Dveře Curií
        const curiaDoor = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 4, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 0.9 })
        );
        curiaDoor.position.set(35, 2, 32.1);
        this.scene.add(curiaDoor);

        // 3) Rostra — řečnický pultík
        const rostra = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 2), marble);
        rostra.position.set(30, 0.6, 42);
        rostra.castShadow = true;
        this.scene.add(rostra);

        // Dekorace na Rostrech (lodě)
        const prow = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1, 4), marble);
        prow.position.set(30, 1.5, 42);
        prow.rotation.z = Math.PI / 2;
        this.scene.add(prow);

        // 4) Vítězný oblouk Tita (Arcus)
        this.createTriumphalArch(25, 40, 0);

        // 5) Lapis Niger — černé dlažby
        const lapis = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 6),
            new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.9 })
        );
        lapis.rotation.x = -Math.PI / 2;
        lapis.position.set(22, 0.03, 35);
        this.scene.add(lapis);

        // Stávající sloupy a ruiny z configu
        FORUM_COLUMNS.forEach(({ x, z }) => {
            const h = 2 + Math.random() * 3;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, h, 8), stone);
            col.position.set(x, h / 2, z);
            col.castShadow = true;
            this.scene.add(col);
        });

        FORUM_RUINS.forEach(({ x, z, w, h, d }) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone);
            wall.position.set(x, h / 2, z);
            wall.rotation.y = (Math.random() - 0.5) * 0.3;
            wall.castShadow = true;
            this.scene.add(wall);
        });
    }

    /** Triumfální oblouk */
    createTriumphalArch(x, z, rotationY) {
        const marble = MARBLE_MATERIAL.clone();
        const w = 8, d = 4, h = 10;

        // Pilíře
        [-1, 1].forEach(side => {
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, h, d), marble);
            pillar.position.set(x + side * 2.5, h / 2, z);
            pillar.castShadow = true;
            this.scene.add(pillar);
        });

        // Entablature
        const ent = new THREE.Mesh(new THREE.BoxGeometry(w, 1.5, d), marble);
        ent.position.set(x, h + 0.75, z);
        ent.castShadow = true;
        this.scene.add(ent);

        // Attic (horní plocha)
        const attic = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d * 0.8), marble);
        attic.position.set(x, h + 2.1, z);
        this.scene.add(attic);

        // Oblouky (3x)
        for (let i = 0; i < 3; i++) {
            const arch = new THREE.Mesh(
                new THREE.TorusGeometry(1.2 - i * 0.3, 0.2, 8, 12, Math.PI),
                marble
            );
            arch.position.set(x, h - 1.5 + i * 0.1, z + d / 2 + 0.1);
            arch.rotation.y = Math.PI / 2;
            this.scene.add(arch);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  THERMAE — lázně, velký komplex
    // ═══════════════════════════════════════════════════════════════
    createThermae() {
        const { x, z, w, d, h } = LANDMARKS.THERMAE;
        const marble = MARBLE_MATERIAL.clone();
        const stone = new THREE.MeshStandardMaterial({ color: COLORS.ruinStone, roughness: 0.9 });

        // Hlavní hala
        const mainHall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stone);
        mainHall.position.set(x, h / 2, z);
        mainHall.castShadow = true;
        this.scene.add(mainHall);

        // Sloupy kolem hlavní haly
        const colCountX = 4;
        const colCountZ = 6;
        for (let ix = 0; ix < colCountX; ix++) {
            for (let iz = 0; iz < colCountZ; iz++) {
                const sx = x - w / 2 + 2 + ix * ((w - 4) / (colCountX - 1));
                const sz = z - d / 2 + 2 + iz * ((d - 4) / (colCountZ - 1));
                const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, h, 8), marble);
                col.position.set(sx, h / 2, sz);
                col.castShadow = true;
                this.scene.add(col);
            }
        }

        // Bazén (natatio)
        const pool = new THREE.Mesh(
            new THREE.BoxGeometry(w * 0.6, 0.3, d * 0.3),
            new THREE.MeshStandardMaterial({ color: 0x4A7A9A, transparent: true, opacity: 0.7, roughness: 0.1 })
        );
        pool.position.set(x, 0.15, z + d * 0.2);
        this.scene.add(pool);
    }

    // ═══════════════════════════════════════════════════════════════
    //  CIRCUS MAXIMUS — protáhlé závodiště s obeliskem
    // ═══════════════════════════════════════════════════════════════
    createCircus() {
        const { x, z, w, d, h } = LANDMARKS.CIRCUS;
        const sandMat = new THREE.MeshStandardMaterial({ color: 0xC2B280, roughness: 1.0 });
        const stone = new THREE.MeshStandardMaterial({ color: COLORS.ruinStone, roughness: 0.9 });
        const marble = MARBLE_MATERIAL.clone();

        // Závodní dráha
        const track = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), sandMat);
        track.position.set(x, 0.1, z);
        track.receiveShadow = true;
        this.scene.add(track);

        // Spina (středový val)
        const spina = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, d * 0.7), stone);
        spina.position.set(x, 0.75, z);
        spina.castShadow = true;
        this.scene.add(spina);

        // Obelisk na spině
        const obelisk = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 8, 4),
            marble
        );
        obelisk.position.set(x, 4, z);
        obelisk.rotation.y = Math.PI / 4;
        obelisk.castShadow = true;
        this.scene.add(obelisk);

        // Oválné zatáčky
        [-1, 1].forEach(end => {
            const curve = new THREE.Mesh(
                new THREE.CylinderGeometry(w / 2, w / 2, 0.3, 16, 1, false, 0, Math.PI),
                sandMat
            );
            curve.rotation.z = Math.PI / 2;
            curve.position.set(x, 0.15, z + end * (d / 2 - w / 2));
            this.scene.add(curve);
        });

        // Tribuny (sedadla)
        [-1, 1].forEach(side => {
            const stand = new THREE.Mesh(
                new THREE.BoxGeometry(2, 2, d),
                stone
            );
            stand.position.set(x + side * (w / 2 + 1), 1, z);
            stand.castShadow = true;
            this.scene.add(stand);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  TEMPLUM JOVIS CAPITOLINI
    // ═══════════════════════════════════════════════════════════════
    createTempleJovis() {
        const { x, z, w, d, h } = LANDMARKS.TEMPLE_JOVIS;
        const marble = MARBLE_MATERIAL.clone();

        // Stylobat (podstavec)
        const base = new THREE.Mesh(new THREE.BoxGeometry(w + 2, 1.5, d + 2), marble);
        base.position.set(x, 0.75, z);
        base.castShadow = true;
        this.scene.add(base);

        // Cella
        const cella = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h, d * 0.7), marble);
        cella.position.set(x, 1.5 + h / 2, z);
        cella.castShadow = true;
        this.scene.add(cella);

        // Pronaos — sloupy vpředu
        const colCount = 6;
        const colW = w * 0.75;
        for (let i = 0; i < colCount; i++) {
            const sx = x - colW / 2 + (i / (colCount - 1)) * colW;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, h, 8), marble);
            col.position.set(sx, 1.5 + h / 2, z + d * 0.38);
            col.castShadow = true;
            this.scene.add(col);

            // Korintská hlavice
            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.3, 0.4, 8), marble);
            cap.position.set(sx, 1.5 + h + 0.2, z + d * 0.38);
            this.scene.add(cap);
        }

        // Střecha
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(Math.max(w, d) * 0.6, 1.8, 4),
            ROOF_MATERIAL
        );
        roof.position.set(x, 1.5 + h + 0.9, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.scene.add(roof);

        // Tympanon
        const tymp = new THREE.Mesh(
            new THREE.BoxGeometry(w * 0.7, 1.5, 0.3),
            marble
        );
        tymp.position.set(x, 1.5 + h + 0.75, z + d * 0.36);
        this.scene.add(tymp);
    }

    // ═══════════════════════════════════════════════════════════════
    //  MAUSOLEUM AUGUSTI — kruhová stavba s kuželovou střechou
    // ═══════════════════════════════════════════════════════════════
    createMausoleum() {
        const { x, z, r, h } = LANDMARKS.MAUSOLEUM;
        const marble = MARBLE_MATERIAL.clone();
        const treeMat = new THREE.MeshStandardMaterial({ color: COLORS.treeLeaf, roughness: 0.9 });

        // Hlavní kruhový válec
        const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), marble);
        body.position.set(x, h / 2, z);
        body.castShadow = true;
        this.scene.add(body);

        // Kuželová střecha
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(r * 0.9, h * 0.4, 24),
            ROOF_MATERIAL
        );
        roof.position.set(x, h + h * 0.2, z);
        roof.castShadow = true;
        this.scene.add(roof);

        // Cypřiše kolem
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sx = x + Math.cos(angle) * (r + 3);
            const sz = z + Math.sin(angle) * (r + 3);
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.15, 2, 6),
                new THREE.MeshStandardMaterial({ color: COLORS.treeTrunk })
            );
            trunk.position.set(sx, 1, sz);
            this.scene.add(trunk);

            const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.6, 3, 8), treeMat);
            leaf.position.set(sx, 3.5, sz);
            leaf.castShadow = true;
            this.scene.add(leaf);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  PYRAMIDA CESTIA
    // ═══════════════════════════════════════════════════════════════
    createPyramid() {
        const { x, z, w, h } = LANDMARKS.PYRAMID;
        const marble = new THREE.MeshStandardMaterial({ color: COLORS.marble, roughness: 0.7, side: THREE.DoubleSide });

        const pyramid = new THREE.Mesh(new THREE.ConeGeometry(w * 0.7, h, 4), marble);
        pyramid.position.set(x, h / 2, z);
        pyramid.rotation.y = Math.PI / 4;
        pyramid.castShadow = true;
        this.scene.add(pyramid);
    }

    // ═══════════════════════════════════════════════════════════════
    //  OBELISK
    // ═══════════════════════════════════════════════════════════════
    createObelisk() {
        const { x, z } = OBELISK;
        const marble = new THREE.MeshStandardMaterial({ color: 0xF0EAD6, roughness: 0.6 });

        const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.4, 10, 4), marble);
        obelisk.position.set(x, 5, z);
        obelisk.rotation.y = Math.PI / 4;
        obelisk.castShadow = true;
        this.scene.add(obelisk);

        const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), marble);
        base.position.set(x, 0.5, z);
        this.scene.add(base);
    }

    // ═══════════════════════════════════════════════════════════════
    //  FONTÁNA DI TREVI
    // ═══════════════════════════════════════════════════════════════
    createTreviFountain() {
        const { x, z } = TREVI_FOUNTAIN;
        const stone = new THREE.MeshStandardMaterial({ color: COLORS.marble, roughness: 0.6 });
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x4A7A9A, transparent: true, opacity: 0.7, roughness: 0.1
        });

        // Půlkruhová zeď
        const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 2), stone);
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
        const basin = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 4), waterMat);
        basin.position.set(x, 0.2, z + 1);
        this.scene.add(basin);

        const basinWall = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 4), stone);
        basinWall.position.set(x, 0.4, z + 1);
        this.scene.add(basinWall);
    }
}
