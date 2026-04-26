import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════
//  PROCEDURÁLNÍ TEXTURY — canvas-based generátory
// ═══════════════════════════════════════════════════════════════

/**
 * Normal map generátor z canvasu — Sobel operator pro 3D reliéf.
 */
function generateNormalMapFromCanvas(canvas, strength = 1.0) {
    const w = canvas.width;
    const h = canvas.height;
    const srcCtx = canvas.getContext('2d');
    const src = srcCtx.getImageData(0, 0, w, h);
    const dst = srcCtx.createImageData(w, h);
    const d = src.data;
    const out = dst.data;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x) * 4;
            // Sobel pro výšku (grayscale z brightness)
            const getH = (ox, oy) => {
                const idx = ((y + oy) * w + (x + ox)) * 4;
                return (d[idx] + d[idx + 1] + d[idx + 2]) / 3;
            };
            const sx = (getH(1, -1) + 2 * getH(1, 0) + getH(1, 1)) - (getH(-1, -1) + 2 * getH(-1, 0) + getH(-1, 1));
            const sy = (getH(-1, 1) + 2 * getH(0, 1) + getH(1, 1)) - (getH(-1, -1) + 2 * getH(0, -1) + getH(1, -1));
            const s = strength / 255;
            const nx = -(sx * s);
            const ny = -(sy * s);
            const nz = 1.0;
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            out[i] = Math.floor((nx / len) * 0.5 + 0.5) * 255;
            out[i + 1] = Math.floor((ny / len) * 0.5 + 0.5) * 255;
            out[i + 2] = Math.floor((nz / len) * 0.5 + 0.5) * 255;
            out[i + 3] = 255;
        }
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = w;
    outCanvas.height = h;
    const outCtx = outCanvas.getContext('2d');
    outCtx.putImageData(dst, 0, 0);
    const tex = new THREE.CanvasTexture(outCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

// ═══════════════════════════════════════════════════════════════
//  EXISTUJÍCÍ VYLEPŠENÉ TEXTURY
// ═══════════════════════════════════════════════════════════════

/**
 * Kamenná zeď — větší kvádry, hlubší spáry, prasklinky, patina.
 */
export function createStoneTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#B8A078';
    ctx.fillRect(0, 0, size, size);

    const rows = 6;
    const cols = 6;
    const cellH = size / rows;
    const cellW = size / cols;

    for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (cellW / 2);
        for (let c = -1; c < cols + 1; c++) {
            const x = c * cellW + offset;
            const y = r * cellH;
            const gapX = 4 + Math.random() * 2;
            const gapY = 4 + Math.random() * 2;
            const w = cellW - gapX;
            const h = cellH - gapY;

            const v = 15 + Math.random() * 35;
            ctx.fillStyle = `rgb(${190 - v}, ${165 - v}, ${130 - v})`;
            ctx.fillRect(x + gapX / 2, y + gapY / 2, w, h);

            for (let i = 0; i < 60; i++) {
                const sx = x + gapX / 2 + Math.random() * w;
                const sy = y + gapY / 2 + Math.random() * h;
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`;
                ctx.fillRect(sx, sy, 2, 2);
            }

            // Prasklinky
            if (Math.random() < 0.4) {
                ctx.strokeStyle = `rgba(40, 30, 20, ${0.1 + Math.random() * 0.15})`;
                ctx.lineWidth = 0.5 + Math.random();
                ctx.beginPath();
                let px = x + gapX / 2 + Math.random() * w;
                let py = y + gapY / 2 + Math.random() * h;
                ctx.moveTo(px, py);
                for (let s = 0; s < 3; s++) {
                    px += (Math.random() - 0.5) * 30;
                    py += (Math.random() - 0.5) * 30;
                    ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
        }
    }

    // Spáry
    ctx.strokeStyle = '#4A3A2A';
    ctx.lineWidth = 4;
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

    // Patina — zelenavé/hnědé skvrny v rozích
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 20 + Math.random() * 40;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(80, 90, 50, 0.15)');
        grad.addColorStop(1, 'rgba(80, 90, 50, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.userData.normalMap = generateNormalMapFromCanvas(canvas, 1.2);
    return tex;
}

/**
 * Omítka — skvrny od vlhkosti, odpadlá omítka, graffiti.
 */
export function createPlasterTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#E0C8A0';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 6000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const a = Math.random() * 0.06;
        const dark = Math.random() > 0.5;
        ctx.fillStyle = dark ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, 2, 2);
    }

    // Vlhkost
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 10 + Math.random() * 30;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(90, 70, 40, 0.25)');
        grad.addColorStop(1, 'rgba(90, 70, 40, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Odpadlá omítka — odhalené cihly
    for (let i = 0; i < 6; i++) {
        const x = Math.random() * (size - 80);
        const y = Math.random() * (size - 60);
        const w = 30 + Math.random() * 50;
        const h = 20 + Math.random() * 40;
        ctx.fillStyle = '#A08060';
        ctx.fillRect(x, y, w, h);
        // "Cihly" uvnitř
        ctx.fillStyle = '#8B6B4B';
        ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
        ctx.fillStyle = '#6B4B30';
        ctx.fillRect(x + 4, y + 12, w - 8, 3);
    }

    // Graffiti — tenké červené čáry (antické)
    for (let i = 0; i < 4; i++) {
        const x = Math.random() * (size - 60);
        const y = 20 + Math.random() * (size - 40);
        ctx.strokeStyle = `rgba(160, 30, 30, ${0.15 + Math.random() * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 8; j++) {
            ctx.lineTo(x + j * 6 + Math.random() * 3, y + (Math.random() - 0.5) * 8);
        }
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.userData.normalMap = generateNormalMapFromCanvas(canvas, 0.8);
    return tex;
}

/**
 * Římské cihly — tenké, poměr 1:4, řady 18+.
 */
export function createBrickTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#A89880';
    ctx.fillRect(0, 0, size, size);

    const rows = 18;
    const bh = size / rows;
    const bw = bh * 4;

    for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (bw / 2);
        for (let c = -1; c < size / bw + 1; c++) {
            const x = c * bw + offset;
            const y = r * bh;
            const gap = 2;
            const v = Math.random() * 25;
            ctx.fillStyle = `rgb(${155 + v}, ${85 + v / 2}, ${50 + v / 3})`;
            ctx.fillRect(x + gap, y + gap, bw - gap * 2, bh - gap * 2);

            // Subtle variace
            for (let n = 0; n < 20; n++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
                ctx.fillRect(x + gap + Math.random() * (bw - gap * 2), y + gap + Math.random() * (bh - gap * 2), 2, 2);
            }
        }
    }

    // Spáry
    ctx.strokeStyle = '#8A7A60';
    ctx.lineWidth = 2;
    for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * bh);
        ctx.lineTo(size, r * bh);
        ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
}

/**
 * Terakotové tašky — imbrices (zaoblené) + tegulae (ploché).
 */
export function createRoofTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#B03010';
    ctx.fillRect(0, 0, size, size);

    const rowH = 14;
    const tileW = 28;

    for (let r = 0; r < size / rowH; r++) {
        const y = r * rowH;
        for (let c = 0; c < size / tileW + 1; c++) {
            const x = c * tileW + (r % 2) * (tileW / 2);
            // Imbrices (zaoblená vrchní taška)
            ctx.fillStyle = `rgb(${170 + Math.random() * 25}, ${50 + Math.random() * 10}, ${20 + Math.random() * 10})`;
            ctx.beginPath();
            ctx.arc(x + tileW / 2, y, tileW / 2, 0, Math.PI, false);
            ctx.fill();
            // Tegulae (plochá podkladová)
            ctx.fillStyle = `rgb(${150 + Math.random() * 20}, ${40 + Math.random() * 8}, ${15 + Math.random() * 8})`;
            ctx.fillRect(x + 2, y + 2, tileW - 4, rowH - 4);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, y + rowH - 2, size, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
}

/**
 * Dlažba — polygonální kameny, koleje, pulvinaria.
 */
export function createPavementTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#7A6A50';
    ctx.fillRect(0, 0, size, size);

    // Polygonální kameny
    const rows = 7;
    const cols = 7;
    const cell = size / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * cell;
            const y = r * cell;
            const ox = (Math.random() - 0.5) * 8;
            const oy = (Math.random() - 0.5) * 8;
            const v = Math.random() * 20;
            ctx.fillStyle = `rgb(${135 - v}, ${115 - v}, ${85 - v})`;
            ctx.beginPath();
            const cx = x + cell / 2 + ox;
            const cy = y + cell / 2 + oy;
            const sides = 4 + Math.floor(Math.random() * 3);
            for (let s = 0; s < sides; s++) {
                const angle = (s / sides) * Math.PI * 2 - Math.PI / 2;
                const rx = cell * (0.3 + Math.random() * 0.2);
                const ry = cell * (0.3 + Math.random() * 0.2);
                const px = cx + Math.cos(angle) * rx;
                const py = cy + Math.sin(angle) * ry;
                if (s === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            // Spáry
            ctx.strokeStyle = 'rgba(50, 40, 30, 0.5)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    // Koleje od vozů
    ctx.strokeStyle = 'rgba(40, 30, 20, 0.2)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(size * 0.15, 0);
    ctx.lineTo(size * 0.15, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.85, 0);
    ctx.lineTo(size * 0.85, size);
    ctx.stroke();

    // Pulvinaria — vyvýšené kameny
    for (let i = 0; i < 4; i++) {
        const px = (0.2 + i * 0.2) * size;
        const py = Math.random() * size;
        ctx.fillStyle = '#8A7A60';
        ctx.beginPath();
        ctx.ellipse(px, py, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
}

/**
 * Tráva — bohatší trsy, variace.
 */
export function createGrassTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3D5A2D';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const len = 4 + Math.random() * 10;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        const g = 70 + Math.random() * 70;
        const r = 30 + Math.random() * 20;
        ctx.strokeStyle = `rgb(${r}, ${g}, ${20 + Math.random() * 15})`;
        ctx.lineWidth = 1 + Math.random() * 1.5;
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
 * Normál mapa pro vodu.
 */
export function createWaterNormalTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8080FF';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 800; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 2 + Math.random() * 6;
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
//  NOVÉ TEXTURY
// ═══════════════════════════════════════════════════════════════

/**
 * Bílý mramor s šedavými žilkami pro chrámy.
 */
export function createMarbleTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#F0EAE0';
    ctx.fillRect(0, 0, size, size);

    // Žilky
    for (let i = 0; i < 20; i++) {
        ctx.strokeStyle = `rgba(160, 150, 140, ${0.1 + Math.random() * 0.15})`;
        ctx.lineWidth = 0.5 + Math.random() * 2;
        ctx.beginPath();
        let px = Math.random() * size;
        let py = Math.random() * size;
        ctx.moveTo(px, py);
        for (let s = 0; s < 6; s++) {
            px += (Math.random() - 0.5) * 60;
            py += (Math.random() - 0.5) * 60;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    // Mikrošum
    for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`;
        ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
}

/**
 * Římská mozaika — geometrický vzor na podlahu vil.
 */
export function createMosaicTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#C8A888';
    ctx.fillRect(0, 0, size, size);

    const tile = 24;
    for (let r = 0; r < size / tile; r++) {
        for (let c = 0; c < size / tile; c++) {
            const x = c * tile;
            const y = r * tile;
            const pattern = (r + c) % 4;

            if (pattern === 0) {
                ctx.fillStyle = '#A07050';
                ctx.fillRect(x + 4, y + 4, tile - 8, tile - 8);
            } else if (pattern === 1) {
                ctx.fillStyle = '#6B5D4F';
                ctx.beginPath();
                ctx.arc(x + tile / 2, y + tile / 2, tile / 2 - 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (pattern === 2) {
                ctx.fillStyle = '#D4B896';
                ctx.fillRect(x + 4, y + 4, tile - 8, tile - 8);
                ctx.fillStyle = '#8B6B4B';
                ctx.fillRect(x + 8, y + 8, tile - 16, tile - 16);
            } else {
                ctx.strokeStyle = '#8B6B4B';
                ctx.lineWidth = 3;
                ctx.strokeRect(x + 2, y + 2, tile - 4, tile - 4);
            }

            // Mezera
            ctx.fillStyle = 'rgba(60, 40, 30, 0.3)';
            ctx.fillRect(x, y, tile, 2);
            ctx.fillRect(x, y, 2, tile);
        }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    tex.magFilter = THREE.NearestFilter;
    return tex;
}

/**
 * Tmavá okna pro insulae — obdélníky s dřevěnými rámy.
 */
export function createWindowTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2A2018';
    ctx.fillRect(0, 0, size, size);

    // Rám
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(0, 0, size, 8);
    ctx.fillRect(0, 0, 8, size);
    ctx.fillRect(size - 8, 0, 8, size);
    ctx.fillRect(0, size - 8, size, 8);

    // Středový rám
    ctx.fillRect(size / 2 - 3, 8, 6, size - 16);
    ctx.fillRect(8, size / 2 - 3, size - 16, 6);

    // Záclona / ztmavení
    ctx.fillStyle = 'rgba(10, 8, 5, 0.4)';
    ctx.fillRect(8, 8, size / 2 - 11, size / 2 - 11);
    ctx.fillRect(size / 2 + 5, 8, size / 2 - 13, size / 2 - 11);
    ctx.fillRect(8, size / 2 + 5, size / 2 - 11, size / 2 - 13);
    ctx.fillRect(size / 2 + 5, size / 2 + 5, size / 2 - 13, size / 2 - 13);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
}

/**
 * Taberna (obchod) — otevřený prostor s amforami.
 */
export function createTabernaTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1A1410';
    ctx.fillRect(0, 0, size, size);

    // Stojany
    ctx.fillStyle = '#8B6B4B';
    ctx.fillRect(20, 40, 60, 8);
    ctx.fillRect(20, 100, 60, 8);
    ctx.fillRect(150, 40, 70, 8);

    // Amfory (elipsy)
    const amforas = [{ x: 40, y: 70 }, { x: 70, y: 70 }, { x: 180, y: 70 }, { x: 210, y: 70 }];
    amforas.forEach(({ x, y }) => {
        ctx.fillStyle = '#A06030';
        ctx.beginPath();
        ctx.ellipse(x, y, 12, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#703010';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Plachta
    ctx.fillStyle = '#D8C8B0';
    ctx.fillRect(0, 0, size, 25);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
}

/**
 * Graffiti — nápisy SPQR, jména.
 */
export function createGraffitiTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#C0A878';
    ctx.fillRect(0, 0, size, size);

    // Různá graffiti
    const phrases = ['SPQR', 'VENI VIDI VICI', 'AENEAS', 'POMPEII', 'LIVIA', 'CAESAR'];
    ctx.font = 'bold 14px serif';
    phrases.forEach((p, i) => {
        ctx.fillStyle = `rgba(120, 30, 30, ${0.2 + Math.random() * 0.2})`;
        const x = 10 + Math.random() * (size - 100);
        const y = 20 + i * 40 + Math.random() * 10;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.random() - 0.5) * 0.2);
        ctx.fillText(p, 0, 0);
        ctx.restore();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
}

/**
 * Dřevěné dveře s kovovými poutky.
 */
export function createDoorTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#5C3A1E';
    ctx.fillRect(0, 0, size, size);

    // Prkna
    for (let i = 0; i < 6; i++) {
        const x = i * (size / 6);
        const v = Math.random() * 15;
        ctx.fillStyle = `rgb(${90 + v}, ${55 + v / 2}, ${25 + v / 3})`;
        ctx.fillRect(x + 1, 0, size / 6 - 2, size);
    }

    // Poutka
    ctx.fillStyle = '#B0A080';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#806040';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Obruč
    ctx.strokeStyle = '#B0A080';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, size - 16, size - 16);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
}

// ═══════════════════════════════════════════════════════════════
//  PŘEDVYROBENÉ MATERIÁLY
// ═══════════════════════════════════════════════════════════════

const stoneTex = createStoneTexture();
const plasterTex = createPlasterTexture();
const brickTex = createBrickTexture();
const roofTex = createRoofTexture();
const pavementTex = createPavementTexture();
const grassTex = createGrassTexture();
const marbleTex = createMarbleTexture();
const mosaicTex = createMosaicTexture();
const windowTex = createWindowTexture();
const tabernaTex = createTabernaTexture();
const doorTex = createDoorTexture();

export const WALL_MATERIALS = [
    new THREE.MeshStandardMaterial({ map: stoneTex, normalMap: stoneTex.userData.normalMap || null, roughness: 0.85, metalness: 0.0 }),
    new THREE.MeshStandardMaterial({ map: plasterTex, normalMap: plasterTex.userData.normalMap || null, roughness: 0.9, metalness: 0.0 }),
    new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.88, metalness: 0.0 })
];

export const ROOF_MATERIAL = new THREE.MeshStandardMaterial({
    map: roofTex,
    color: 0xC04820,
    roughness: 0.9,
    metalness: 0.0
});

export const PAVEMENT_MATERIAL = new THREE.MeshStandardMaterial({
    map: pavementTex,
    roughness: 0.95,
    metalness: 0.0
});

export const GRASS_MATERIAL = new THREE.MeshStandardMaterial({
    map: grassTex,
    roughness: 1.0,
    metalness: 0.0
});

export const MARBLE_MATERIAL = new THREE.MeshStandardMaterial({
    map: marbleTex,
    roughness: 0.5,
    metalness: 0.0
});

export const MOSAIC_MATERIAL = new THREE.MeshStandardMaterial({
    map: mosaicTex,
    roughness: 0.6,
    metalness: 0.0
});

export const WINDOW_MATERIAL = new THREE.MeshStandardMaterial({
    map: windowTex,
    roughness: 0.7,
    metalness: 0.0
});

export const TABERNA_MATERIAL = new THREE.MeshStandardMaterial({
    map: tabernaTex,
    roughness: 0.8,
    metalness: 0.0
});

export const DOOR_MATERIAL = new THREE.MeshStandardMaterial({
    map: doorTex,
    roughness: 0.85,
    metalness: 0.15
});
