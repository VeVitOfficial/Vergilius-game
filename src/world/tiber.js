import * as THREE from 'three';
import { BRIDGES, COLORS } from '../config.js';

/**
 * Tiber — zakřivená řeka přes mapu s kamennými mosty a břehy.
 */
export class TiberManager {
    constructor(scene) {
        this.scene = scene;
    }

    generate() {
        this.createRiver();
        this.createBanks();
        this.createBridges();
    }

    /** Hlavní řeka — zakřivený pruh vody nad dlažbou */
    createRiver() {
        const curve = (z) => Math.sin(z * 0.03) * 25 + Math.cos(z * 0.015) * 10;

        // Pruh vody mezi levým a pravým břehem
        const shape = new THREE.Shape();
        shape.moveTo(curve(-100) - 6, -100);
        for (let z = -100; z <= 100; z += 5) {
            shape.lineTo(curve(z) - 6, z);
        }
        for (let z = 100; z >= -100; z -= 5) {
            shape.lineTo(curve(z) + 6, z);
        }
        shape.closePath();

        const geo = new THREE.ShapeGeometry(shape, 20);
        const mat = new THREE.MeshStandardMaterial({
            color: COLORS.tiber,
            transparent: true,
            opacity: 0.85,
            roughness: 0.1,
            metalness: 0.3
        });
        const river = new THREE.Mesh(geo, mat);
        river.rotation.x = -Math.PI / 2;
        river.position.y = 0.02;
        this.scene.add(river);

        // Uložení curve pro pozdější použití
        this.riverCurve = curve;
    }

    /** Kamenná nábřeží podél řeky */
    createBanks() {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.9 });
        const curve = this.riverCurve;

        for (let z = -100; z <= 100; z += 8) {
            const cx = curve(z);

            // Levý břeh
            const leftBank = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.2, 8),
                stoneMat
            );
            leftBank.position.set(cx - 6.5, 0.1, z);
            leftBank.castShadow = true;
            leftBank.receiveShadow = true;
            this.scene.add(leftBank);

            // Pravý břeh
            const rightBank = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.2, 8),
                stoneMat
            );
            rightBank.position.set(cx + 6.5, 0.1, z);
            rightBank.castShadow = true;
            rightBank.receiveShadow = true;
            this.scene.add(rightBank);
        }
    }

    /** 3 kamenné mosty přes řeku */
    createBridges() {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9B8B7F, roughness: 0.85 });

        BRIDGES.forEach(({ x, z, w, d }) => {
            // Mostní plocha
            const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), stoneMat);
            deck.position.set(x, 0.2, z);
            deck.castShadow = true;
            deck.receiveShadow = true;
            this.scene.add(deck);

            // Oblouky (3 oblouky pod mostem)
            const archMat = new THREE.MeshStandardMaterial({ color: 0x8B7D6B, roughness: 0.9 });
            const archCount = 3;
            const archSpacing = d / archCount;
            for (let i = 0; i < archCount; i++) {
                const az = z - d / 2 + archSpacing * i + archSpacing / 2;
                const arch = new THREE.Mesh(
                    new THREE.TorusGeometry(1.2, 0.25, 8, 12, Math.PI),
                    archMat
                );
                arch.position.set(x, -0.3, az);
                arch.rotation.y = Math.PI / 2;
                this.scene.add(arch);
            }

            // Zábradlí
            [-d / 2 + 0.3, d / 2 - 0.3].forEach(sideZ => {
                const rail = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.6, d),
                    new THREE.MeshStandardMaterial({ color: 0x7A6A5A })
                );
                rail.position.set(x, 0.6, z + sideZ);
                this.scene.add(rail);
            });
        });
    }
}
