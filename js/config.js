// ═══════════════════════════════════════════════════════════════
//  CONFIG — konstanty, barvy, pozice knih a budov
// ═══════════════════════════════════════════════════════════════

export const WORLD_SIZE = 100; // velikost světa v jednotkách

export const PLAYER = {
    speed: 5,
    sprintMult: 1.6,
    eyeHeight: 1.6,
    radius: 0.25,
    height: 1.6,
    fov: 75,
    near: 0.1,
    far: 200
};

export const HOME = {
    x: -35, z: -35,
    w: 8, h: 6, d: 8,
    label: 'DOMUS VERGILII'
};

export const BOOKS = [
    { id: 'AENEIS_I',   name: 'AENEIS I',   x: 40, z: 40,  y: 1.2 },
    { id: 'AENEIS_II',  name: 'AENEIS II',  x: -40, z: -40, y: 1.2 },
    { id: 'AENEIS_VI',  name: 'AENEIS VI',  x: 0, z: 45,   y: 1.2 },
    { id: 'GEORGICA',   name: 'GEORGICA',   x: -42, z: 10,  y: 1.2 },
    { id: 'BUCOLICA',   name: 'BUCOLICA',   x: 42, z: -10,  y: 1.2 }
];

export const INTERACTION = {
    bookDistance: 3,
    homeDistance: 4
};

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
    fog: 0x3a2818
};

export const BUILDINGS = [
    // x, z, w, d, h — rozmístěné po mapě
    { x: -20, z: -20, w: 4, d: 4, h: 5 },
    { x: -10, z: -25, w: 5, d: 5, h: 6 },
    { x: 0,   z: -30, w: 4, d: 4, h: 5 },
    { x: 10,  z: -25, w: 5, d: 5, h: 6 },
    { x: 20,  z: -20, w: 4, d: 4, h: 5 },
    { x: -25, z: -5,  w: 4, d: 5, h: 6 },
    { x: 25,  z: -5,  w: 5, d: 4, h: 5 },
    { x: -20, z: 10,  w: 5, d: 5, h: 6 },
    { x: 20,  z: 10,  w: 4, d: 5, h: 5 },
    { x: -10, z: 20,  w: 4, d: 4, h: 5 },
    { x: 10,  z: 20,  w: 5, d: 4, h: 6 },
    { x: -30, z: 20,  w: 4, d: 4, h: 5 },
    { x: 30,  z: 20,  w: 5, d: 5, h: 6 },
    { x: -15, z: 30,  w: 4, d: 5, h: 5 },
    { x: 15,  z: 30,  w: 4, d: 4, h: 5 },
    { x: -5,  z: -40, w: 5, d: 5, h: 6 },
    { x: 5,   z: -40, w: 4, d: 5, h: 5 },
    { x: 0,   z: 35,  w: 5, d: 4, h: 6 }
];

export const COLUMNS = [
    { x: -8, z: -8 }, { x: 8, z: -8 },
    { x: -8, z: 8 },  { x: 8, z: 8 },
    { x: 0, z: -8 },  { x: 0, z: 8 },
    { x: -8, z: 0 },  { x: 8, z: 0 }
];

export const TREES = [
    { x: 38, z: -15 }, { x: 42, z: -12 }, { x: 45, z: -8 },
    { x: 40, z: -5 },  { x: 44, z: -2 },  { x: 38, z: 2 },
    { x: 43, z: 5 },   { x: 40, z: 8 },   { x: 45, z: 12 },
    { x: 39, z: 15 },  { x: 44, z: 18 }
];

export const TOMBSTONES = [
    { x: -5, z: 42 }, { x: -2, z: 44 }, { x: 2, z: 43 },
    { x: 5, z: 45 },  { x: -3, z: 48 }, { x: 3, z: 47 },
    { x: 0, z: 41 },  { x: -6, z: 46 }, { x: 6, z: 42 }
];

export const RUIN_STONES = [
    { x: -42, z: -42 }, { x: -38, z: -45 }, { x: -45, z: -38 },
    { x: -40, z: -40 }, { x: -35, z: -44 }, { x: -44, z: -35 },
    { x: -38, z: -38 }, { x: -43, z: -43 }
];
