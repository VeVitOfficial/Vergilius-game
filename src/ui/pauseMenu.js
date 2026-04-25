/**
 * PauseMenu — overlay přes celou obrazovku, který se otevře stiskem ESC.
 * Umožňuje pokračovat, zobrazit ovládání, restartovat nebo opustit hru.
 */
export class PauseMenu {
    constructor(onResume, onRestart, onQuit) {
        this.overlay = document.getElementById('pause-overlay');
        this.controlsPanel = document.getElementById('pause-controls');
        this.onResume = onResume;
        this.onRestart = onRestart;
        this.onQuit = onQuit;
        this.visible = false;

        this.setupButtons();
    }

    setupButtons() {
        document.getElementById('pause-resume').addEventListener('click', () => this.resume());
        document.getElementById('pause-controls-btn').addEventListener('click', () => this.toggleControls());
        document.getElementById('pause-restart').addEventListener('click', () => this.restart());
        document.getElementById('pause-quit').addEventListener('click', () => this.quit());

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        if (this.visible) {
            this.resume();
        } else {
            this.show();
        }
    }

    show() {
        this.visible = true;
        this.overlay.style.display = 'flex';
        this.controlsPanel.style.display = 'none';
        if (this.onResume) this.onResume(false); // false = pausing
    }

    resume() {
        this.visible = false;
        this.overlay.style.display = 'none';
        this.controlsPanel.style.display = 'none';
        if (this.onResume) this.onResume(true); // true = resuming
    }

    toggleControls() {
        const panel = this.controlsPanel;
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    restart() {
        if (this.onRestart) this.onRestart();
    }

    quit() {
        if (this.onQuit) this.onQuit();
    }
}
