/**
 * TMX Composite Script
 * 
 * Reads final.tmx, loads all 13 tilesets, composites all layers
 * into a single background PNG, and extracts collision/interactable data.
 * 
 * Usage: node composite.js
 * Output: public/sprites/background.png  (composited background)
 *         Prints collision & interactable data to console
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// ==================== CONFIG ====================
const TMX_PATH = path.join(__dirname, 'final.tmx');
const SPRITES_DIR = path.join(__dirname, 'public', 'sprites');
const OUTPUT_PATH = path.join(SPRITES_DIR, 'background.png');

const MAP_W = 36;
const MAP_H = 23;
const TILE_W = 16;
const TILE_H = 16;

// ==================== TILESET DEFINITIONS (from TMX) ====================
// Map from TMX source path → local filename in public/sprites
const TILESETS = [
  { firstgid: 1,     name: 'fl',      file: 'furniture..png',               cols: 32, count: 2048 },
  { firstgid: 2049,  name: 'floor',   file: 'Floors..png',                  cols: 4,  count: 84 },
  { firstgid: 2133,  name: 'goal',    file: 'goal.png',                     cols: 36, count: 936 },
  { firstgid: 3069,  name: 'book',    file: 'Craftables..png',              cols: 8,  count: 368 },
  { firstgid: 3437,  name: '11',      file: 'Basic Furniture.png',          cols: 9,  count: 54 },
  { firstgid: 3491,  name: '22',      file: 'farmhouse_tiles..png',         cols: 12, count: 240 },
  { firstgid: 3731,  name: '33',      file: 'bathhouse_tiles..png',         cols: 15, count: 240 },
  { firstgid: 3971,  name: '44',      file: 'TownIndoors..png',             cols: 32, count: 4352 },
  { firstgid: 8323,  name: '55',      file: 'townInterior..png',            cols: 32, count: 2176 },
  { firstgid: 10499, name: 'wall',    file: 'walls_and_floors..png',        cols: 16, count: 512 },
  { firstgid: 11011, name: 'spring',  file: 'spring_outdoorsTileSheet..png', cols: 25, count: 1975 },
  { firstgid: 12986, name: 'summer',  file: 'summer_outdoorsTileSheet..png', cols: 25, count: 1975 },
  { firstgid: 14961, name: 'fast',    file: 'Festivals..png',               cols: 32, count: 1024 },
];

// ==================== LAYER ORDER (from TMX, bottom to top) ====================
// We'll parse the TMX to get exact layer data

// ==================== HELPERS ====================
function loadPNG(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return PNG.sync.read(data);
  } catch (e) {
    console.warn(`⚠️ Cannot load: ${filePath}`);
    return null;
  }
}

function findTileset(gid) {
  // Raw GID may have flip flags in upper bits
  const FLIPPED_H = 0x80000000;
  const FLIPPED_V = 0x40000000;
  const FLIPPED_D = 0x20000000;
  const rawGid = gid;
  const cleanGid = gid & ~(FLIPPED_H | FLIPPED_V | FLIPPED_D);
  
  if (cleanGid === 0) return null;
  
  const flipH = (rawGid & FLIPPED_H) !== 0;
  const flipV = (rawGid & FLIPPED_V) !== 0;
  const flipD = (rawGid & FLIPPED_D) !== 0;
  
  // Find which tileset this GID belongs to
  let best = null;
  for (const ts of TILESETS) {
    if (cleanGid >= ts.firstgid && cleanGid < ts.firstgid + ts.count) {
      best = ts;
    }
  }
  
  if (!best) return null;
  
  const localId = cleanGid - best.firstgid;
  const srcX = (localId % best.cols) * TILE_W;
  const srcY = Math.floor(localId / best.cols) * TILE_H;
  
  return { tileset: best, srcX, srcY, flipH, flipV, flipD };
}

function copyTile(dstPng, dstX, dstY, srcPng, srcX, srcY, flipH, flipV, flipD) {
  if (!srcPng) return;
  
  // Bounds check
  if (srcX < 0 || srcY < 0 || srcX + TILE_W > srcPng.width || srcY + TILE_H > srcPng.height) return;
  
  for (let py = 0; py < TILE_H; py++) {
    for (let px = 0; px < TILE_W; px++) {
      // Apply flip transforms
      let sx = px, sy = py;
      
      if (flipD) {
        // Diagonal flip = transpose (swap x,y)
        [sx, sy] = [sy, sx];
      }
      if (flipH) {
        sx = TILE_W - 1 - sx;
      }
      if (flipV) {
        sy = TILE_H - 1 - sy;
      }
      
      const srcIdx = ((srcY + sy) * srcPng.width + (srcX + sx)) * 4;
      const dstIdx = ((dstY + py) * dstPng.width + (dstX + px)) * 4;
      
      const a = srcPng.data[srcIdx + 3];
      if (a === 0) continue; // Skip fully transparent
      
      if (a === 255) {
        // Fully opaque, just copy
        dstPng.data[dstIdx]     = srcPng.data[srcIdx];
        dstPng.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
        dstPng.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
        dstPng.data[dstIdx + 3] = 255;
      } else {
        // Alpha blend
        const sa = a / 255;
        const da = dstPng.data[dstIdx + 3] / 255;
        const outA = sa + da * (1 - sa);
        if (outA > 0) {
          dstPng.data[dstIdx]     = Math.round((srcPng.data[srcIdx] * sa + dstPng.data[dstIdx] * da * (1 - sa)) / outA);
          dstPng.data[dstIdx + 1] = Math.round((srcPng.data[srcIdx + 1] * sa + dstPng.data[dstIdx + 1] * da * (1 - sa)) / outA);
          dstPng.data[dstIdx + 2] = Math.round((srcPng.data[srcIdx + 2] * sa + dstPng.data[dstIdx + 2] * da * (1 - sa)) / outA);
          dstPng.data[dstIdx + 3] = Math.round(outA * 255);
        }
      }
    }
  }
}

// ==================== PARSE TMX ====================
function parseTMX(tmxPath) {
  const xml = fs.readFileSync(tmxPath, 'utf-8');
  
  // Extract layers with their data
  const layers = [];
  const layerRegex = /<layer[^>]*name="([^"]*)"[^>]*>[\s\S]*?<data[^>]*>([\s\S]*?)<\/data>[\s\S]*?<\/layer>/g;
  let match;
  
  while ((match = layerRegex.exec(xml)) !== null) {
    const name = match[1];
    const csvData = match[2].trim();
    const tiles = csvData.split(/[,\s]+/).map(Number);
    layers.push({ name, tiles });
    console.log(`  Layer: "${name}" — ${tiles.length} tiles, non-zero: ${tiles.filter(t => t !== 0).length}`);
  }
  
  return layers;
}

// ==================== MAIN ====================
function main() {
  console.log('🗺️ TMX Composite Tool');
  console.log('====================');
  
  // 1. Parse TMX
  console.log('\n📋 Parsing TMX...');
  const layers = parseTMX(TMX_PATH);
  console.log(`  Found ${layers.length} layers`);
  
  // 2. Load all tileset images
  console.log('\n🖼️ Loading tilesets...');
  const tilesetImages = {};
  for (const ts of TILESETS) {
    const filePath = path.join(SPRITES_DIR, ts.file);
    const img = loadPNG(filePath);
    if (img) {
      tilesetImages[ts.name] = img;
      console.log(`  ✅ ${ts.name}: ${ts.file} (${img.width}×${img.height})`);
    } else {
      console.log(`  ❌ ${ts.name}: ${ts.file}`);
    }
  }
  
  // 3. Create output canvas
  const outW = MAP_W * TILE_W;  // 576
  const outH = MAP_H * TILE_H;  // 368
  const output = new PNG({ width: outW, height: outH });
  
  // Fill with dark background
  for (let i = 0; i < outW * outH * 4; i += 4) {
    output.data[i]     = 5;
    output.data[i + 1] = 3;
    output.data[i + 2] = 3;
    output.data[i + 3] = 255;
  }
  
  // 4. Render all layers (bottom to top)
  console.log('\n🎨 Compositing layers...');
  
  // Identify special layers
  const OBSTACLE_LAYER = '不可互动';
  const INTERACT_LAYER = '可互动';
  
  // Layers that should NOT be rendered (trigger zones / walkability markers)
  const SKIP_LAYERS = new Set([
    'walk', 'pic1', 'pic2', 'pic3', 'pic4',
    'book', 'cal', 'TV', 'map', 'letter', 'gift1', 'table',
    'fram',  // 房间框架 → 前景 Y-sort 渲染
  ]);
  
  // Collect obstacle and interactable tile positions
  const obstacleTiles = [];  // [{x, y}]
  const interactTiles = [];  // [{x, y, gid}]
  
  for (const layer of layers) {
    if (SKIP_LAYERS.has(layer.name)) {
      console.log(`  Skipping trigger layer: "${layer.name}"`);
      continue;
    }
    console.log(`  Rendering: "${layer.name}"`);
    let rendered = 0;
    
    for (let i = 0; i < layer.tiles.length; i++) {
      const gid = layer.tiles[i];
      if (gid === 0) continue;
      
      const col = i % MAP_W;
      const row = Math.floor(i / MAP_W);
      
      // Track obstacle/interactable positions
      if (layer.name === OBSTACLE_LAYER) {
        obstacleTiles.push({ x: col, y: row, gid });
      }
      if (layer.name === INTERACT_LAYER) {
        interactTiles.push({ x: col, y: row, gid });
      }
      
      // Resolve tile
      const info = findTileset(gid);
      if (!info) continue;
      
      const srcImg = tilesetImages[info.tileset.name];
      if (!srcImg) continue;
      
      const dstX = col * TILE_W;
      const dstY = row * TILE_H;
      
      copyTile(output, dstX, dstY, srcImg, info.srcX, info.srcY, info.flipH, info.flipV, info.flipD);
      rendered++;
    }
    
    console.log(`    → ${rendered} tiles rendered`);
  }
  
  // 5. Save output
  console.log('\n💾 Saving background...');
  const buffer = PNG.sync.write(output);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`  ✅ Saved: ${OUTPUT_PATH} (${outW}×${outH}, ${buffer.length} bytes)`);
  
  // 6. Analyze collision data
  console.log('\n🧱 Obstacle tiles (不可互动 layer):');
  analyzeObstacles(obstacleTiles);
  
  console.log('\n🎯 Interactable tiles (可互动 layer):');
  analyzeInteractables(interactTiles);
  
  // 7. Generate walkable zone analysis
  console.log('\n🚶 Walkable zone analysis:');
  analyzeWalkableZones(layers, obstacleTiles, interactTiles);
}

function analyzeObstacles(tiles) {
  if (tiles.length === 0) {
    console.log('  (none)');
    return;
  }
  
  // Group contiguous tiles into rectangles
  const rects = groupIntoRects(tiles);
  console.log(`  ${tiles.length} tiles → ${rects.length} rectangles:`);
  for (const r of rects) {
    console.log(`    { x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h} },`);
  }
}

function analyzeInteractables(tiles) {
  if (tiles.length === 0) {
    console.log('  (none)');
    return;
  }
  
  const rects = groupIntoRects(tiles);
  console.log(`  ${tiles.length} tiles → ${rects.length} groups:`);
  for (const r of rects) {
    console.log(`    { x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h} },  // tiles at this location`);
  }
}

function groupIntoRects(tiles) {
  // Create a set for quick lookup
  const set = new Set(tiles.map(t => `${t.x},${t.y}`));
  const visited = new Set();
  const rects = [];
  
  for (const tile of tiles) {
    const key = `${tile.x},${tile.y}`;
    if (visited.has(key)) continue;
    
    // BFS to find connected region
    let minX = tile.x, maxX = tile.x;
    let minY = tile.y, maxY = tile.y;
    const queue = [{ x: tile.x, y: tile.y }];
    visited.add(key);
    
    while (queue.length > 0) {
      const cur = queue.shift();
      minX = Math.min(minX, cur.x);
      maxX = Math.max(maxX, cur.x);
      minY = Math.min(minY, cur.y);
      maxY = Math.max(maxY, cur.y);
      
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const nk = `${nx},${ny}`;
        if (set.has(nk) && !visited.has(nk)) {
          visited.add(nk);
          queue.push({ x: nx, y: ny });
        }
      }
    }
    
    rects.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
  }
  
  // Sort by position
  rects.sort((a, b) => a.y - b.y || a.x - b.x);
  return rects;
}

function analyzeWalkableZones(layers, obstacleTiles, interactTiles) {
  // Build a "blocked" map from ALL layers
  // Any tile on the 底层 (base) layer that's non-zero is part of the room
  // Tiles on wall rows (rows 0-9) are walls
  // Obstacle and interactable tiles are blocked
  
  const blocked = new Set();
  
  // Mark obstacle tiles
  for (const t of obstacleTiles) {
    blocked.add(`${t.x},${t.y}`);
  }
  
  // Mark interactable tiles  
  for (const t of interactTiles) {
    blocked.add(`${t.x},${t.y}`);
  }
  
  // Find the base layer
  const baseLayer = layers.find(l => l.name === '底层');
  if (!baseLayer) {
    console.log('  No 底层 found');
    return;
  }
  
  // Analyze floor area (rows 10+)
  let floorTiles = 0;
  let blockedFloorTiles = 0;
  for (let row = 10; row < MAP_H; row++) {
    for (let col = 0; col < MAP_W; col++) {
      const gid = baseLayer.tiles[row * MAP_W + col];
      if (gid !== 0) {
        floorTiles++;
        if (blocked.has(`${col},${row}`)) {
          blockedFloorTiles++;
        }
      }
    }
  }
  
  console.log(`  Floor tiles (rows 10-22): ${floorTiles}`);
  console.log(`  Blocked floor tiles: ${blockedFloorTiles}`);
  console.log(`  Walkable floor tiles: ${floorTiles - blockedFloorTiles}`);
}

main();
