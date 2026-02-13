/**
 * 🖼️ 精灵系统 — 使用 TMX 合成的 background.png + foreground.png
 *
 * background.png (576×368) — 完整场景 (所有层)
 * foreground.png (576×368) — 仅家具/障碍物层 (用于深度遮挡)
 *
 * 渲染顺序: background → 逐行 Y-sort (前景行 vs 玩家) → UI
 * 前景被切成每行一条, 与玩家按 Y 坐标排序, 实现正确的透视遮挡。
 */

import { assetPath } from '../basePath';

// ==================== 类型 ====================
export interface LoadedResources {
  background: HTMLCanvasElement | null;
  foreground: HTMLCanvasElement | null;
  /** 前景按 tile 行切片, index = tile row, 仅包含有内容的行 */
  foregroundRows: (HTMLCanvasElement | null)[];
  /** 房间框架覆盖层 (始终遮挡玩家) */
  frameOverlay: HTMLCanvasElement | null;
  /** 玩家精灵图 (3 cols × 4 rows) */
  playerSprite: HTMLImageElement | null;
  loaded: boolean;
}

export const SRC_TILE = 16;

// ==================== 图片加载器 ====================
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`⚠️ 无法加载: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}

// ==================== 预渲染 ====================
function preRenderLayer(
  image: HTMLImageElement | null,
  cols: number,
  rows: number,
  tileSize: number,
  fillColor?: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = cols * tileSize;
  canvas.height = rows * tileSize;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (image) {
    ctx.drawImage(
      image,
      0, 0, image.width, image.height,
      0, 0, canvas.width, canvas.height
    );
  }

  return canvas;
}

/**
 * 将前景 canvas 按 tile 行切成独立 canvas 条。
 * 只有包含非透明像素的行才创建 canvas, 其余为 null。
 */
function sliceForegroundRows(
  fgCanvas: HTMLCanvasElement,
  cols: number,
  rows: number,
  tileSize: number
): (HTMLCanvasElement | null)[] {
  const result: (HTMLCanvasElement | null)[] = new Array(rows).fill(null);
  const fullCtx = fgCanvas.getContext('2d')!;
  const totalW = cols * tileSize;

  for (let row = 0; row < rows; row++) {
    const y = row * tileSize;
    const imgData = fullCtx.getImageData(0, y, totalW, tileSize);
    // 检查这一行是否有非透明像素
    let hasContent = false;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] > 0) { hasContent = true; break; }
    }
    if (!hasContent) continue;

    const rowCanvas = document.createElement('canvas');
    rowCanvas.width = totalW;
    rowCanvas.height = tileSize;
    const rowCtx = rowCanvas.getContext('2d')!;
    rowCtx.imageSmoothingEnabled = false;
    rowCtx.putImageData(imgData, 0, 0);
    result[row] = rowCanvas;
  }

  const count = result.filter(Boolean).length;
  console.log(`✂️ 前景切片: ${count}/${rows} 行有内容`);
  return result;
}

// ==================== 主加载函数 ====================
export async function loadAllResources(
  cols: number,
  rows: number,
  tileSize: number
): Promise<LoadedResources> {
  const [bgImage, fgImage, frameImage, playerSprite] = await Promise.all([
    loadImage(assetPath('/sprites/background.png')),
    loadImage(assetPath('/sprites/foreground.png')),
    loadImage(assetPath('/sprites/frame.png')),
    loadImage(assetPath('/sprites/player.png')),
  ]);

  console.log(
    '🖼️ 资源加载:',
    bgImage ? `✅ background.png` : '❌ background.png',
    fgImage ? `✅ foreground.png` : '❌ foreground.png',
    frameImage ? `✅ frame.png` : '❌ frame.png',
    playerSprite ? `✅ player.png` : '❌ player.png',
  );

  const background = preRenderLayer(bgImage, cols, rows, tileSize, '#050303');
  const foreground = preRenderLayer(fgImage, cols, rows, tileSize);
  const frameOverlay = preRenderLayer(frameImage, cols, rows, tileSize);
  const foregroundRows = sliceForegroundRows(foreground, cols, rows, tileSize);

  return { background, foreground, foregroundRows, frameOverlay, playerSprite, loaded: true };
}
