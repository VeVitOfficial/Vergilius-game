// ═══════════════════════════════════════════════════════════════
//  CONFIG — konstanty, barvy, pozice knih a budov (ŘÍM)
// ═══════════════════════════════════════════════════════════════

export const WORLD_SIZE = 200;

export const PLAYER = {
    speed: 5,
    sprintMult: 1.6,
    eyeHeight: 1.6,
    radius: 0.25,
    height: 1.6,
    fov: 75,
    near: 0.1,
    far: 120
};

// Domus Vergilii — blízko centra, u Pantheonu
export const HOME = {
    x: -5, z: -5,
    w: 8, h: 6, d: 8,
    label: 'DOMUS VERGILII'
};

// 5 knih na ikonických místech Říma
export const BOOKS = [
    { id: 'AENEIS_I',   name: 'AENEIS I',   x: 75,  z: 65,  y: 1.2 }, // Tibera nábřeží
    { id: 'AENEIS_II',  name: 'AENEIS II',  x: 25,  z: 45,  y: 1.2 }, // Forum Romano
    { id: 'AENEIS_VI',  name: 'AENEIS VI',  x: 70,  z: 55,  y: 0.5 }, // Koloseum podzemí
    { id: 'GEORGICA',   name: 'GEORGICA',   x: -40, z: -50, y: 1.2 }, // Mausoleum Augusti
    { id: 'BUCOLICA',   name: 'BUCOLICA',   x: -50, z: 55,  y: 1.2 }  // Thermae
];

export const INTERACTION = {
    bookDistance: 3,
    homeDistance: 4,
    doorDistance: 3
};

// Dveře do interiérů
export const DOORS = [
    { x: -5, z: 25, interiorId: 'pantheon', label: 'Pantheon' },
    { x: -5, z: -1, interiorId: 'domus', label: 'Domus Vergilii' },
    { x: 70, z: 65, interiorId: 'colosseum', label: 'Koloseum – podzemí' },
    { x: 5, z: -35, interiorId: 'temple', label: 'Templum Jovis' }
];

export const COLORS = {
    ground: 0x8B7355,
    road: 0x9B8570,
    forum: 0xA89070,
    building: 0x6B5D4F,
    roof: 0x4A3D35,
    roofEdge: 0x3A2F25,
    column: 0xE8DCC0,
    water: 0x1E4D6B,
    waterDeep: 0x153A4F,
    field: 0x3D5A3D,
    furrow: 0x2E452E,
    cemetery: 0x2A2A2A,
    tombstone: 0x4A4A4A,
    park: 0x4A6B3D,
    treeTrunk: 0x5C4033,
    treeLeaf: 0x3D6B30,
    ruinFloor: 0x7A7A6E,
    ruinStone: 0x9A9A8E,
    pier: 0x5C4033,
    homeBorder: 0xFFD700,
    homeBg: 0x6B5D4F,
    book: 0x87CEEB,
    bookCross: 0xFFD700,
    fog: 0xC8A878,
    tiber: 0x4A7A9A,
    marble: 0xF0EAD6,
    travertine: 0xD4C4A0
};

// ═══════════════════════════════════════════════════════════════
//  ZÓNY MĚSTA (procedurální layout)
// ═══════════════════════════════════════════════════════════════
export const ZONES = {
    SUBURA: {
        bounds: { x1: 20, z1: -50, x2: 80, z2: -10 },
        style: 'insulae_dense',
        floors: { min: 3, max: 5 },
        blockSize: { min: 15, max: 22 }
    },
    PALATIN: {
        bounds: { x1: 10, z1: 30, x2: 60, z2: 80 },
        style: 'villas',
        blockSize: { min: 20, max: 30 }
    },
    CAMPUS_MARTIUS: {
        bounds: { x1: -60, z1: 10, x2: -10, z2: 50 },
        style: 'insulae_dense',
        floors: { min: 2, max: 4 },
        blockSize: { min: 18, max: 25 }
    },
    FORUM: {
        bounds: { x1: 10, z1: 20, x2: 50, z2: 50 },
        style: 'forum',
        blockSize: { min: 30, max: 40 }
    },
    TRASTEVERE: {
        bounds: { x1: -90, z1: 20, x2: -45, z2: 70 },
        style: 'insulae_dense',
        floors: { min: 2, max: 3 },
        blockSize: { min: 12, max: 18 }
    },
    AVENTIN: {
        bounds: { x1: 30, z1: 50, x2: 80, z2: 90 },
        style: 'insulae_dense',
        floors: { min: 2, max: 4 },
        blockSize: { min: 15, max: 22 }
    },
    CAPITOL: {
        bounds: { x1: -10, z1: -50, x2: 25, z2: -20 },
        style: 'temple',
        blockSize: { min: 20, max: 30 }
    }
};

// ═══════════════════════════════════════════════════════════════
//  ZÁKLADNÍ BUDOVY (fallback pro minimap)
// ═══════════════════════════════════════════════════════════════
export const BUILDINGS = [];

// ═══════════════════════════════════════════════════════════════
//  PAMÁTKY (speciální budovy — antický Řím 1. stol. n.l.)
// ═══════════════════════════════════════════════════════════════
export const LANDMARKS = {
    // Koloseum — 4 patra oblouků, částečně zborcené
    COLOSSEUM:    { x: 70, z: 55, rx: 32, rz: 26, h: 16 },
    // Pantheon — 16 sloupů, korintské hlavice
    PANTHEON:     { x: -5, z: 15, r: 12, h: 15 },
    // Pyramida Cestia
    PYRAMID:      { x: 75, z: 75, w: 10, h: 12 },
    // Thermae — lázně, velký komplex
    THERMAE:      { x: -50, z: 55, w: 20, d: 30, h: 8 },
    // Circus Maximus — závodiště
    CIRCUS:       { x: 50, z: -55, w: 15, d: 80, h: 2 },
    // Templum Jovis Capitolini — největší chrám
    TEMPLE_JOVIS: { x: 5, z: -35, w: 18, d: 20, h: 10 },
    // Mausoleum Augusti — kruhová stavba
    MAUSOLEUM:    { x: -40, z: -50, r: 12, h: 10 },
    // Triumfální oblouk (Arcus Titi)
    ARCH:         { x: 25, z: 40, w: 8, d: 4, h: 10 },
    // Basilica Julia
    BASILICA:     { x: 30, z: 35, w: 12, d: 20, h: 8 },
};

// Forum Romano — ruiny (sloupy + rozpadlé zdi)
export const FORUM_COLUMNS = [
    { x: 28, z: 42 }, { x: 30, z: 44 }, { x: 32, z: 42 },
    { x: 26, z: 46 }, { x: 34, z: 46 }, { x: 30, z: 48 }
];

export const FORUM_RUINS = [
    { x: 25, z: 40, w: 3, h: 2, d: 8 },
    { x: 35, z: 45, w: 4, h: 1.5, d: 6 },
    { x: 30, z: 50, w: 8, h: 3, d: 2 }
];

// Piazza del Popolo — obelisk
export const OBELISK = { x: -15, z: -70 };

// Terme di Caracalla — ruiny lázní
export const TERME_RUINS = [
    { x: 80, z: 80, w: 10, h: 6, d: 15 },
    { x: 85, z: 78, w: 8, h: 5, d: 4 },
    { x: 78, z: 82, w: 5, h: 4, d: 10 }
];

// Fontána di Trevi
export const TREVI_FOUNTAIN = { x: -5, z: -25 };

// ═══════════════════════════════════════════════════════════════
//  MOSTY přes Tiberu
// ═══════════════════════════════════════════════════════════════
export const BRIDGES = [
    { x: -40, z: 0,  w: 4, d: 12 }, // Ponte Sant'Angelo
    { x: 0,   z: 0,  w: 4, d: 12 }, // Ponte Cestio
    { x: 45,  z: 0,  w: 4, d: 12 }, // Ponte Sisto
];

export const COLUMNS = [
    { x: -8, z: -8 }, { x: 8, z: -8 },
    { x: -8, z: 8 },  { x: 8, z: 8 },
    { x: 0, z: -8 },  { x: 0, z: 8 },
    { x: -8, z: 0 },  { x: 8, z: 0 }
];

export const TREES = [
    { x: -55, z: -50 }, { x: -60, z: -45 }, { x: -70, z: -55 },
    { x: -50, z: -60 }, { x: -65, z: -65 }, { x: -75, z: -50 },
    { x: -45, z: -70 }, { x: -55, z: -75 }, { x: -65, z: -70 },
    { x: -35, z: -65 }, { x: -40, z: -55 }, { x: -30, z: -60 }
];

export const TOMBSTONES = [
    { x: 60, z: 75 }, { x: 62, z: 78 }, { x: 65, z: 74 },
    { x: 68, z: 76 }, { x: 70, z: 72 }, { x: 72, z: 78 }
];

export const RUIN_STONES = [
    { x: 25, z: 45 }, { x: 28, z: 48 }, { x: 32, z: 44 },
    { x: 26, z: 50 }, { x: 34, z: 48 }, { x: 30, z: 46 }
];
