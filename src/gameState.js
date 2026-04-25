// ═══════════════════════════════════════════════════════════════
//  GAME STATE — centralizovaný herní stav
//  ═══════════════════════════════════════════════════════════════

/**
 * Jednotný zdroj pravdy pro celou hru.
 * Všechny scény a UI čtou/zapisují sem.
 */
export const gameState = {
    // Herní režim
    isPaused: false,
    isInMinigame: false,
    isGameStarted: false,
    gameWon: false,

    // Knihy
    inventory: new Set(),      // knihy sebrané, čekající na odevzdání
    delivered: new Set(),      // knihy již odevzdané doma
    totalBooks: 5,

    // Interiéry
    currentInterior: null,     // null = venku
    lastExteriorPosition: null,

    // Časová data (pro správný delta time po resume)
    lastFrameTime: 0,

    // Pomocné metody
    reset() {
        this.isPaused = false;
        this.isInMinigame = false;
        this.isGameStarted = false;
        this.gameWon = false;
        this.inventory.clear();
        this.delivered.clear();
        this.currentInterior = null;
        this.lastExteriorPosition = null;
    },

    addToInventory(bookId) {
        this.inventory.add(bookId);
    },

    deliverBooks() {
        for (const id of this.inventory) {
            this.delivered.add(id);
        }
        this.inventory.clear();
        return this.delivered.size;
    },

    getDeliveredCount() {
        return this.delivered.size;
    },

    isInventoryEmpty() {
        return this.inventory.size === 0;
    }
};
