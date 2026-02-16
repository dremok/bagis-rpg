import { MAP_COLS, MAP_ROWS, URBAN_END_COL } from './constants';

// Tile types
export const enum TileType {
  GRASS = 0,
  ROAD = 1,
  BUILDING = 2,
  TREE = 3,
  WATER = 4,
  FENCE = 5,
  PATH = 6,
  BUILDING_DOOR = 7,
  GRASS_DARK = 8,
}

export interface MapData {
  tiles: TileType[][];
  collisions: boolean[][];
  fenomenPositions: { col: number; row: number }[];
  becknarePositions: { col: number; row: number }[];
  playerStart: { col: number; row: number };
  bossSpawn: { col: number; row: number };
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateMap(): MapData {
  const rand = seededRandom(42);
  const tiles: TileType[][] = [];
  const collisions: boolean[][] = [];

  // Initialize with grass
  for (let r = 0; r < MAP_ROWS; r++) {
    tiles[r] = [];
    collisions[r] = [];
    for (let c = 0; c < MAP_COLS; c++) {
      // Forest area gets dark grass
      if (c >= URBAN_END_COL) {
        tiles[r][c] = rand() < 0.3 ? TileType.GRASS_DARK : TileType.GRASS;
      } else {
        tiles[r][c] = TileType.GRASS;
      }
      collisions[r][c] = false;
    }
  }

  // -- URBAN AREA (Bagarmossen) --

  // Main horizontal road through Bagarmossen
  const mainRoadRow = 20;
  for (let c = 0; c < URBAN_END_COL; c++) {
    for (let dr = -1; dr <= 1; dr++) {
      tiles[mainRoadRow + dr][c] = TileType.ROAD;
    }
  }

  // Vertical road
  const vertRoadCol = 15;
  for (let r = 5; r < MAP_ROWS - 5; r++) {
    for (let dc = -1; dc <= 1; dc++) {
      tiles[r][vertRoadCol + dc] = TileType.ROAD;
    }
  }

  // Buildings in Bagarmossen
  const buildings: { x: number; y: number; w: number; h: number }[] = [
    // Cluster near center -- "Bagis Centrum"
    { x: 3, y: 5, w: 5, h: 4 },
    { x: 3, y: 11, w: 4, h: 3 },
    { x: 9, y: 5, w: 4, h: 5 },
    { x: 9, y: 12, w: 5, h: 3 },
    // South side
    { x: 3, y: 24, w: 5, h: 4 },
    { x: 3, y: 30, w: 4, h: 3 },
    { x: 10, y: 24, w: 4, h: 3 },
    { x: 10, y: 29, w: 5, h: 4 },
    // East side near forest edge
    { x: 20, y: 5, w: 4, h: 4 },
    { x: 20, y: 12, w: 5, h: 3 },
    { x: 20, y: 24, w: 4, h: 4 },
    { x: 25, y: 7, w: 3, h: 5 },
    { x: 25, y: 28, w: 4, h: 3 },
  ];

  for (const b of buildings) {
    for (let r = b.y; r < b.y + b.h && r < MAP_ROWS; r++) {
      for (let c = b.x; c < b.x + b.w && c < MAP_COLS; c++) {
        tiles[r][c] = TileType.BUILDING;
        collisions[r][c] = true;
      }
    }
    // Door at bottom center
    const doorCol = b.x + Math.floor(b.w / 2);
    const doorRow = b.y + b.h - 1;
    if (doorRow < MAP_ROWS && doorCol < MAP_COLS) {
      tiles[doorRow][doorCol] = TileType.BUILDING_DOOR;
      collisions[doorRow][doorCol] = true; // Still can't enter
    }
  }

  // -- FOREST AREA (Nackareservatet) --

  // Dense trees
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = URBAN_END_COL; c < MAP_COLS; c++) {
      if (rand() < 0.25) {
        tiles[r][c] = TileType.TREE;
        collisions[r][c] = true;
      }
    }
  }

  // Clear some forest paths
  const forestPaths = [
    // Main path from urban area into forest
    { startR: 20, startC: URBAN_END_COL, endR: 20, endC: MAP_COLS - 5 },
    // Branch north
    { startR: 20, startC: 40, endR: 5, endC: 40 },
    // Branch south
    { startR: 20, startC: 45, endR: 35, endC: 45 },
    // Clearing path
    { startR: 5, startC: 40, endR: 5, endC: 55 },
    { startR: 35, startC: 45, endR: 35, endC: 55 },
  ];

  for (const p of forestPaths) {
    const dr = Math.sign(p.endR - p.startR);
    const dc = Math.sign(p.endC - p.startC);
    let r = p.startR;
    let c = p.startC;
    while (r !== p.endR || c !== p.endC) {
      for (let or2 = -1; or2 <= 1; or2++) {
        for (let oc = -1; oc <= 1; oc++) {
          const nr = r + or2;
          const nc = c + oc;
          if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
            if (tiles[nr][nc] === TileType.TREE) {
              tiles[nr][nc] = TileType.PATH;
              collisions[nr][nc] = false;
            }
          }
        }
      }
      if (r !== p.endR) r += dr;
      if (c !== p.endC) c += dc;
    }
  }

  // Small pond in forest
  const pondCenterR = 28;
  const pondCenterC = 50;
  for (let r = pondCenterR - 2; r <= pondCenterR + 2; r++) {
    for (let c = pondCenterC - 3; c <= pondCenterC + 3; c++) {
      if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
        const dr = r - pondCenterR;
        const dc = c - pondCenterC;
        if (dr * dr + (dc * dc) / 2 <= 4) {
          tiles[r][c] = TileType.WATER;
          collisions[r][c] = true;
        }
      }
    }
  }

  // Fences around some buildings
  const fencedBuildings = [buildings[0], buildings[3]];
  for (const b of fencedBuildings) {
    for (let c = b.x - 1; c <= b.x + b.w; c++) {
      if (c >= 0 && c < MAP_COLS) {
        if (b.y - 1 >= 0) {
          tiles[b.y - 1][c] = TileType.FENCE;
          collisions[b.y - 1][c] = true;
        }
        if (b.y + b.h < MAP_ROWS) {
          tiles[b.y + b.h][c] = TileType.FENCE;
          collisions[b.y + b.h][c] = true;
        }
      }
    }
    for (let r = b.y - 1; r <= b.y + b.h; r++) {
      if (r >= 0 && r < MAP_ROWS) {
        if (b.x - 1 >= 0) {
          tiles[r][b.x - 1] = TileType.FENCE;
          collisions[r][b.x - 1] = true;
        }
        if (b.x + b.w < MAP_COLS) {
          tiles[r][b.x + b.w] = TileType.FENCE;
          collisions[r][b.x + b.w] = true;
        }
      }
    }
    // Gate opening
    const gateCol = b.x + Math.floor(b.w / 2);
    if (b.y + b.h < MAP_ROWS) {
      tiles[b.y + b.h][gateCol] = TileType.GRASS;
      collisions[b.y + b.h][gateCol] = false;
    }
  }

  // Fenomen positions -- scattered across both zones
  const fenomenPositions: { col: number; row: number }[] = [
    // Urban fenomen
    { col: 7, row: 16 },
    { col: 18, row: 10 },
    { col: 5, row: 34 },
    { col: 24, row: 17 },
    // Forest fenomen
    { col: 35, row: 20 },
    { col: 42, row: 8 },
    { col: 48, row: 15 },
    { col: 53, row: 5 },
    { col: 38, row: 32 },
    { col: 55, row: 20 },
    { col: 45, row: 35 },
    { col: 52, row: 30 },
  ];

  // Make sure fenomen positions are walkable
  for (const f of fenomenPositions) {
    tiles[f.row][f.col] = TileType.GRASS;
    collisions[f.row][f.col] = false;
    // Clear surrounding tiles too
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = f.row + dr;
        const nc = f.col + dc;
        if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
          if (tiles[nr][nc] === TileType.TREE || tiles[nr][nc] === TileType.FENCE) {
            tiles[nr][nc] = TileType.GRASS;
            collisions[nr][nc] = false;
          }
        }
      }
    }
  }

  // Becknare positions
  const becknarePositions: { col: number; row: number }[] = [
    // Urban becknare
    { col: 8, row: 18 },
    { col: 13, row: 8 },
    { col: 22, row: 22 },
    { col: 6, row: 28 },
    { col: 18, row: 32 },
    // Forest becknare
    { col: 34, row: 15 },
    { col: 42, row: 25 },
    { col: 50, row: 10 },
    { col: 38, row: 35 },
    { col: 55, row: 28 },
  ];

  // Ensure becknare positions are walkable
  for (const b of becknarePositions) {
    if (collisions[b.row][b.col]) {
      tiles[b.row][b.col] = TileType.GRASS;
      collisions[b.row][b.col] = false;
    }
  }

  // Player starts in Bagarmossen near the road
  const playerStart = { col: 15, row: 22 };
  collisions[playerStart.row][playerStart.col] = false;

  // Boss spawns in the deep forest clearing
  const bossSpawn = { col: 50, row: 5 };
  // Clear area for boss
  for (let dr = -3; dr <= 3; dr++) {
    for (let dc = -3; dc <= 3; dc++) {
      const nr = bossSpawn.row + dr;
      const nc = bossSpawn.col + dc;
      if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS) {
        tiles[nr][nc] = nr >= 0 && nc >= 0 ? TileType.GRASS_DARK : TileType.GRASS;
        collisions[nr][nc] = false;
      }
    }
  }

  return {
    tiles,
    collisions,
    fenomenPositions,
    becknarePositions,
    playerStart,
    bossSpawn,
  };
}
