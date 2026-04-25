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
    far: 250
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
    { id: 'AENEIS_II',  name: 'AENEIS II',  x: 25,  z: 45,  y: 1.2 }, // Foro Romano ruiny
    { id: 'AENEIS_VI',  name: 'AENEIS VI',  x: 70,  z: 55,  y: 0.5 }, // Koloseum podzemí
    { id: 'GEORGICA',   name: 'GEORGICA',   x: -65, z: -55, y: 1.2 }, // Vatikánské zahrady
    { id: 'BUCOLICA',   name: 'BUCOLICA',   x: -40, z: -70, y: 1.2 }  // Villa Borghese
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
    { x: 25, z: -35, interiorId: 'temple', label: 'Chrám Apolla' }
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
//  ZÁKLADNÍ BUDOVY (obytné bloky, tržiště, atd.)
// ═══════════════════════════════════════════════════════════════
export const BUILDINGS = [
    // Trastevere (JZ za řekou)
    { x: -75, z: 55, w: 5, d: 5, h: 6 }, { x: -65, z: 60, w: 4, d: 4, h: 5 },
    { x: -80, z: 45, w: 4, d: 5, h: 5 }, { x: -70, z: 40, w: 5, d: 4, h: 6 },
    { x: -60, z: 50, w: 4, d: 4, h: 5 },
    // Centrum
    { x: -15, z: -15, w: 4, d: 4, h: 5 }, { x: 5, z: -20, w: 5, d: 5, h: 6 },
    { x: 20, z: -10, w: 4, d: 5, h: 5 }, { x: -10, z: 10, w: 5, d: 4, h: 6 },
    { x: 15, z: 15, w: 4, d: 4, h: 5 }, { x: -25, z: 5, w: 4, d: 5, h: 5 },
    { x: 30, z: 5, w: 5, d: 4, h: 6 }, { x: -20, z: 25, w: 5, d: 5, h: 5 },
    { x: 10, z: 30, w: 4, d: 5, h: 5 }, { x: 35, z: 25, w: 4, d: 4, h: 6 },
    // Sever
    { x: -30, z: -40, w: 5, d: 5, h: 6 }, { x: -10, z: -45, w: 4, d: 4, h: 5 },
    { x: 10, z: -40, w: 5, d: 5, h: 6 }, { x: 30, z: -45, w: 4, d: 5, h: 5 },
    // Jih
    { x: 60, z: 70, w: 4, d: 4, h: 5 }, { x: 80, z: 65, w: 5, d: 5, h: 6 },
    { x: 50, z: 80, w: 4, d: 5, h: 5 }, { x: 85, z: 75, w: 5, d: 4, h: 5 },
];

// ═══════════════════════════════════════════════════════════════
//  PAMÁTKY (speciální budovy)
// ═══════════════════════════════════════════════════════════════
export const LANDMARKS = {
    // Koloseum — velký ovál, 4 patra oblouků
    COLOSSEUM: { x: 70, z: 55, rx: 32, rz: 26, h: 14 },
    // Pantheon — kruh + portikus
    PANTHEON:  { x: -5, z: 15, r: 12, h: 14 },
    // Vatikán — velký plac + bazilika s kupolí
    VATICAN:   { x: -65, z: -55, w: 25, d: 35, h: 10, domeH: 18 },
    // Castel Sant'Angelo — kruhová pevnost
    CASTEL:    { x: 45, z: -15, r: 7, h: 12 },
    // Pyramida Cestia
    PYRAMID:   { x: 75, z: 75, w: 10, h: 12 },
    // Vittoriano — bílý monument
    VITTORIANO:{ x: 25, z: -30, w: 18, d: 8, h: 12 },
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
