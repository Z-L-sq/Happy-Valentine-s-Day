/**
 * 🎨 渲染引擎
 *
 * 背景使用 sprites.ts 的预渲染 Canvas (一帧绘制 936 个 tile)，
 * 之后每帧仅 drawImage 一次 + 角色 / 粒子 / 光照叠加。
 */
import {
  TILE_SIZE,
  PLAYER_SIZE,
  Direction,
  INTERACTABLES,
  MAP_COLS,
  MAP_ROWS,
} from './constants';

// ==================== 背景 ====================
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  bg: HTMLCanvasElement | null
) {
  if (bg) {
    ctx.drawImage(bg, 0, 0);
  } else {
    ctx.fillStyle = '#050303';
    ctx.fillRect(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);
  }
}

// ==================== 前景 (深度遮挡) ====================
export function renderForeground(
  ctx: CanvasRenderingContext2D,
  fg: HTMLCanvasElement | null
) {
  if (fg) {
    ctx.drawImage(fg, 0, 0);
  }
}

// ==================== Y-Sort 场景渲染 ====================
/**
 * 逐行 Y-sort 渲染: 将前景 tile 行与玩家按 Y 坐标交错绘制。
 *
 * 原理: 玩家的 "脚底 Y" (playerY + PLAYER_SIZE) 决定深度排序基准。
 * - 前景行的底边 Y <= 玩家脚底 → 先画前景行 (玩家在前景前面)
 * - 前景行的底边 Y > 玩家脚底  → 先画玩家 (前景遮挡玩家)
 *
 * 这样玩家向上走到桌子后面时被桌子遮挡，向下走到桌子前面时遮挡桌子。
 */
export function renderSceneYSorted(
  ctx: CanvasRenderingContext2D,
  foregroundRows: (HTMLCanvasElement | null)[],
  playerX: number,
  playerY: number,
  direction: Direction,
  animFrame: number,
  isMoving: boolean,
  playerSprite?: HTMLImageElement | null
) {
  // 玩家脚底 Y 作为深度基准
  const playerFootY = playerY + PLAYER_SIZE;
  let playerDrawn = false;

  for (let row = 0; row < foregroundRows.length; row++) {
    const rowCanvas = foregroundRows[row];
    // 这一行 tile 的底边 Y (像素)
    const rowBottomY = (row + 1) * TILE_SIZE;

    // 当到达第一个底边 > 玩家脚底的前景行时, 先画玩家
    if (!playerDrawn && rowBottomY > playerFootY) {
      renderPlayer(ctx, playerX, playerY, direction, animFrame, isMoving, playerSprite);
      playerDrawn = true;
    }

    // 画这一行前景 (如果有内容)
    if (rowCanvas) {
      ctx.drawImage(rowCanvas, 0, row * TILE_SIZE);
    }
  }

  // 如果玩家在所有前景行之下 (极端情况), 最后画
  if (!playerDrawn) {
    renderPlayer(ctx, playerX, playerY, direction, animFrame, isMoving, playerSprite);
  }
}

// ==================== 房间框架覆盖层 (始终遮挡玩家) ====================
export function renderFrameOverlay(
  ctx: CanvasRenderingContext2D,
  frameOverlay: HTMLCanvasElement | null
) {
  if (frameOverlay) {
    ctx.drawImage(frameOverlay, 0, 0);
  }
}

// ==================== 可互动物体高亮 ====================
export function renderInteractableHighlights(
  ctx: CanvasRenderingContext2D,
  nearbyId: string | null,
  time: number
) {
  if (!nearbyId) return;

  const obj = INTERACTABLES.find((o) => o.id === nearbyId);
  if (!obj) return;

  const px = obj.x * TILE_SIZE;
  const py = obj.y * TILE_SIZE;
  const w = obj.width * TILE_SIZE;
  const h = obj.height * TILE_SIZE;

  const glow = Math.sin(time * 0.005) * 0.3 + 0.5;

  ctx.save();
  ctx.strokeStyle = `rgba(255, 215, 0, ${glow})`;
  ctx.lineWidth = 3;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 12 * glow;
  ctx.strokeRect(px + 1, py + 1, w - 2, h - 2);
  ctx.restore();
}

// ==================== 玩家精灵参数 ====================
/**
 * 精灵图布局: 3 列 × 4 行, 每帧 407×661 像素
 * 行顺序: down=0, left=1, right=2, up=3
 * 列顺序: frame1(站立), frame2(左脚), frame3(右脚)
 * 行走动画序列: 1→2→1→3 (站立→左脚→站立→右脚)
 */
const SPRITE_FRAME_W = 429;
const SPRITE_FRAME_H = 583;
/** 方向 → 精灵行映射: Down=0, Left=1, Right=2, Up=3 */
const DIR_TO_SPRITE_ROW: Record<Direction, number> = {
  [Direction.DOWN]:  0,
  [Direction.LEFT]:  1,
  [Direction.RIGHT]: 2,
  [Direction.UP]:    3,
};
/** 行走动画帧序列: 列索引 0=站立, 1=左脚, 2=右脚 → 播放 0,1,0,2 */
const WALK_ANIM_SEQUENCE = [0, 1, 0, 2];
/** 在游戏中的显示尺寸 (适配 PLAYER_SIZE=28 的碰撞盒) */
const DRAW_W = 38;
const DRAW_H = Math.round(DRAW_W * (SPRITE_FRAME_H / SPRITE_FRAME_W)); // ≈62

// ==================== 玩家渲染 ====================
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: Direction,
  animFrame: number,
  isMoving: boolean,
  playerSprite?: HTMLImageElement | null
) {
  if (!playerSprite) {
    ctx.fillStyle = '#FF8FAB';
    ctx.beginPath();
    ctx.arc(x + PLAYER_SIZE / 2, y + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.save();

  // 选择精灵帧: 站立=col 0, 行走=按序列 0→1→0→2
  const spriteRow = DIR_TO_SPRITE_ROW[direction];
  const col = isMoving ? WALK_ANIM_SEQUENCE[animFrame % WALK_ANIM_SEQUENCE.length] : 0;
  const srcX = col * SPRITE_FRAME_W;
  const srcY = spriteRow * SPRITE_FRAME_H;

  // 绘制位置: 以碰撞盒为基准居中, 精灵垂直居中对齐 (减小跳动)
  const drawX = x + PLAYER_SIZE / 2 - DRAW_W / 2;
  const drawY = y + PLAYER_SIZE / 2 - DRAW_H / 2;

  ctx.drawImage(
    playerSprite,
    srcX, srcY, SPRITE_FRAME_W, SPRITE_FRAME_H,
    drawX, drawY, DRAW_W, DRAW_H
  );

  ctx.restore();
}

// ==================== 互动提示气泡 ====================
export function renderPromptBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  time: number
) {
  const bubbleY = y - 24 + Math.sin(time * 0.004) * 3;
  const text = `按 E — ${label}`;

  ctx.save();
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  const metrics = ctx.measureText(text);
  const padding = 10;
  const w = metrics.width + padding * 2;
  const h = 24;

  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  roundRect(ctx, x - w / 2, bubbleY - h / 2, w, h, 8);
  ctx.fill();

  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  roundRect(ctx, x - w / 2, bubbleY - h / 2, w, h, 8);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,215,0,0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, x - w / 2 + 2, bubbleY - h / 2 + 2, w - 4, h - 4, 6);
  ctx.stroke();

  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.beginPath();
  ctx.moveTo(x - 6, bubbleY + h / 2);
  ctx.lineTo(x, bubbleY + h / 2 + 7);
  ctx.lineTo(x + 6, bubbleY + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 6, bubbleY + h / 2);
  ctx.lineTo(x, bubbleY + h / 2 + 7);
  ctx.lineTo(x + 6, bubbleY + h / 2);
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 1, bubbleY + 1);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text, x, bubbleY);
  ctx.fillStyle = '#FFD700';
  ctx.fillText('E', x - metrics.width / 2 + 16, bubbleY);

  ctx.restore();
}

// ==================== 光照 / 氛围 ====================
export function renderAmbientLight(ctx: CanvasRenderingContext2D, _time: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  // 暖色调叠加
  ctx.fillStyle = 'rgba(255, 240, 200, 0.03)';
  ctx.fillRect(0, 0, w, h);

  // Vignette
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ==================== 辅助 ====================
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
