import * as THREE from 'three';
import { ZONES } from '../config.js';
import { WALL_MATERIALS, ROOF_MATERIAL, MARBLE_MATERIAL } from './textures.js';

/**
 * CityLayout — procedurální generátor antického Říma.
 * Rozděluje mapu na zóny, vytváří městské bloky (insulae),
 * ulice a monumentální budovy.
 */
export class CityLayout {
    constructor(scene, assetLoader = null) {
        this.scene = scene;
        this.assetLoader = assetLoader;
        this.colliders = [];
    }

    generate() {
        this.blocks = [];
        this.streetMeshes = [];

        Object.entries(ZONES).forEach(([name, zone]) => {
            this.generateZone(name, zone);
        });
    }

    generateZone(name, zone) {
        const { bounds, style, floors, blockSize } = zone;
        const { x1, z1, x2, z2 } = bounds;
        const width = x2 - x1;
        const depth = z2 - z1;

        if (style === 'forum') {
            this.createForum(x1, z1, width, depth);
            return;
        }

        // Rozděl zónu na bloky
        const blockW = blockSize.min + Math.random() * (blockSize.max - blockSize.min);
        const blockD = blockSize.min + Math.random() * (blockSize.max - blockSize.min);
        const cols = Math.floor(width / (blockW + 4));
        const rows = Math.floor(depth / (blockD + 4));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const bx = x1 + c * (blockW + 4) + blockW / 2;
                const bz = z1 + r * (blockD + 4) + blockD / 2;

                // Ulička mezi bloky
                this.createStreet(
                    x1 + c * (blockW + 4) + blockW,
                    z1,
                    4,
                    depth,
                    'vicus'
                );

                if (style === 'villas') {
                    this.createVillaBlock(bx, bz, blockW, blockD);
                } else if (style === 'temple') {
                    this.createTempleBlock(bx, bz, blockW, blockD);
                } else {
                    // Insulae (subura, trastevere, campus)
                    const fmin = floors?.min || 3;
                    const fmax = floors?.max || 5;
                    this.createInsulaBlock(bx, bz, blockW, blockD, fmin, fmax, style);
                }
            }
        }

        // Hlavní třída napříč zónou
        if (width > depth) {
            this.createStreet(x1, (z1 + z2) / 2 - 4, width, 8, 'decumanus');
        } else {
            this.createStreet((x1 + x2) / 2 - 4, z1, 8, depth, 'cardo');
        }
    }

    /** Vytvoří městský blok s insulae (4-8 budov sdílejících stěny) */
    createInsulaBlock(cx, cz, bw, bd, fmin, fmax, style) {
        const count = 4 + Math.floor(Math.random() * 5);
        const side = Math.random() > 0.5 ? 'x' : 'z';
        const buildingW = side === 'x' ? (bw / count) : bw * 0.9;
        const buildingD = side === 'z' ? (bd / count) : bd * 0.9;

        const wallMat = WALL_MATERIALS[style === 'trastevere' ? 2 : 1].clone();
        if (style === 'subura') {
            wallMat.color.offsetHSL(0, 0, -0.05); // tmavší
        }

        for (let i = 0; i < count; i++) {
            const floors = fmin + Math.floor(Math.random() * (fmax - fmin + 1));
            const h = floors * 2.8 + 1.5; // taberna + patra
            const x = side === 'x'
                ? cx - bw / 2 + buildingW * i + buildingW / 2
                : cx;
            const z = side === 'z'
                ? cz - bd / 2 + buildingD * i + buildingD / 2
                : cz;

            this.createInsula(x, z, buildingW * 0.95, buildingD * 0.95, h, floors, wallMat, style);
        }
    }

    /** Jedna insula — GLB model nebo fallback BoxGeometry */
    createInsula(x, z, w, d, h, floors, wallMat, style) {
        const modelKey = 'insula_' + (1 + Math.floor(Math.random() * 4));
        const model = this.assetLoader ? this.assetLoader.getModel(modelKey) : null;

        if (model) {
            const clone = model.clone();
            const bounds = this.assetLoader.getModelBounds(modelKey);
            if (bounds) {
                const size = new THREE.Vector3();
                bounds.getSize(size);
                clone.scale.set(w / size.x, h / size.y, d / size.z);
            }
            clone.position.set(x, 0, z);

            // Dolní hrana na y = 0
            const tmpBox = new THREE.Box3().setFromObject(clone);
            clone.position.y -= tmpBox.min.y;

            this.scene.add(clone);

            // Collider z bounding box
            const collider = new THREE.Box3().setFromObject(clone);
            this.colliders.push(collider);
            return;
        }

        // Fallback — procedurální BoxGeometry
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            wallMat
        );
        body.position.set(x, h / 2, z);
        body.castShadow = true;
        body.receiveShadow = true;
        this.scene.add(body);

        // Taberna (spodní patro — větší otvor)
        const tabernaH = 2.5;
        const tabernaW = w * 0.4;
        const taberna = new THREE.Mesh(
            new THREE.BoxGeometry(tabernaW, tabernaH - 0.1, d + 0.1),
            new THREE.MeshStandardMaterial({ color: 0x1A1410, roughness: 0.9 })
        );
        taberna.position.set(x - w * 0.15, tabernaH / 2, z);
        this.scene.add(taberna);

        // Okna na patrech
        const winMat = new THREE.MeshStandardMaterial({ color: 0x1A1410, roughness: 0.7 });
        for (let f = 1; f < floors; f++) {
            const wy = f * 2.8 + 1;
            const win = new THREE.Mesh(new THREE.BoxGeometry(w * 0.15, 0.8, 0.1), winMat);
            win.position.set(x, wy, z + d / 2 + 0.05);
            this.scene.add(win);
            const win2 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.15, 0.8, 0.1), winMat);
            win2.position.set(x, wy, z - d / 2 - 0.05);
            this.scene.add(win2);
        }

        // Balkóny
        if (Math.random() > 0.5 && floors > 2) {
            const balconyH = 0.15;
            const balconyD = 0.8;
            for (let f = 2; f < floors; f++) {
                const by = f * 2.8 + 0.5;
                const balcony = new THREE.Mesh(
                    new THREE.BoxGeometry(w * 0.6, balconyH, balconyD),
                    new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.8 })
                );
                balcony.position.set(x, by, z + d / 2 + balconyD / 2);
                balcony.castShadow = true;
                this.scene.add(balcony);
            }
        }

        // Střecha
        const roofH = 1.2;
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(Math.max(w, d) * 0.7, roofH, 4),
            ROOF_MATERIAL
        );
        roof.position.set(x, h + roofH / 2, z);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.scene.add(roof);

        this.colliders.push(new THREE.Box3().setFromObject(body));
    }

    /** Vila s peristylem (Palatin) */
    createVillaBlock(cx, cz, bw, bd) {
        const h = 5;
        const wallMat = WALL_MATERIALS[1].clone();
        wallMat.color.setHex(0xE8DCC0);

        // Hlavní budova
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(bw * 0.6, h, bd * 0.6),
            wallMat
        );
        body.position.set(cx, h / 2, cz);
        body.castShadow = true;
        this.scene.add(body);

        // Peristyl — sloupy kolem dvora
        const courtW = bw * 0.3;
        const courtD = bd * 0.3;
        const colsX = 3;
        const colsZ = 3;
        const colMat = MARBLE_MATERIAL;

        for (let ix = 0; ix < colsX; ix++) {
            for (let iz = 0; iz < colsZ; iz++) {
                const sx = cx - courtW / 2 + ix * (courtW / (colsX - 1));
                const sz = cz - courtD / 2 + iz * (courtD / (colsZ - 1));
                if (ix === 0 || ix === colsX - 1 || iz === 0 || iz === colsZ - 1) {
                    const col = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.2, 0.25, h * 0.7, 8),
                        colMat
                    );
                    col.position.set(sx, h * 0.35, sz);
                    col.castShadow = true;
                    this.scene.add(col);
                }
            }
        }

        // Fontána uprostřed
        const fountain = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1, 0.5, 12),
            colMat
        );
        fountain.position.set(cx, 0.25, cz);
        this.scene.add(fountain);

        this.colliders.push(new THREE.Box3().setFromObject(body));
    }

    /** Chrámový blok */
    createTempleBlock(cx, cz, bw, bd) {
        const h = 8;
        const wallMat = MARBLE_MATERIAL;

        // Podstavec (stylobat)
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(bw, 1, bd),
            wallMat
        );
        base.position.set(cx, 0.5, cz);
        base.castShadow = true;
        this.scene.add(base);

        // Cella (vnitřní prostor)
        const cella = new THREE.Mesh(
            new THREE.BoxGeometry(bw * 0.7, h, bd * 0.7),
            wallMat
        );
        cella.position.set(cx, 1 + h / 2, cz);
        cella.castShadow = true;
        this.scene.add(cella);

        // Sloupy vpředu (pronaos)
        const colCount = 4 + Math.floor(Math.random() * 3);
        const colW = bw * 0.7;
        for (let i = 0; i < colCount; i++) {
            const sx = cx - colW / 2 + (i / (colCount - 1)) * colW;
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.3, h, 8),
                wallMat
            );
            col.position.set(sx, 1 + h / 2, cz + bd * 0.36);
            col.castShadow = true;
            this.scene.add(col);
        }

        // Střecha
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(Math.max(bw, bd) * 0.6, 1.5, 4),
            ROOF_MATERIAL
        );
        roof.position.set(cx, 1 + h + 0.75, cz);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        this.scene.add(roof);

        this.colliders.push(new THREE.Box3().setFromObject(base));
        this.colliders.push(new THREE.Box3().setFromObject(cella));
    }

    /** Fórum — otevřený plac s dlažbou */
    createForum(x, z, w, d) {
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ color: 0xA89878, roughness: 0.9 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x + w / 2, 0.02, z + d / 2);
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    /** Ulice — dlažděný pruh */
    createStreet(x, z, w, d, type) {
        const color = type === 'decumanus' || type === 'cardo' ? 0x9B8B7B : 0x8B7B6B;
        const street = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({ color, roughness: 0.95 })
        );
        street.rotation.x = -Math.PI / 2;
        street.position.set(x + w / 2, 0.01, z + d / 2);
        street.receiveShadow = true;
        this.scene.add(street);
        this.streetMeshes.push(street);
    }

    checkCollision(playerBox) {
        for (const box of this.colliders) {
            if (playerBox.intersectsBox(box)) return true;
        }
        return false;
    }
}
