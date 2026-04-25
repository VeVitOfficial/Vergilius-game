/**
 * Menu — startovní obrazovka s tlačítkem a instrukcemi.
 * Řídí pointer lock při startu hry.
 */
export class Menu {
    constructor(onStart) {
        this.overlay = document.getElementById('menu-overlay');
        this.btn = document.getElementById('start-btn');
        this.onStart = onStart;

        this.btn.addEventListener('click', () => this.start());
    }

    start() {
        this.overlay.style.display = 'none';
        if (this.onStart) this.onStart();
    }

    show() {
        this.overlay.style.display = 'flex';
    }
}
