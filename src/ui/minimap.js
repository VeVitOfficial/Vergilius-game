import { WORLD_SIZE, HOME, BUILDINGS } from '../config.js';

/**
 * Minimap — top-down canvas v pravém horním rohu.
 * Vykresluje budovy, fórum, dům, knihy a hráče jako trojúhelník s rotací.
 */
export class Minimap {
    constructor() {
        this.canvas = document.getElementById('minimap');
        this.ctx = this.canvas.getContext('2d');
        this.width = 200;
        this.height = 150;
    }

    /**
     * @param {Object} player — { x, z, rotationY }
     * @param {Array} books — [{ x, z, collected }]
     */
    update(player, books) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Pozadí
        ctx.fillStyle = 'rgba(26, 15, 10, 0.8)';
        ctx.fillRect(0, 0, this.width, this.height);

        const scaleX = this.width / WORLD_SIZE;
        const scaleY = this.height / WORLD_SIZE;
        const offsetX = WORLD_SIZE / 2;
        const offsetZ = WORLD_SIZE / 2;

        // Pomocná funkce: world → canvas
        const tx = (wx) => (wx + offsetX) * scaleX;
        const ty = (wz) => (wz + offsetZ) * scaleY;

        // Cesty (centrální kříž)
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tx(0), 0); ctx.lineTo(tx(0), this.height);
        ctx.moveTo(0, ty(0)); ctx.lineTo(this.width, ty(0));
        ctx.stroke();

        // Forum (uprostřed)
        ctx.fillStyle = '#A89070';
        ctx.fillRect(tx(-10), ty(-10), 20 * scaleX, 20 * scaleY);

        // Budovy
        ctx.fillStyle = '#6B5D4F';
        BUILDINGS.forEach(b => {
            ctx.fillRect(tx(b.x - b.w / 2), ty(b.z - b.d / 2), b.w * scaleX, b.d * scaleY);
        });

        // Vergiliův dům
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(tx(HOME.x - HOME.w / 2), ty(HOME.z - HOME.d / 2), HOME.w * scaleX, HOME.d * scaleY);

        // Knihy (modré tečky)
        books.forEach(b => {
            if (b.collected) return;
            ctx.fillStyle = '#87CEEB';
            ctx.beginPath();
            ctx.arc(tx(b.position.x), ty(b.position.z), 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Hráč (červený trojúhelník, rotovaný)
        ctx.save();
        ctx.translate(tx(player.x), ty(player.z));
        ctx.rotate(-player.rotationY); // minus, protože canvas Y je dolů
        ctx.fillStyle = '#FF3333';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, 4);
        ctx.lineTo(4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
