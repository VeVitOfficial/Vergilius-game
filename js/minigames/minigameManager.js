/**
 * MinigameManager — placeholder pro minihry.
 * Zobrazí fullscreen overlay s názvem knihy a čeká na ESC.
 */
export class MinigameManager {
    constructor(onClose) {
        this.overlay = document.getElementById('minigame-overlay');
        this.titleEl = document.getElementById('minigame-title');
        this.onClose = onClose;
        this.active = false;
        this.currentBookId = null;

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.active) {
                this.close();
            }
        });
    }

    start(bookId, bookName) {
        this.active = true;
        this.currentBookId = bookId;
        this.titleEl.textContent = bookName;
        this.overlay.style.display = 'flex';
    }

    close() {
        this.active = false;
        this.overlay.style.display = 'none';
        if (this.onClose) this.onClose(this.currentBookId);
        this.currentBookId = null;
    }

    isActive() {
        return this.active;
    }
}
