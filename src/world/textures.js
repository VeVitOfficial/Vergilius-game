import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════
//  PROCEDURÁLNÍ TEXTURY — canvas-based generátory
// ═══════════════════════════════════════════════════════════════

/**
 * Kamenná zeď — bežová základ, šum, tmavší spáry mřížky (kvádry).
 */
export function createStoneTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Základ
    ctx.fillStyle = '#D4B896';
    ctx.fillRect(0, 0, size, size);

    // Kvádry
    const rows = 8;
    const cols = 8;
    const cellH = size / rows;
    const cellW = size / cols;

    for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (cellW / 2);
        for (let c = -1; c < cols + 1; c++) {
            const x = c * cellW + offset;
            const y = r * cellH;
            const w = cellW - 4;
            const h = cellH - 4;

            // Náhodná variace barvy kamene
            const v = 20 + Math.random() * 25;
            ctx.fillStyle = `rgb(${210 - v}, ${180 - v}, ${145 - v})`;
            ctx.fillRect(x + 2, y + 2, w, h);

            // Jemný šum
            for (let i = 0; i < 40; i++) {
                const sx = x + 2 + Math.random() * w;
                const sy = y + 2 + Math.random() * h;
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
                ctx.fillRect(sx, sy, 2, 2);
            }
        }
    }

    // Spáry
    ctx.strokeStyle = '#5A4A3A';
    ctx.lineWidth = 3;
    for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellH);
        ctx.lineTo(size, r * cellH);
        ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellW, 0);
        ctx.lineTo(c * cellW, size);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
}

/**
 * Omítka — teplá béžová s patinou a jemnými skvrnami.
 */
export function createPlasterTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#E8D5B0';
    ctx.fillRect(0, 0, size, size);

    // Patina / šum
    for (let i = 0; i < 4000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const a = Math.random() * 0.08;
        const dark = Math.random() > 0.5;
        ctx.fillStyle = dark ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, 2, 2);
    }

    // Jemné skvrny
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 5 + Math.random() * 20;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(160, 130, 90, 0.15)');
        grad.addColorStop(1, 'rgba(160, 130, 90, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
}

/**
 * Cihly — cihlová barva s světlejšími spárami.
 */
export function createBrickTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#C8B8A0';
    ctx.fillRect(0, 0, size, size);

    const rows = 12;
    const cols = 8;
    const bh = size / rows;
    const bw = size / cols;

    for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (bw / 2);
        for (let c = -1; c < cols + 1; c++) {
            const x = c * bw + offset;
            const y = r * bh;
            const v = Math.random() * 30;
            ctx.fillStyle = `rgb(${160 + v}, ${80 + v / 2}, ${45 + v / 3})`;
            ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4);
        }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
}

/**
 * Střešní tašky — terakotová červenooranžová s řadami.
 */
export function createRoofTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#C04820';
    ctx.fillRect(0, 0, size, size);

    // Řady tašek (oblouky)
    const rowH = 16;
    for (let r = 0; r < size / rowH; r++) {
        const y = r * rowH;
        const tileW = 32;
        for (let c = 0; c < size / tileW + 1; c++) {
            const x = c * tileW + (r % 2) * (tileW / 2);
            ctx.fillStyle = `rgb(${192 + Math.random() * 20}, ${65 + Math.random() * 10}, ${30 + Math.random() * 10})`;
            ctx.beginPath();
            ctx.arc(x + tileW / 2, y, tileW / 2, 0, Math.PI, false);
            ctx.fill();
        }
        // Spára mezi řadami
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, y + rowH - 2, size, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
}

/**
 * Dlažba na ulici — nepravidelné dlaždice, tmavší okraje.
 */
export function createPavementTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, size, size);

    const rows = 10;
    const cols = 10;
    const cell = size / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * cell;
            const y = r * cell;
            const offset = (Math.random() - 0.5) * 6;
            const v = Math.random() * 20;
            ctx.fillStyle = `rgb(${145 - v}, ${120 - v}, ${90 - v})`;
            ctx.fillRect(x + 2 + offset, y + 2 + offset, cell - 4, cell - 4);

            // Tmavší okraj
            ctx.strokeStyle = 'rgba(60, 50, 40, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2 + offset, y + 2 + offset, cell - 4, cell - 4);
        }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
}

/**
 * Tráva — zelená s různými odstíny a detaily.
 */
export function createGrassTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Základ
    ctx.fillStyle = '#4A6B3D';
    ctx.fillRect(0, 0, size, size);

    // Trsy trávy — malé čáry různých odstínů
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const len = 4 + Math.random() * 8;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        const g = 80 + Math.random() * 60;
        ctx.strokeStyle = `rgb(${40 + Math.random() * 20}, ${g}, ${30 + Math.random() * 15})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(15, 15);
    return tex;
}

/**
 * Voda — modrá základ (bude doplněna shaderem).
 */
export function createWaterNormalTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080FF'; // střední normal
    ctx.fillRect(0, 0, size, size);

    // Jemné vlny
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 2 + Math.random() * 4;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(140, 140, 255, 0.5)');
        grad.addColorStop(1, 'rgba(128, 128, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
}

// ═══════════════════════════════════════════════════════════════
//  PŘEDVYROBENÉ MATERIÁLY (reusability)
// ═══════════════════════════════════════════════════════════════

const wallTexture = createStoneTexture();
const plasterTexture = createPlasterTexture();
const brickTexture = createBrickTexture();
const roofTexture = createRoofTexture();
const pavementTexture = createPavementTexture();
const grassTexture = createGrassTexture();

export const WALL_MATERIALS = [
    new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.85, metalness: 0.0 }),
    new THREE.MeshStandardMaterial({ map: plasterTexture, roughness: 0.9, metalness: 0.0 }),
    new THREE.MeshStandardMaterial({ map: brickTexture, roughness: 0.88, metalness: 0.0 })
];

export const ROOF_MATERIAL = new THREE.MeshStandardMaterial({
    map: roofTexture,
    color: 0xC04820,
    roughness: 0.9,
    metalness: 0.0
});

export const PAVEMENT_MATERIAL = new THREE.MeshStandardMaterial({
    map: pavementTexture,
    roughness: 0.95,
    metalness: 0.0
});

export const GRASS_MATERIAL = new THREE.MeshStandardMaterial({
    map: grassTexture,
    roughness: 1.0,
    metalness: 0.0
});
