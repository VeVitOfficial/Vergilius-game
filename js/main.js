import * as THREE from 'three';
import { PLAYER, HOME, INTERACTION, COLORS } from './config.js';
import { Player } from './player.js';
import { TerrainManager } from './world/terrain.js';
import { BuildingManager } from './world/buildings.js';
import { DecorationManager } from './entities/decoration.js';
import { BookManager } from './entities/book.js';
import { HUD } from './ui/hud.js';
import { Menu } from './ui/menu.js';
import { Minimap } from './ui/minimap.js';
import { MinigameManager } from './minigames/minigameManager.js';

// ═══════════════════════════════════════════════════════════════
//  HLAVNÍ INICIALIZACE
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById('game-canvas');

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scéna
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.fog);
scene.fog = new THREE.FogExp2(COLORS.fog, 0.015);

// Kamera
const camera = new THREE.PerspectiveCamera(PLAYER.fov, window.innerWidth / window.innerHeight, PLAYER.near, PLAYER.far);

// Světla
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffeedd, 0.9);
sunLight.position.set(-50, 30, -20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 200;
sunLight.shadow.camera.left = -60;
sunLight.shadow.camera.right = 60;
sunLight.shadow.camera.top = 60;
sunLight.shadow.camera.bottom = -60;
scene.add(sunLight);

// Herní manažeři
const terrainManager = new TerrainManager(scene);
const buildingManager = new BuildingManager(scene);
const decorationManager = new DecorationManager(scene);
const bookManager = new BookManager(scene);

terrainManager.generate();
buildingManager.generate();
decorationManager.generate();
bookManager.generate();

// UI
const hud = new HUD();
const minimap = new Minimap();
const menu = new Menu(() => {
    player.lock();
    hud.show();
});

const minigameManager = new MinigameManager((bookId) => {
    // Po zavření minihry — kniha je v inventáři
    if (bookId && !state.inventory.has(bookId)) {
        state.inventory.add(bookId);
        hud.setBookCounter(state.delivered.size);
    }
    player.lock();
});

// Hráč
const player = new Player(camera, document.body);

// Stav hry
const state = {
    inventory: new Set(),
    delivered: new Set(),
    totalBooks: 5,
    gameWon: false
};

// ─── DOMUS LABEL (HTML overlay následující 3D pozici) ──────
const domusLabel = document.getElementById('domus-label');

function updateDomusLabel() {
    // Pozice nad střechou domu
    const labelPos = new THREE.Vector3(HOME.x, HOME.h + 3, HOME.z);
    labelPos.project(camera);

    const x = (labelPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-labelPos.y * 0.5 + 0.5) * window.innerHeight;

    // Viditelné jen pokud je před kamerou
    if (labelPos.z < 1 && x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight) {
        domusLabel.style.display = 'block';
        domusLabel.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    } else {
        domusLabel.style.display = 'none';
    }
}

// ─── INTERAKCE (stisk E) ──────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.code !== 'KeyE') return;
    if (!player.isLocked()) return;
    if (minigameManager.isActive()) return;
    if (state.gameWon) return;

    const pos = player.getWorldPosition();

    // 1) Sebrání knihy → spustí minihru, do inventáře se přidá až po dokončení
    const nearest = bookManager.getNearest(pos, INTERACTION.bookDistance);
    if (nearest) {
        bookManager.collect(nearest.id);
        player.unlock();
        minigameManager.start(nearest.id, nearest.name);
        return;
    }

    // 2) Odevzdání u domu
    const homeDist = pos.distanceTo(new THREE.Vector3(HOME.x, PLAYER.eyeHeight, HOME.z));
    if (homeDist <= INTERACTION.homeDistance && state.inventory.size > 0) {
        // Přesun inventáře → odevzdané
        for (const bookId of state.inventory) {
            state.delivered.add(bookId);
        }
        state.inventory.clear();
        hud.setBookCounter(state.delivered.size);

        if (state.delivered.size >= state.totalBooks) {
            triggerWin();
        }
    }
});

// ─── VÝHRA ────────────────────────────────────────────────
function triggerWin() {
    state.gameWon = true;
    player.unlock();
    document.getElementById('win-overlay').style.display = 'flex';
}

// ─── RESTART (R) ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR' && state.gameWon) {
        location.reload();
    }
});

// ─── RESIZE ───────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ═══════════════════════════════════════════════════════════════
//  HLAVNÍ HERNI SMYČKA
// ═══════════════════════════════════════════════════════════════

const clock = new THREE.Clock();

function gameLoop() {
    requestAnimationFrame(gameLoop);

    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.getElapsedTime();

    if (!minigameManager.isActive() && !state.gameWon) {
        // Animace vody
        terrainManager.update(time);

        // Pohyb hráče s AABB collision
        player.update(delta, (box) => buildingManager.checkCollision(box));

        // Animace knih (pulzování, vznášení, fade-out)
        bookManager.update(time);

        // DOMUS label
        updateDomusLabel();

        // Interakční prompt
        const pos = player.getWorldPosition();
        const nearestBook = bookManager.getNearest(pos, INTERACTION.bookDistance);
        const homeDist = pos.distanceTo(new THREE.Vector3(HOME.x, PLAYER.eyeHeight, HOME.z));
        const nearHome = homeDist <= INTERACTION.homeDistance;
        const hasBooks = state.inventory.size > 0;

        hud.updatePrompt(
            !!nearestBook,
            nearHome,
            hasBooks,
            nearestBook ? nearestBook.name : ''
        );

        // Minimapa
        minimap.update(player.getPosition(), bookManager.books);
    }

    renderer.render(scene, camera);
}

// Start
menu.show();
gameLoop();
