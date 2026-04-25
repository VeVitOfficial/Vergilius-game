import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

/**
 * SkyManager — nastavuje realistickej sky shader (Sun + Rayleigh scattering)
 * a přidává pár mraků jako flat planes s procedurální texturou.
 */
export class SkyManager {
    constructor(scene) {
        this.scene = scene;
    }

    generate() {
        this.createSky();
        this.createClouds();
    }

    createSky() {
        const sky = new Sky();
        sky.scale.setScalar(450000);
        this.scene.add(sky);

        const sun = new THREE.Vector3();
        const effectController = {
            turbidity: 8,
            rayleigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
            elevation: 30,
            azimuth: 180,
        };

        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = effectController.turbidity;
        uniforms['rayleigh'].value = effectController.rayleigh;
        uniforms['mieCoefficient'].value = effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
        uniforms['sunPosition'].value.copy(sun);
    }

    /** Pár flat planes s procedurální "mrak" texturou */
    createClouds() {
        const cloudPositions = [
            { x: -60, y: 80, z: -60, scale: 40 },
            { x: 40,  y: 90, z: -30, scale: 50 },
            { x: -20, y: 85, z: 50,  scale: 35 },
            { x: 70,  y: 95, z: 20,  scale: 45 },
        ];

        const cloudMat = new THREE.MeshBasicMaterial({
            map: this.createCloudTexture(),
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        cloudPositions.forEach(p => {
            const geo = new THREE.PlaneGeometry(p.scale, p.scale * 0.6);
            const mesh = new THREE.Mesh(geo, cloudMat);
            mesh.position.set(p.x, p.y, p.z);
            mesh.rotation.x = -0.1; // lehce nakloněné
            this.scene.add(mesh);
        });
    }

    createCloudTexture() {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Průhledné pozadí
        ctx.clearRect(0, 0, size, size);

        // Několik měkkých kruhů = shluk mraků
        const blobs = [
            { x: 128, y: 128, r: 70 },
            { x: 90,  y: 110, r: 50 },
            { x: 170, y: 140, r: 55 },
            { x: 130, y: 90,  r: 45 },
            { x: 60,  y: 150, r: 40 },
            { x: 200, y: 100, r: 42 }
        ];

        blobs.forEach(b => {
            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        });

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
    }
}
