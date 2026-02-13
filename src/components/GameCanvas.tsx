'use client';
/**
 * 🎮 GameCanvas — 核心游戏画布
 *
 * 1. 加载背景图 → 预渲染背景
 * 2. Canvas 游戏循环 (requestAnimationFrame)
 * 3. WASD / 方向键移动 + 逐格碰撞检测
 * 4. E 键互动
 * 5. 氛围光照
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  MAP_COLS,
  MAP_ROWS,
  TILE_SIZE,
  PLAYER_SIZE,
  PLAYER_SPEED,
  Direction,
  INTERACTABLES,
} from '@/game/constants';
import { useGameStore } from '@/game/store';
import { checkCollision, findNearbyInteractable } from '@/game/collision';
import {
  renderBackground,
  renderInteractableHighlights,
  renderSceneYSorted,
  renderFrameOverlay,
  renderPromptBubble,
  renderAmbientLight,
} from '@/game/renderer';
import { loadAllResources, LoadedResources } from '@/game/sprites';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const animTimerRef = useRef(0);
  const resRef = useRef<LoadedResources>({
    background: null, foreground: null, foregroundRows: [], frameOverlay: null, playerSprite: null, loaded: false,
  });
  const [loading, setLoading] = useState(true);

  const store = useGameStore;

  // ==================== 加载资源 ====================
  useEffect(() => {
    loadAllResources(MAP_COLS, MAP_ROWS, TILE_SIZE).then((res) => {
      resRef.current = res;
      setLoading(false);
      console.log('✅ 所有资源加载完毕, 背景已预渲染');
    });
  }, []);

  // ==================== 键盘监听 ====================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);

      if (key === 'e' && !store.getState().activeModal) {
        const nearby = findNearbyInteractable(
          store.getState().playerX,
          store.getState().playerY
        );
        if (nearby) {
          store.getState().openModal(nearby.type, nearby.id);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [store]);

  // ==================== 游戏主循环 ====================
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = store.getState();
    const now = performance.now();

    // ---- 更新逻辑 ----
    if (!state.activeModal) {
      let dx = 0;
      let dy = 0;
      const keys = keysRef.current;

      if (keys.has('w') || keys.has('arrowup'))    { dy = -PLAYER_SPEED; store.getState().setDirection(Direction.UP); }
      if (keys.has('s') || keys.has('arrowdown'))   { dy = PLAYER_SPEED; store.getState().setDirection(Direction.DOWN); }
      if (keys.has('a') || keys.has('arrowleft'))   { dx = -PLAYER_SPEED; store.getState().setDirection(Direction.LEFT); }
      if (keys.has('d') || keys.has('arrowright'))   { dx = PLAYER_SPEED; store.getState().setDirection(Direction.RIGHT); }

      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

      const moving = dx !== 0 || dy !== 0;
      store.getState().setIsMoving(moving);

      if (moving) {
        const newX = state.playerX + dx;
        const newY = state.playerY + dy;
        let finalX = state.playerX;
        let finalY = state.playerY;

        if (!checkCollision(newX, state.playerY)) finalX = newX;
        if (!checkCollision(finalX, newY)) finalY = newY;

        store.getState().movePlayer(finalX, finalY);

        animTimerRef.current++;
        if (animTimerRef.current % 8 === 0) {
          store.getState().nextAnimFrame();
        }
      }

      const nearby = findNearbyInteractable(
        store.getState().playerX,
        store.getState().playerY
      );
      store.getState().setNearbyObject(nearby?.id ?? null);
    }

    // ---- 渲染 ----
    const s = store.getState();
    const res = resRef.current;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.imageSmoothingEnabled = false;

    // 1. 预渲染背景 (一次 drawImage)
    renderBackground(ctx, res.background);

    // 2. 可互动物体高亮
    renderInteractableHighlights(ctx, s.nearbyObject, now);

    // 3. Y-Sort 场景: 前景行与玩家按 Y 坐标交错绘制 (解决透视穿模)
    renderSceneYSorted(
      ctx,
      res.foregroundRows,
      s.playerX, s.playerY,
      s.direction, s.animFrame, s.isMoving,
      res.playerSprite
    );

    // 3.5 房间框架覆盖层 (始终遮挡玩家)
    renderFrameOverlay(ctx, res.frameOverlay);

    // 4. 互动提示
    if (s.nearbyObject && !s.activeModal) {
      const obj = INTERACTABLES.find((o) => o.id === s.nearbyObject);
      if (obj) {
        renderPromptBubble(ctx, s.playerX + PLAYER_SIZE / 2, s.playerY - 10, obj.label, now);
      }
    }

    // 5. 氛围光
    renderAmbientLight(ctx, now);

    requestAnimationFrame(gameLoop);
  }, [store]);

  useEffect(() => {
    const frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [gameLoop]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block border-4 border-sdv-dark rounded-lg shadow-2xl"
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-sdv-dark/80 rounded-lg">
          <div className="text-center">
            <p className="font-pixel text-sdv-gold text-sm animate-sparkle">
              🖼️ 加载精灵图...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
