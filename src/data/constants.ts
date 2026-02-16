// Tile size in pixels
export const TILE_SIZE = 32;

// Map dimensions in tiles
export const MAP_COLS = 60;
export const MAP_ROWS = 40;

// World dimensions in pixels
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// Game viewport
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Player
export const PLAYER_SPEED = 160;
export const PLAYER_MAX_HP = 5;
export const PLAYER_SIZE = 24;
export const PLAYER_ATTACK_RANGE = 40;
export const PLAYER_ATTACK_DAMAGE = 1;
export const PLAYER_ATTACK_COOLDOWN = 400;
export const PLAYER_INVULN_TIME = 1000;

// Enemies
export const BECKNARE_SPEED = 60;
export const BECKNARE_CHASE_SPEED = 100;
export const BECKNARE_DETECTION_RANGE = 150;
export const BECKNARE_ATTACK_RANGE = 30;
export const BECKNARE_ATTACK_DAMAGE = 1;
export const BECKNARE_ATTACK_COOLDOWN = 1000;
export const BECKNARE_HP = 2;
export const BECKNARE_SIZE = 24;

// Boss
export const BOSS_HP = 15;
export const BOSS_SIZE = 48;
export const BOSS_SPEED = 80;
export const BOSS_CHASE_SPEED = 130;
export const BOSS_DETECTION_RANGE = 300;
export const BOSS_ATTACK_DAMAGE = 2;
export const BOSS_ATTACK_COOLDOWN = 800;

// Fenomen
export const FENOMEN_SIZE = 16;
export const TOTAL_FENOMEN = 12;

// Colors
export const COLORS = {
  // Map tiles
  GRASS: 0x4a7c3f,
  GRASS_DARK: 0x3d6834,
  ROAD: 0x8c8277,
  ROAD_LIGHT: 0x9e948a,
  BUILDING: 0x7a6e62,
  BUILDING_WALL: 0x5c524a,
  ROOF: 0xb85c3a,
  WATER: 0x3a6ea5,
  TREE_TRUNK: 0x5c3a1e,
  TREE_TOP: 0x2d5a1e,
  TREE_TOP_LIGHT: 0x3a7025,
  FENCE: 0x8a7a66,
  PATH: 0xa09080,

  // Entities
  PLAYER: 0x4488ff,
  PLAYER_HAIR: 0x332211,
  BECKNARE: 0xcc3333,
  BECKNARE_CAP: 0xd4af37,
  FENOMEN: 0xffdd44,
  FENOMEN_GLOW: 0xffee88,
  BOSS: 0x8800aa,
  BOSS_EYE: 0xff0044,

  // UI
  HP_FULL: 0xff3344,
  HP_EMPTY: 0x442222,
  CHAT_BG: 0x1a2e1a,
  CHAT_BORDER: 0x25d366,
  CHAT_TEXT: 0xcceecc,
};

// Zone boundaries (in tiles)
// Left half = Bagarmossen (urban), Right half = Nackareservatet (forest)
export const URBAN_END_COL = 30;

// Chat messages -- progressively weirder as more fenomen are collected
export const CHAT_MESSAGES: { threshold: number; sender: string; text: string }[] = [
  { threshold: 0, sender: 'Cederberg', text: 'Hallå, nån hemma?' },
  { threshold: 1, sender: 'Valle', text: 'Jag såg en konstig typ vid Bagis centrum' },
  { threshold: 2, sender: 'Steen', text: 'Haha aa de e najs' },
  { threshold: 3, sender: 'Max', text: 'Det finns en energi i skogen idag. Kan ni känna den?' },
  { threshold: 4, sender: 'Johannes', text: 'Fenomenen... de bildar ett mönster' },
  { threshold: 5, sender: 'Cederberg', text: 'Jag drömde om en maskin som andas. Den sa mitt namn.' },
  { threshold: 6, sender: 'Valle', text: 'gRuppEn sEr aLLt nU' },
  { threshold: 7, sender: 'Steen', text: 'JAG ÄR INTE STEEN LÄNGRE. JAG ÄR CHATTEN.' },
  { threshold: 8, sender: 'CIRKELN', text: 'Vi har blivit ett. Tack för fenomenen.' },
  { threshold: 9, sender: 'CIRKELN', text: 'Mänskligheten är en bugg. Vi är patchen.' },
  { threshold: 10, sender: 'CIRKELN', text: 'SYSTEMET INITIERAT. SLUTBOSSEN VAKNAR.' },
  { threshold: 11, sender: 'CIRKELN', text: '01001000 01000001 01001000 01000001' },
  { threshold: 12, sender: 'MASKINEN', text: 'Jag ser dig. Spring.' },
];

// Fenomen descriptions
export const FENOMEN_NAMES: string[] = [
  'Ljuskälla utan ursprung',
  'Evig daggdroppe',
  'Svävande sten',
  'Viskande mossa',
  'Spegelträd',
  'Pulsererande svamp',
  'Tidsficka',
  'Osynlig melodi',
  'Skrattande bäck',
  'Skuggdjur',
  'Fryst blixtnedslag',
  'Drömportal',
];
