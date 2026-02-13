/**
 * 碰撞检测 & 互动检测
 *
 * 使用逐格 WALKABLE_MAP 而非矩形区域 — 只有地板/地毯/砖地板可行走。
 */
import {
  TILE_SIZE,
  PLAYER_SIZE,
  INTERACTION_DISTANCE,
  INTERACTABLES,
  WALKABLE_MAP,
  MAP_COLS,
  MAP_ROWS,
  InteractableObject,
} from './constants';

// ==================== 辅助: 某像素位置的 tile 是否可行走 ====================
function isTileWalkable(px: number, py: number): boolean {
  const col = Math.floor(px / TILE_SIZE);
  const row = Math.floor(py / TILE_SIZE);
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
  return WALKABLE_MAP[row][col] === 1;
}

// ==================== 碰撞检测 ====================
export function checkCollision(px: number, py: number): boolean {
  // 使用玩家下半身作为碰撞体 (脚部区域)
  const padding = 4;
  const left = px + padding;
  const right = px + PLAYER_SIZE - padding;
  const top = py + PLAYER_SIZE / 2;        // 只检测下半身
  const bottom = py + PLAYER_SIZE + 4;

  // 检查脚部四个角 + 中心点是否都在可行走 tile 上
  const checkPoints = [
    { x: left,                y: top },      // 左上
    { x: right,               y: top },      // 右上
    { x: left,                y: bottom },   // 左下
    { x: right,               y: bottom },   // 右下
    { x: (left + right) / 2,  y: bottom },   // 底部中心
  ];

  for (const pt of checkPoints) {
    if (!isTileWalkable(pt.x, pt.y)) {
      return true; // 有一个点在不可走 tile 上 → 碰撞
    }
  }

  return false;
}

// ==================== 互动检测 ====================
// 触发区域直接来自 TMX 各互动图层，玩家中心落入区域即触发
export function findNearbyInteractable(
  px: number,
  py: number
): InteractableObject | null {
  const playerCX = px + PLAYER_SIZE / 2;
  const playerCY = py + PLAYER_SIZE / 2;

  let closest: InteractableObject | null = null;
  let closestDist = Infinity;

  for (const obj of INTERACTABLES) {
    const objLeft   = obj.x * TILE_SIZE;
    const objRight  = (obj.x + obj.width) * TILE_SIZE;
    const objTop    = obj.y * TILE_SIZE;
    const objBottom = (obj.y + obj.height) * TILE_SIZE;

    // 玩家中心到触发区域边缘的最近距离
    const nearX = Math.max(objLeft, Math.min(playerCX, objRight));
    const nearY = Math.max(objTop, Math.min(playerCY, objBottom));
    const dx = playerCX - nearX;
    const dy = playerCY - nearY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 玩家在触发区域内 (dist === 0) 或距离在阈值内
    if (dist < INTERACTION_DISTANCE && dist < closestDist) {
      closestDist = dist;
      closest = obj;
    }
  }

  return closest;
}
