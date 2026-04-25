import * as THREE from 'three';

/**
 * ParticleManager — ambientní částice: prach, jiskry z ohně,
 * poletující listí, světelné bodky.
 */
export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.systems = [];
    }

    generate() {
        this.createDustMotes();
        this.createTorchSparks();
        this.createFireflies();
    }

    /** Prachové částice ve světle — 200 bodů, pomalý drift */
    createDustMotes() {
        const count = 200;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = Math.random() * 8 + 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
            phases[i] = Math.random() * Math.PI * 2;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

        const mat = new THREE.PointsMaterial({
            color: 0xFFF8E0,
            size: 0.08,
            transparent: true,
            opacity: 0.4,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geo, mat);
        this.scene.add(points);

        this.systems.push({
            mesh: points,
            type: 'dust',
            speeds: Array.from({ length: count }, () => 0.2 + Math.random() * 0.3)
        });
    }

    /** Jiskry z pochodní — 60 žlutých bodů */
    createTorchSparks() {
        const torchPositions = [
            { x: -12, z: 0 }, { x: 12, z: 0 },
            { x: 0, z: -12 }, { x: 0, z: 12 }
        ];
        const countPerTorch = 15;
        const total = torchPositions.length * countPerTorch;

        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(total * 3);
        const origins = new Float32Array(total * 3);

        let idx = 0;
        torchPositions.forEach(({ x, z }) => {
            for (let i = 0; i < countPerTorch; i++) {
                origins[idx * 3] = x + (Math.random() - 0.5) * 0.5;
                origins[idx * 3 + 1] = 2.5 + Math.random() * 0.5;
                origins[idx * 3 + 2] = z + (Math.random() - 0.5) * 0.5;
                positions[idx * 3] = origins[idx * 3];
                positions[idx * 3 + 1] = origins[idx * 3 + 1];
                positions[idx * 3 + 2] = origins[idx * 3 + 2];
                idx++;
            }
        });

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('origin', new THREE.BufferAttribute(origins, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xFFAA33,
            size: 0.1,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geo, mat);
        this.scene.add(points);

        this.systems.push({
            mesh: points,
            type: 'sparks',
            speeds: Array.from({ length: total }, () => 0.5 + Math.random() * 1.5),
            lifetimes: Array.from({ length: total }, () => Math.random())
        });
    }

    /** Světlušky / poletující jiskry v parku */
    createFireflies() {
        const count = 60;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const origins = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const x = 30 + (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const y = 0.5 + Math.random() * 3;
            origins[i * 3] = x;
            origins[i * 3 + 1] = y;
            origins[i * 3 + 2] = z;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('origin', new THREE.BufferAttribute(origins, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x88FF44,
            size: 0.12,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geo, mat);
        this.scene.add(points);

        this.systems.push({
            mesh: points,
            type: 'fireflies',
            phases: Array.from({ length: count }, () => Math.random() * Math.PI * 2)
        });
    }

    update(time) {
        for (const sys of this.systems) {
            const posAttr = sys.mesh.geometry.attributes.position;
            const arr = posAttr.array;

            if (sys.type === 'dust') {
                const orig = sys.mesh.geometry.attributes.phase.array;
                for (let i = 0; i < arr.length / 3; i++) {
                    const p = orig[i];
                    arr[i * 3 + 1] += Math.sin(time * sys.speeds[i] + p) * 0.003;
                    arr[i * 3] += Math.cos(time * 0.3 + p) * 0.002;
                }
            } else if (sys.type === 'sparks') {
                const origins = sys.mesh.geometry.attributes.origin.array;
                for (let i = 0; i < arr.length / 3; i++) {
                    sys.lifetimes[i] -= 0.015;
                    if (sys.lifetimes[i] <= 0) {
                        sys.lifetimes[i] = 1;
                        arr[i * 3] = origins[i * 3] + (Math.random() - 0.5) * 0.3;
                        arr[i * 3 + 1] = origins[i * 3 + 1];
                        arr[i * 3 + 2] = origins[i * 3 + 2] + (Math.random() - 0.5) * 0.3;
                    } else {
                        arr[i * 3 + 1] += sys.speeds[i] * 0.01;
                        arr[i * 3] += (Math.random() - 0.5) * 0.005;
                    }
                }
            } else if (sys.type === 'fireflies') {
                const origins = sys.mesh.geometry.attributes.origin.array;
                for (let i = 0; i < arr.length / 3; i++) {
                    const p = sys.phases[i];
                    arr[i * 3] = origins[i * 3] + Math.sin(time * 0.5 + p) * 2;
                    arr[i * 3 + 1] = origins[i * 3 + 1] + Math.cos(time * 0.7 + p * 2) * 0.8;
                    arr[i * 3 + 2] = origins[i * 3 + 2] + Math.cos(time * 0.4 + p) * 2;
                }
                // Pulzující opacity
                sys.mesh.material.opacity = 0.4 + Math.sin(time * 2) * 0.2;
            }

            posAttr.needsUpdate = true;
        }
    }
}
