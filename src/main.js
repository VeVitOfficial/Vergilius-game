import * as THREE from 'three';
import { PLAYER, HOME, INTERACTION, COLORS, DOORS } from './config.js';
import { gameState } from './gameState.js';
import { Player } from './player.js';
import { TerrainManager } from './world/terrain.js';
import { BuildingManager } from './world/buildings.js';
import { DecorationManager } from './entities/decoration.js';
import { BookManager } from './entities/book.js';
import { HUD } from './ui/hud.js';
import { Menu } from './ui/menu.js';
import { PauseMenu } from './ui/pauseMenu.js';
import { Minimap } from './ui/minimap.js';
import { MinigameManager } from './minigames/minigameManager.js';
import { SkyManager } from './world/sky.js';
import { TiberManager } from './world/tiber.js';
import { LandmarkManager } from './world/landmarks.js';
import { InteriorManager } from './interiors/interiorManager.js';
import { ParticleManager } from './effects/particles.js';
import { AudioManager } from './audio/audioManager.js';
import './style.css';

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
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// Scéna
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xC8A878);
scene.fog = new THREE.FogExp2(0xC8A878, 0.008);

// Kamera
const camera = new THREE.PerspectiveCamera(PLAYER.fov, window.innerWidth / window.innerHeight, PLAYER.near, PLAYER.far);

// ═══ OSVĚTLENÍ ═══
// Ambient — slabé, teplé základní osvětlení
const ambientLight = new THREE.AmbientLight(0xB8A888, 0.3);
scene.add(ambientLight);

// Hemisphere — nebeské světlo shora, zemní odraz zdola
const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.6);
scene.add(hemiLight);

// Directional (slunce) — hlavní světlo s dlouhými stíny
const sunLight = new THREE.DirectionalLight(0xFFF4E0, 1.2);
sunLight.position.set(50, 80, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 250;
const shadowRange = 120;
sunLight.shadow.camera.left = -shadowRange;
sunLight.shadow.camera.right = shadowRange;
sunLight.shadow.camera.top = shadowRange;
sunLight.shadow.camera.bottom = -shadowRange;
scene.add(sunLight);

// Herní manažeři
const terrainManager = new TerrainManager(scene);
const buildingManager = new BuildingManager(scene);
const decorationManager = new DecorationManager(scene);
const bookManager = new BookManager(scene);
const skyManager = new SkyManager(scene);
const tiberManager = new TiberManager(scene);
const landmarkManager = new LandmarkManager(scene);
const interiorManager = new InteriorManager(scene);
const particleManager = new ParticleManager(scene);
const audioManager = new AudioManager();

terrainManager.generate();
buildingManager.generate();
decorationManager.generate();
bookManager.generate();
skyManager.generate();
tiberManager.generate();
landmarkManager.generate();
interiorManager.generate();
particleManager.generate();

// UI
const hud = new HUD();
const minimap = new Minimap();

// Start menu
const menu = new Menu(() => {
    gameState.isGameStarted = true;
    player.lock();
    hud.show();
    audioManager.init();
    audioManager.startCityAmbient();
});

// Pause menu
const pauseMenu = new PauseMenu(
    (resuming) => {
        if (resuming) {
            gameState.isPaused = false;
            clock.getDelta();
            player.lock();
            audioManager.resume();
        } else {
            gameState.isPaused = true;
            player.unlock();
        }
    },
    () => {
        // Restart
        location.reload();
    },
    () => {
        // Quit → zpět na main menu
        gameState.reset();
        pauseMenu.visible = false;
        player.unlock();
        hud.hide();
        menu.show();
    }
);

// Minigame manager
const minigameManager = new MinigameManager(() => {
    // Po zavření minihry → obnov pointer lock po user gesture (kliknutí)
    hud.setBookCounter(gameState.getDeliveredCount());
    // Pointer lock se obnoví až po kliknutí na canvas (browser policy)
});

// Hráč
const player = new Player(camera, document.body);

// ─── DOMUS LABEL (HTML overlay následující 3D pozici) ──────
const domusLabel = document.getElementById('domus-label');

function updateDomusLabel() {
    const labelPos = new THREE.Vector3(HOME.x, HOME.h + 3, HOME.z);
    labelPos.project(camera);

    const x = (labelPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-labelPos.y * 0.5 + 0.5) * window.innerHeight;

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
    if (gameState.isPaused) return;
    if (gameState.gameWon) return;

    const pos = player.getWorldPosition();

    // 0) Výstup z interiéru
    if (interiorManager.isInside()) {
        const nearExit = interiorManager.getNearestExit(pos, INTERACTION.doorDistance);
        if (nearExit) {
            interiorManager.exit(camera);
        }
        return;
    }

    // 1) Vstup do interiéru
    const nearestDoor = interiorManager.getNearestDoor(pos, DOORS, INTERACTION.doorDistance);
    if (nearestDoor) {
        interiorManager.enter(nearestDoor.interiorId, camera);
        return;
    }

    // 2) Sebrání knihy → spustí minihru
    const nearest = bookManager.getNearest(pos, INTERACTION.bookDistance);
    if (nearest) {
        bookManager.collect(nearest.id);
        audioManager.playCollect();
        player.unlock();
        minigameManager.start(nearest.id, nearest.name);
        return;
    }

    // 3) Odevzdání u domu
    const homeDist = pos.distanceTo(new THREE.Vector3(HOME.x, PLAYER.eyeHeight, HOME.z));
    if (homeDist <= INTERACTION.homeDistance && !gameState.isInventoryEmpty()) {
        const delivered = gameState.deliverBooks();
        audioManager.playDeliver();
        hud.setBookCounter(delivered);

        if (delivered >= gameState.totalBooks) {
            triggerWin();
        }
    }
});

// ─── VÝHRA ────────────────────────────────────────────────
function triggerWin() {
    gameState.gameWon = true;
    player.unlock();
    document.getElementById('win-overlay').style.display = 'flex';
}

// ─── RESTART (R) ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR' && gameState.gameWon) {
        location.reload();
    }
});

// ─── POINTER LOCK OBNOVA PO KLIKNUTÍ ─────────────────────
// Když je hra aktivní, ale pointer lock není (např. po minihře/pauze),
// kliknutí na canvas ho obnoví
canvas.addEventListener('click', () => {
    if (gameState.isGameStarted && !gameState.isPaused && !gameState.gameWon && !minigameManager.isActive()) {
        if (!player.isLocked()) {
            player.lock();
        }
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
let lastFootstepTime = 0;
let lastPlayerPos = new THREE.Vector3();

function gameLoop() {
    requestAnimationFrame(gameLoop);

    // Pokud je pauza nebo minihra, neaktualizujeme herní logiku,
    // ale stále renderujeme scénu (např. animace vody běží dál)
    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.getElapsedTime();

    // Animace vody běží vždy (vizuální ambient)
    terrainManager.update(time);

    // Aktualizace knih (pulzování) běží i v pozadí
    bookManager.update(time);

    // Částice
    particleManager.update(time);

    // Hlavní herní logika — pouze pokud není pauza/minihra/výhra
    if (!gameState.isPaused && !minigameManager.isActive() && !gameState.gameWon) {
        // Pohyb hráče s AABB collision (venku nebo uvnitř)
        player.update(delta, (box) => {
            if (interiorManager.isInside()) {
                return interiorManager.checkCollision(box);
            }
            return buildingManager.checkCollision(box);
        });

        const pos = player.getWorldPosition();

        // Krokový zvuk
        if (player.isOnGround() && pos.distanceTo(lastPlayerPos) > 0.1) {
            if (time - lastFootstepTime > 0.35) {
                audioManager.playFootstep();
                lastFootstepTime = time;
            }
        }
        lastPlayerPos.copy(pos);

        if (interiorManager.isInside()) {
            // Uvnitř interiéru — prompt pro výstup, skryj venkovní UI
            const nearExit = interiorManager.getNearestExit(pos, INTERACTION.doorDistance);
            hud.updatePrompt(false, false, false, '', null, !!nearExit);
            domusLabel.style.display = 'none';
            minimap.canvas.style.display = 'none';
        } else {
            // DOMUS label
            updateDomusLabel();

            // Interakční prompt
            const nearestDoor = interiorManager.getNearestDoor(pos, DOORS, INTERACTION.doorDistance);
            const nearestBook = bookManager.getNearest(pos, INTERACTION.bookDistance);
            const homeDist = pos.distanceTo(new THREE.Vector3(HOME.x, PLAYER.eyeHeight, HOME.z));
            const nearHome = homeDist <= INTERACTION.homeDistance;
            const hasBooks = !gameState.isInventoryEmpty();

            hud.updatePrompt(
                !!nearestBook,
                nearHome,
                hasBooks,
                nearestBook ? nearestBook.name : '',
                nearestDoor,
                false
            );

            // Minimapa
            minimap.canvas.style.display = 'block';
            minimap.update(player.getPosition(), bookManager.books);
        }
    }

    renderer.render(scene, camera);
}

// Start
menu.show();
gameLoop();
