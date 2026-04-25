import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { PLAYER, HOME } from './config.js';

/**
 * Player — FPS kamera s PointerLockControls, WASD pohybem,
 * sprintem a AABB kolizí vůči budovám.
 */
export class Player {
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new PointerLockControls(camera, domElement);

        // Pozice spawnu: před Vergiliovým domem
        this.camera.position.set(HOME.x + 6, PLAYER.eyeHeight, HOME.z + 8);

        // Pohybové vektory
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Vstup
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.sprint = false;
        this.jump = false;

        // Skákání
        this.yVelocity = 0;
        this.onGround = true;
        this.groundY = PLAYER.eyeHeight;

        this.setupInput();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'ShiftLeft': this.sprint = true; break;
                case 'Space': {
                    if (this.onGround && this.controls.isLocked) {
                        this.yVelocity = 6.5;
                        this.onGround = false;
                    }
                    break;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'ShiftLeft': this.sprint = false; break;
            }
        });
    }

    lock() { this.controls.lock(); }
    unlock() { this.controls.unlock(); }
    isLocked() { return this.controls.isLocked; }
    isOnGround() { return this.onGround; }

    /**
     * Aktualizace pozice hráče s AABB collision detection.
     * @param {number} delta — delta time v sekundách
     * @param {Function} checkCollision — (Box3) => boolean
     */
    update(delta, checkCollision) {
        const speed = PLAYER.speed * (this.sprint ? PLAYER.sprintMult : 1);

        // Gravitace a skok
        const gravity = 18.0;
        if (!this.onGround) {
            this.yVelocity -= gravity * delta;
        }
        this.camera.position.y += this.yVelocity * delta;
        if (this.camera.position.y <= this.groundY) {
            this.camera.position.y = this.groundY;
            this.yVelocity = 0;
            this.onGround = true;
        }

        // Výpočet směru podle kamery (pouze na rovině XZ)
        this.direction.set(0, 0, 0);
        if (this.moveForward) this.direction.z -= 1;
        if (this.moveBackward) this.direction.z += 1;
        if (this.moveLeft) this.direction.x -= 1;
        if (this.moveRight) this.direction.x += 1;
        this.direction.normalize();

        // Lokální směr → world space podle otočení kamery
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const move = new THREE.Vector3()
            .addScaledVector(forward, -this.direction.z)
            .addScaledVector(right, this.direction.x)
            .normalize()
            .multiplyScalar(speed * delta);

        if (move.lengthSq() === 0) return;

        // Slide collision: nejprve X, pak Z (umožňuje klouzání podél zdí)
        const pos = this.camera.position.clone();
        const playerBox = new THREE.Box3();
        const size = new THREE.Vector3(PLAYER.radius * 2, PLAYER.height, PLAYER.radius * 2);

        // Zkus X
        const nextX = pos.clone().add(new THREE.Vector3(move.x, 0, 0));
        playerBox.setFromCenterAndSize(nextX, size);
        if (!checkCollision(playerBox)) {
            this.camera.position.x = nextX.x;
        }

        // Zkus Z
        const nextZ = pos.clone().add(new THREE.Vector3(0, 0, move.z));
        playerBox.setFromCenterAndSize(nextZ, size);
        if (!checkCollision(playerBox)) {
            this.camera.position.z = nextZ.z;
        }
    }

    /** Vrátí pozici hráče jako { x, z, rotationY } pro minimapu */
    getPosition() {
        return {
            x: this.camera.position.x,
            z: this.camera.position.z,
            rotationY: this.camera.rotation.y
        };
    }

    /** Vrátí world pozici kamery */
    getWorldPosition() {
        return this.camera.position.clone();
    }
}
