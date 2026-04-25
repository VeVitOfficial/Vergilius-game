import { gameState } from '../gameState.js';

/**
 * MinigameManager — placeholder pro minihry.
 * Zobrazí fullscreen overlay s názvem knihy.
 * Po zavření (ESC nebo tlačítko) přidá knihu do inventáře a obnoví pointer lock.
 */
export class MinigameManager {
    constructor(onClose) {
        this.overlay = document.getElementById('minigame-overlay');
        this.titleEl = document.getElementById('minigame-title');
        this.resumeBtn = document.getElementById('minigame-resume');
        this.onClose = onClose;
        this.active = false;
        this.currentBookId = null;
        this.currentBookName = '';

        // ESC zavře minihru
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.active) {
                e.preventDefault();
                this.close();
            }
        });

        // Tlačítko explicitně vyžaduje user gesture pro pointer lock
        this.resumeBtn.addEventListener('click', () => {
            this.close();
        });
    }

    start(bookId, bookName) {
        this.active = true;
        this.currentBookId = bookId;
        this.currentBookName = bookName;
        gameState.isInMinigame = true;

        this.titleEl.textContent = bookName;
        this.overlay.style.display = 'flex';

        // Uvolníme pointer lock, aby šla použít myš na tlačítka
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    close() {
        if (!this.active) return;

        // Přidáme knihu do inventáře
        if (this.currentBookId && !gameState.inventory.has(this.currentBookId)) {
            gameState.addToInventory(this.currentBookId);
        }

        this.active = false;
        gameState.isInMinigame = false;
        this.overlay.style.display = 'none';

        // Callback — řekneme main.js, ať znovu zamkne pointer
        if (this.onClose) this.onClose(this.currentBookId, this.currentBookName);

        this.currentBookId = null;
        this.currentBookName = '';
    }

    isActive() {
        return this.active;
    }
}
