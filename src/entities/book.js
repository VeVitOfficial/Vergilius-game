import * as THREE from 'three';
import { BOOKS, COLORS } from '../config.js';

/**
 * BookManager — vytváří 5 knih s procedurální texturou (canvas),
 * pulzováním a vznášením. Spravuje jejich viditelnost podle stavu.
 */
export class BookManager {
    constructor(scene) {
        this.scene = scene;
        this.books = []; // { mesh, id, name, position, collected }
    }

    generate() {
        const texture = this.createBookTexture();
        const material = new THREE.SpriteMaterial({ map: texture });

        BOOKS.forEach(data => {
            const sprite = new THREE.Sprite(material.clone());
            sprite.position.set(data.x, data.y, data.z);
            sprite.scale.set(0.8, 1.0, 1);
            this.scene.add(sprite);

            this.books.push({
                mesh: sprite,
                id: data.id,
                name: data.name,
                position: new THREE.Vector3(data.x, data.y, data.z),
                collected: false,
                baseScale: new THREE.Vector3(0.8, 1.0, 1),
                phase: Math.random() * Math.PI * 2
            });
        });
    }

    /** Procedurální textura knihy: modrá obálka se zlatým křížkem */
    createBookTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Pozadí obálky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, 64, 128);

        // Okraj
        ctx.strokeStyle = '#5A9ACD';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 60, 124);

        // Zlatý křížek (iluminace)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(26, 20, 12, 80);
        ctx.fillRect(12, 54, 40, 12);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
    }

    /** Animace: pulzování scale a vznášení Y */
    update(time) {
        this.books.forEach(book => {
            if (book.collected) return;

            // Pulzování scale
            const s = 1.0 + Math.sin(time * 3 + book.phase) * 0.08;
            book.mesh.scale.copy(book.baseScale).multiplyScalar(s);

            // Vznášení
            book.mesh.position.y = book.position.y + Math.sin(time * 2 + book.phase) * 0.15;
        });
    }

    /** Najde nejbližší nesebranou knihu a vrátí ji (nebo null) */
    getNearest(playerPos, maxDist) {
        let nearest = null;
        let minD = Infinity;

        for (const book of this.books) {
            if (book.collected) continue;
            const d = playerPos.distanceTo(book.position);
            if (d < minD && d <= maxDist) {
                minD = d;
                nearest = book;
            }
        }
        return nearest;
    }

    /** Označí knihu jako sebranou a okamžitě ji skryje */
    collect(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;
        book.collected = true;
        book.mesh.visible = false;
    }

    /** Vrátí počet nesebraných knih */
    getRemainingCount() {
        return this.books.filter(b => !b.collected).length;
    }

    /** Vrátí seznam nesebraných knih pro raycast/minimap */
    getActiveBooks() {
        return this.books.filter(b => !b.collected);
    }
}
