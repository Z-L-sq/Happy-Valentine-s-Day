/**
 * Foreground Layer Composite Script
 *
 * Generates:
 *   foreground.png — furniture/decoration tiles (Y-sort with player)
 *   frame.png      — room frame tiles (always on top of player)
 *
 * Usage: node composite_fg.js
 * Output: public/sprites/foreground.png, public/sprites/frame.png
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const TMX_PATH = path.join(__dirname, 'final.tmx');
const SPRITES_DIR = path.join(__dirname, 'public', 'sprites');
const FG_OUTPUT_PATH = path.join(SPRITES_DIR, 'foreground.png');
const FRAME_OUTPUT_PATH = path.join(SPRITES_DIR, 'frame.png');

const MAP_W = 36;
const MAP_H = 23;
const TILE_W = 16;
const TILE_H = 16;

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

// Layers for foreground (Y-sort with player)
const FOREGROUND_LAYERS = [
  '不可互动',    // furniture obstacles
  '可互动',      // interactable objects
  '图块层 4',    // decorations on furniture (lamps, items)
  '图块层 5',    // more furniture details
  '图块层 6',    // wall decor + blue sofa
  '图块层 7',    // staircase / wall objects
  '图块层 8',    // candles, fireplace details
  '图块层 9',    // additional decorations
  '图块层 10',   // sparse top layer
];

// Layers always drawn on top of player (房间框架)
const FRAME_LAYERS = [
  'fram',
];



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
  const FLIPPED_H = 0x80000000;
  const FLIPPED_V = 0x40000000;
  const FLIPPED_D = 0x20000000;
  const rawGid = gid;
  const cleanGid = gid & ~(FLIPPED_H | FLIPPED_V | FLIPPED_D);
  if (cleanGid === 0) return null;
  const flipH = (rawGid & FLIPPED_H) !== 0;
  const flipV = (rawGid & FLIPPED_V) !== 0;
  const flipD = (rawGid & FLIPPED_D) !== 0;
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
  if (srcX < 0 || srcY < 0 || srcX + TILE_W > srcPng.width || srcY + TILE_H > srcPng.height) return;
  for (let py = 0; py < TILE_H; py++) {
    for (let px = 0; px < TILE_W; px++) {
      let sx = px, sy = py;
      if (flipD) [sx, sy] = [sy, sx];
      if (flipH) sx = TILE_W - 1 - sx;
      if (flipV) sy = TILE_H - 1 - sy;
      const srcIdx = ((srcY + sy) * srcPng.width + (srcX + sx)) * 4;
      const dstIdx = ((dstY + py) * dstPng.width + (dstX + px)) * 4;
      const a = srcPng.data[srcIdx + 3];
      if (a === 0) continue;
      if (a === 255) {
        dstPng.data[dstIdx]     = srcPng.data[srcIdx];
        dstPng.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
        dstPng.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
        dstPng.data[dstIdx + 3] = 255;
      } else {
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

function parseTMX(tmxPath) {
  const xml = fs.readFileSync(tmxPath, 'utf-8');
  const layers = [];
  const layerRegex = /<layer[^>]*name="([^"]*)"[^>]*>[\s\S]*?<data[^>]*>([\s\S]*?)<\/data>[\s\S]*?<\/layer>/g;
  let match;
  while ((match = layerRegex.exec(xml)) !== null) {
    const name = match[1];
    const csvData = match[2].trim();
    const tiles = csvData.split(/[,\s]+/).map(Number);
    layers.push({ name, tiles });
  }
  return layers;
}

function main() {
  console.log('🎭 Foreground + Frame Layer Composite');
  console.log('======================================');

  const layers = parseTMX(TMX_PATH);
  console.log(`Found ${layers.length} layers`);

  // Load tilesets
  const tilesetImages = {};
  for (const ts of TILESETS) {
    const filePath = path.join(SPRITES_DIR, ts.file);
    const img = loadPNG(filePath);
    if (img) tilesetImages[ts.name] = img;
  }

  const outW = MAP_W * TILE_W;
  const outH = MAP_H * TILE_H;

  function createTransparentPNG() {
    const png = new PNG({ width: outW, height: outH });
    for (let i = 0; i < outW * outH * 4; i += 4) {
      png.data[i] = 0; png.data[i+1] = 0; png.data[i+2] = 0; png.data[i+3] = 0;
    }
    return png;
  }

  function renderLayers(layerNames, label) {
    const output = createTransparentPNG();
    let totalRendered = 0;
    for (const layer of layers) {
      if (!layerNames.includes(layer.name)) continue;
      let rendered = 0;
      for (let i = 0; i < layer.tiles.length; i++) {
        const gid = layer.tiles[i];
        if (gid === 0) continue;
        const col = i % MAP_W;
        const row = Math.floor(i / MAP_W);
        const info = findTileset(gid);
        if (!info) continue;
        const srcImg = tilesetImages[info.tileset.name];
        if (!srcImg) continue;
        copyTile(output, col * TILE_W, row * TILE_H, srcImg, info.srcX, info.srcY, info.flipH, info.flipV, info.flipD);
        rendered++;
      }
      console.log(`  ${layer.name}: ${rendered} ${label} tiles`);
      totalRendered += rendered;
    }
    return { output, totalRendered };
  }

  // 1. Foreground (Y-sort)
  console.log('\n📦 Foreground layers (Y-sort):');
  const fg = renderLayers(FOREGROUND_LAYERS, 'foreground');
  console.log(`  Total: ${fg.totalRendered} tiles`);
  const fgBuf = PNG.sync.write(fg.output);
  fs.writeFileSync(FG_OUTPUT_PATH, fgBuf);
  console.log(`  ✅ Saved: foreground.png (${fgBuf.length} bytes)`);

  // 2. Frame overlay (always on top)
  console.log('\n🖼️ Frame layers (always on top):');
  const fr = renderLayers(FRAME_LAYERS, 'frame');
  console.log(`  Total: ${fr.totalRendered} tiles`);
  const frBuf = PNG.sync.write(fr.output);
  fs.writeFileSync(FRAME_OUTPUT_PATH, frBuf);
  console.log(`  ✅ Saved: frame.png (${frBuf.length} bytes)`);
}

main();
