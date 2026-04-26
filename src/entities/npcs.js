import * as THREE from 'three';

/**
 * NPCManager — billboard sprite postavy s waypoint pohybem.
 * 3-4 typy: senátor (toga praetexta), občan, otrok, voják.
 */
export class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];
    }

    generate() {
        const types = ['senator', 'citizen', 'slave', 'soldier'];
        const positions = this.generatePositions();

        positions.forEach((pos, i) => {
            const type = types[i % types.length];
            const tex = this.createNPCTexture(type);
            const mat = new THREE.SpriteMaterial({ map: tex });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(pos.x, 1.6, pos.z);
            sprite.scale.set(0.6, 1.4, 1);
            this.scene.add(sprite);

            this.npcs.push({
                mesh: sprite,
                type,
                waypoints: pos.waypoints || [],
                currentWP: 0,
                speed: 0.3 + Math.random() * 0.4,
                waitTime: 0,
                waitUntil: 0
            });
        });
    }

    generatePositions() {
        // Tržiště, ulice, fontány
        return [
            // U fóra
            { x: 20, z: 35, waypoints: [{ x: 20, z: 35 }, { x: 25, z: 38 }, { x: 22, z: 42 }] },
            { x: 30, z: 32, waypoints: [{ x: 30, z: 32 }, { x: 32, z: 35 }, { x: 28, z: 36 }] },
            { x: 22, z: 28, waypoints: [{ x: 22, z: 28 }, { x: 26, z: 30 }] },
            { x: 35, z: 40 },
            { x: 18, z: 38 },
            // Subura
            { x: 40, z: -30, waypoints: [{ x: 40, z: -30 }, { x: 45, z: -28 }, { x: 42, z: -25 }] },
            { x: 50, z: -35 },
            { x: 60, z: -20 },
            { x: 45, z: -40 },
            { x: 55, z: -30 },
            { x: 65, z: -25 },
            // Palatin
            { x: 30, z: 50, waypoints: [{ x: 30, z: 50 }, { x: 35, z: 52 }] },
            { x: 45, z: 60 },
            { x: 40, z: 55 },
            { x: 50, z: 65 },
            // Campus Martius
            { x: -30, z: 25 },
            { x: -40, z: 30 },
            { x: -25, z: 35 },
            { x: -35, z: 20 },
            // Trastevere
            { x: -70, z: 40 },
            { x: -60, z: 50 },
            { x: -75, z: 55 },
            { x: -65, z: 45 },
            // Aventin
            { x: 50, z: 60 },
            { x: 60, z: 70 },
            { x: 55, z: 65 },
            // Hlavní ulice
            { x: 5, z: 0, waypoints: [{ x: 5, z: 0 }, { x: 8, z: 0 }, { x: 5, z: 3 }] },
            { x: -5, z: 5 },
            { x: 0, z: -5 },
            { x: 10, z: 10 },
            { x: -10, z: -10 },
            // U Tibery
            { x: -20, z: 10 },
            { x: 15, z: 15 },
            { x: -15, z: -15 },
            { x: 25, z: -5 },
            // U Pantheonu
            { x: -5, z: 15 },
            { x: 0, z: 18 },
            { x: -8, z: 12 },
            // U Kolosea
            { x: 70, z: 55 },
            { x: 65, z: 60 },
            { x: 75, z: 50 },
            // U Terme
            { x: 80, z: 80 },
            { x: 85, z: 75 },
            // Capitol
            { x: 5, z: -35 },
            { x: 15, z: -30 },
            { x: 0, z: -40 },
            // Fontána
            { x: -5, z: -25 },
            { x: -8, z: -22 },
            { x: -2, z: -28 },
        ];
    }

    /** Procedurální canvas textura postavy */
    createNPCTexture(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Transparentní pozadí
        ctx.clearRect(0, 0, 64, 128);

        const colors = {
            senator: { toga: '#FFFFFF', stripe: '#8B0000', skin: '#D4A574' },
            citizen: { toga: '#E8DCC0', stripe: null, skin: '#C89464' },
            slave: { toga: '#8B7355', stripe: null, skin: '#A08060' },
            soldier: { toga: '#B03010', stripe: '#FFD700', skin: '#C89464' }
        };
        const c = colors[type];

        // Hlava
        ctx.fillStyle = c.skin;
        ctx.beginPath();
        ctx.arc(32, 18, 10, 0, Math.PI * 2);
        ctx.fill();

        // Tělo (toga)
        ctx.fillStyle = c.toga;
        ctx.beginPath();
        ctx.moveTo(20, 30);
        ctx.lineTo(44, 30);
        ctx.lineTo(48, 80);
        ctx.lineTo(16, 80);
        ctx.closePath();
        ctx.fill();

        // Praetexta (purpurový pruh pro senátory/vojáky)
        if (c.stripe) {
            ctx.fillStyle = c.stripe;
            ctx.fillRect(18, 30, 28, 4);
            if (type === 'soldier') {
                ctx.fillRect(18, 76, 28, 4);
            }
        }

        // Nohy
        ctx.fillStyle = c.skin;
        ctx.fillRect(24, 80, 6, 40);
        ctx.fillRect(34, 80, 6, 40);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        return tex;
    }

    update(time) {
        for (const npc of this.npcs) {
            if (npc.waypoints.length < 2) continue;
            if (time < npc.waitUntil) continue;

            const target = npc.waypoints[npc.currentWP];
            const pos = npc.mesh.position;
            const dx = target.x - pos.x;
            const dz = target.z - pos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < 0.3) {
                npc.currentWP = (npc.currentWP + 1) % npc.waypoints.length;
                npc.waitTime = 1 + Math.random() * 3;
                npc.waitUntil = time + npc.waitTime;
            } else {
                pos.x += (dx / dist) * npc.speed * 0.016;
                pos.z += (dz / dist) * npc.speed * 0.016;
            }

            // Billboard vždy obrácený ke kameře
            npc.mesh.material.rotation = 0;
        }
    }
}
