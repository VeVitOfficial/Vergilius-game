import * as THREE from 'three';
import { PLAYER, HOME, INTERACTION, COLORS, DOORS } from './config.js';
import { gameState } from './gameState.js';
import { Player } from './player.js';
import { TerrainManager } from './world/terrain.js';
import { CityLayout } from './world/cityLayout.js';
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
import { NPCManager } from './entities/npcs.js';
import { AssetLoader } from './assets/assetLoader.js';
import { CullingManager } from './world/cullingManager.js';
import './style.css';

// ═══════════════════════════════════════════════════════════════
//  HLAVNÍ INICIALIZACE
// ═══════════════════════════════════════════════════════════════

let terrainManager, cityLayout, decorationManager, bookManager, skyManager,
    tiberManager, landmarkManager, interiorManager, particleManager,
    audioManager, npcManager, hud, minimap, menu, pauseMenu, minigameManager, player,
    cullingManager;

const assetLoader = new AssetLoader();

const canvas = document.getElementById('game-canvas');

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// Debug stats overlay
const statsEl = document.createElement('div');
statsEl.style.cssText = 'position:fixed;top:60px;left:20px;color:#FFD700;font-family:monospace;font-size:14px;z-index:1000;text-shadow:1px 1px 2px #000;background:rgba(0,0,0,0.5);padding:8px;border-radius:4px;';
document.body.appendChild(statsEl);

let frameCount = 0;
let lastFpsUpdate = performance.now();
let currentFps = 0;

function updateGameStats() {
    frameCount++;
    const now = performance.now();
    if (now - lastFpsUpdate > 500) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = now;
    }

    let visibleMeshes = 0, totalMeshes = 0, totalTriangles = 0;
    scene.traverse(obj => {
        if (obj.isMesh) {
            totalMeshes++;
            if (obj.visible) {
                visibleMeshes++;
                if (obj.geometry?.index) {
                    totalTriangles += obj.geometry.index.count / 3;
                } else if (obj.geometry?.attributes?.position) {
                    totalTriangles += obj.geometry.attributes.position.count / 3;
                }
            }
        }
    });

    const info = renderer.info;

    statsEl.innerHTML = `
    FPS: <b>${currentFps}</b><br>
    Meshes: ${visibleMeshes} / ${totalMeshes}<br>
    Draw calls: <b>${info.render.calls}</b><br>
    Triangles rendered: ${(info.render.triangles/1000).toFixed(1)}k<br>
    Triangles total: ${(totalTriangles/1000).toFixed(0)}k<br>
    Geometries: ${info.memory.geometries}<br>
    Textures: ${info.memory.textures}
    `;
}

// Scéna
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xE8C8A0);
scene.fog = new THREE.FogExp2(0xE8C8A0, 0.015);

// Kamera
const camera = new THREE.PerspectiveCamera(PLAYER.fov, window.innerWidth / window.innerHeight, PLAYER.near, PLAYER.far);

// ═══ OSVĚTLENÍ ═══
// Ambient — teplé základní osvětlení
const ambientLight = new THREE.AmbientLight(0xD4B896, 0.25);
scene.add(ambientLight);

// Hemisphere — mediteránní nebe shora, teplá hlína zdola
const hemiLight = new THREE.HemisphereLight(0xC8DDEF, 0xA88860, 0.5);
scene.add(hemiLight);

// Directional (slunce) — pozdní odpoledne, dlouhé stíny
const sunLight = new THREE.DirectionalLight(0xFFE4B5, 1.4);
sunLight.position.set(60, 40, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 250;
sunLight.shadow.bias = -0.0003;
sunLight.shadow.normalBias = 0.05;
const shadowRange = 50;
sunLight.shadow.camera.left = -shadowRange;
sunLight.shadow.camera.right = shadowRange;
sunLight.shadow.camera.top = shadowRange;
sunLight.shadow.camera.bottom = -shadowRange;
sunLight.shadow.camera.far = 100;
scene.add(sunLight);

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function preloadEverything() {
    const loadingBar = document.getElementById('loading-bar-fill');
    const loadingStatus = document.getElementById('loading-status');
    const loadingPercent = document.getElementById('loading-percent');

    function updateLoading(percent, status) {
        if (loadingBar) loadingBar.style.width = `${percent * 100}%`;
        if (loadingPercent) loadingPercent.textContent = `${Math.floor(percent * 100)}%`;
        if (status && loadingStatus) loadingStatus.textContent = status;
    }

    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) menuOverlay.style.display = 'none';

    updateLoading(0, 'Inicializace...');
    await sleep(100);

    // Herní manažeři (konstruktory — bez generate)
    terrainManager = new TerrainManager(scene, assetLoader);
    cityLayout = new CityLayout(scene, assetLoader);
    decorationManager = new DecorationManager(scene, assetLoader);
    bookManager = new BookManager(scene);
    skyManager = new SkyManager(scene);
    tiberManager = new TiberManager(scene);
    landmarkManager = new LandmarkManager(scene, assetLoader);
    interiorManager = new InteriorManager(scene);
    particleManager = new ParticleManager(scene);
    audioManager = new AudioManager();
    npcManager = new NPCManager(scene);

    // FÁZE 1: Načti assety
    updateLoading(0.05, 'Načítání 3D modelů...');
    await assetLoader.loadAll((progress) => {
        updateLoading(0.05 + progress * 0.45, `Načítání 3D modelů... ${Math.floor(progress * 100)}%`);
    });

    // FÁZE 2: Generuj svět
    updateLoading(0.5, 'Stavba Říma...');
    await sleep(50);
    terrainManager.generate();

    updateLoading(0.6, 'Stavba budov...');
    await sleep(50);
    cityLayout.generate();

    updateLoading(0.7, 'Stavba památek...');
    await sleep(50);
    landmarkManager.generate();

    updateLoading(0.8, 'Umisťování dekorací...');
    await sleep(50);
    decorationManager.generate();
    bookManager.generate();

    updateLoading(0.85, 'Stavba interiérů...');
    await sleep(50);
    interiorManager.generate();

    updateLoading(0.9, 'Tibera teče...');
    await sleep(50);
    tiberManager.generate();
    skyManager.generate();
    particleManager.generate();
    npcManager.generate();

    // Oprava frustum culling — bounding spheres na všech meshech
    function fixFrustumCulling() {
        let fixed = 0;
        scene.traverse(obj => {
            if (obj.isMesh) {
                obj.frustumCulled = true;
                if (obj.geometry && !obj.geometry.boundingSphere) {
                    obj.geometry.computeBoundingSphere();
                    fixed++;
                }
                if (obj.geometry && !obj.geometry.boundingBox) {
                    obj.geometry.computeBoundingBox();
                }
            }
            if (obj.isInstancedMesh) {
                obj.frustumCulled = true;
                obj.computeBoundingSphere();
            }
        });
        console.log('[Culling] Fixed bounding spheres on', fixed, 'meshes');
    }
    fixFrustumCulling();

    // Vypni castShadow u malých objektů
    scene.traverse(obj => {
        if (!obj.isMesh) return;
        if (obj.geometry?.boundingSphere?.radius < 3) {
            obj.castShadow = false;
        }
    });

    // Distance culling manager
    cullingManager = new CullingManager(scene, camera);
    cullingManager.scan();

    // FÁZE 3: GPU warm-up
    updateLoading(0.95, 'Příprava grafiky...');
    await sleep(50);
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
    await sleep(100);

    // FÁZE 4: Hotovo
    updateLoading(1.0, 'Připraveno!');
    await sleep(500);

    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    if (menuOverlay) menuOverlay.style.display = 'flex';

    // UI
    hud = new HUD();
    minimap = new Minimap();

    // Start menu
    menu = new Menu(() => {
        gameState.isGameStarted = true;
        player.lock();
        hud.show();
        audioManager.init();
        audioManager.startCityAmbient();
    });

    // Pause menu
    pauseMenu = new PauseMenu(
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
            location.reload();
        },
        () => {
            gameState.reset();
            pauseMenu.visible = false;
            player.unlock();
            hud.hide();
            menu.show();
        }
    );

    // Minigame manager
    minigameManager = new MinigameManager(() => {
        hud.setBookCounter(gameState.getDeliveredCount());
    });

    // Hráč
    player = new Player(camera, document.body);

    gameLoop();
}

preloadEverything().catch((err) => {
    console.error('Game preload failed:', err);
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) loadingStatus.textContent = 'Chyba načítání. Zkuste obnovit stránku.';
});

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
    if (!player || !player.isLocked()) return;
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
    if (!player || !minigameManager) return;
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

    // NPCs
    npcManager.update(time);

    // Hlavní herní logika — pouze pokud není pauza/minihra/výhra
    if (!gameState.isPaused && !minigameManager.isActive() && !gameState.gameWon) {
        // Pohyb hráče s AABB collision (venku nebo uvnitř)
        player.update(delta, (box) => {
            if (interiorManager.isInside()) {
                return interiorManager.checkCollision(box);
            }
            return cityLayout.checkCollision(box);
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

    if (cullingManager) cullingManager.update(time);

    renderer.render(scene, camera);
    updateGameStats();
}

// Inicializace běží asynchronně — viz init() výše
