/**
 * HUD — HTML overlay s počítadlem knih, crosshairem a interakčními prompty.
 * Pracuje přímo s DOM elementy.
 */
export class HUD {
    constructor() {
        this.elBooks = document.getElementById('hud-books');
        this.elPrompt = document.getElementById('interaction-prompt');
        this.elHud = document.getElementById('hud-overlay');
    }

    show() {
        this.elHud.style.display = 'block';
    }

    hide() {
        this.elHud.style.display = 'none';
    }

    setBookCounter(count) {
        this.elBooks.textContent = count;
    }

    showPrompt(text) {
        this.elPrompt.textContent = text;
        this.elPrompt.classList.remove('hidden');
    }

    hidePrompt() {
        this.elPrompt.classList.add('hidden');
    }

    /** Zobrazení/zobrazení promptu podle kontextu */
    updatePrompt(nearBook, nearHome, hasBooks, bookName = '') {
        if (nearBook) {
            this.showPrompt(`[ E ] Sebrat knihu: ${bookName}`);
        } else if (nearHome && hasBooks) {
            this.showPrompt('[ E ] Odevzdat knihy');
        } else {
            this.hidePrompt();
        }
    }
}
