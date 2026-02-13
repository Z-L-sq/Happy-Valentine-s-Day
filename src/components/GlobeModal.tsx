'use client';
/**
 * 🌍 像素风地球仪模态框
 * - Canvas 2D 纯手绘像素地球，无第三方 3D 库
 * - 自动旋转 + 鼠标拖拽旋转
 * - 标记点闪烁 + 悬停弹出标签
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/game/store';
import { globeMarkers } from '@/config';

/* ───── 像素世界地图 (72×36 等距柱状投影, 每格5°) ───── *
 * 1 = 陆地, 0 = 海洋
 * 行: 纬度 90°N → 90°S  列: 经度 180°W → 180°E        */
const MAP_W = 72;
const MAP_H = 36;
const WORLD: string[] = [
  '000000000000000000000000000000000000000000000000000000000000000000000000', // 90N
  '000000000000000000000000000000000000000000000000000000000000000000000000',
  '000000000000000000001111111110000000000000001111111111111111111100000000', // 80N
  '000000000000000000011111111111000000000000111111111111111111111110000000',
  '000000000000001100111111111111100000000011111111111111111111111111100000', // 70N
  '000000000000011111111111111111100000001111111111111111111111111111100000',
  '000000000001111111111111111111100000011111111111111111111111111111000000', // 60N
  '000000000011111111111111111111000000011111111111111111111111111110000000',
  '000000000111111111111111111110000000001111111111111111111111111100000000', // 50N
  '000000001111111111111111111100000000000011111111111111111111111100000000',
  '000000001111111111111111111000000000000001111111011111111111111000000000', // 40N
  '000000001111111111111111110000000000000001111100001111111111111000000000',
  '000000000111111111111111100000000000000001111000001111111111110000000000', // 30N
  '000000000011111111111111000000000000000011110000011111111111100000000000',
  '000000000001111111111110000000000000000111100000111111111111000000000000', // 20N
  '000000000000111111111110000000000000001111000001111111111110000000000000',
  '000000000000011111111100000000000000001110000011111111111100000000000000', // 10N
  '000000000000001111111100000000000000001100000011111111111000000000000000',
  '000000000000000111110000000000000000001100000111111111110000000000000000', // EQ
  '000000000000000011110000000000000000000100001111111111100000000000000000',
  '000000000000000011100000000000000000000000011111111110000000000000000000', // 10S
  '000000000000000111000000000000000000000000011111111100000000000000000000',
  '000000000000001110000000000000000000000000001111111000000000000000000000', // 20S
  '000000000000011100000000000000000000000000000111110000000000000000001100',
  '000000000000111000000000000000000000000000000011100000000000000000011110', // 30S
  '000000000001110000000000000000000000000000000001000000000000000000111110',
  '000000000001100000000000000000000000000000000000000000000000000001111100', // 40S
  '000000000001000000000000000000000000000000000000000000000000000011111000',
  '000000000000000000000000000000000000000000000000000000000000000111110000', // 50S
  '000000000000000000000000000000000000000000000000000000000000001111100000',
  '000000000000000000000000000000000000000000000000000000000000011111000000', // 60S
  '000000000000000000000000000000000000000000000000000000000000000000000000',
  '000000000000000000000000000000000000000000000000000000000000000000000000', // 70S
  '000000000000000000000000000000000000000000000000000000000000000000000000',
  '000000000000000000000000000000000000000000000000000000000000000000000000', // 80S
  '000000000000000000000000000000000000000000000000000000000000000000000000', // 90S
];

function getLand(latDeg: number, lonDeg: number): boolean {
  const row = Math.floor(((90 - latDeg) / 180) * MAP_H);
  let col = Math.floor(((lonDeg + 180) / 360) * MAP_W);
  if (col < 0) col += MAP_W;
  if (col >= MAP_W) col -= MAP_W;
  if (row < 0 || row >= MAP_H) return false;
  return WORLD[row]?.[col] === '1';
}

/* ───── 颜色配置 (像素风) ───── */
const COLOR_OCEAN = '#2a4e8a';
const COLOR_OCEAN_DARK = '#1e3a6a';
const COLOR_LAND = '#5b9a3c';
const COLOR_LAND_DARK = '#3d7a2a';
const COLOR_OUTLINE = '#1a2e4a';
const COLOR_BG = 'rgba(0,0,0,0)';
const COLOR_MARKER = '#ff4455';
const COLOR_MARKER_GLOW = '#ffcc00';

const PIXEL = 4;        // 像素块大小
const GLOBE_R = 60;     // 地球半径(单位:像素块)
const CANVAS_PX = GLOBE_R * 2 + 10; // canvas 尺寸(像素块)
const REAL_SIZE = CANVAS_PX * PIXEL; // canvas 真实像素

/* ───── 经纬度 → 球面3D → 屏幕 ───── */
function latLonTo3D(latDeg: number, lonDeg: number, rotY: number) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180 + rotY;
  const x = Math.cos(lat) * Math.sin(lon);
  const y = -Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lon);
  return { x, y, z };
}

export default function GlobeModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const rotRef = useRef(4.6); // 初始旋转角度，正对中国
  const dragRef = useRef<{ active: boolean; lastX: number }>({ active: false, lastX: 0 });
  const autoRotateRef = useRef(true);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);

  // 打开动画
  useEffect(() => {
    const t = setTimeout(() => setIsOpen(true), 80);
    return () => clearTimeout(t);
  }, []);

  // 键盘
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  /* ───── 渲染循环 ───── */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameRef.current++;

    // 自动旋转
    if (autoRotateRef.current) {
      rotRef.current += 0.008;
    }
    const rotY = rotRef.current;

    ctx.clearRect(0, 0, REAL_SIZE, REAL_SIZE);
    const cx = CANVAS_PX / 2;
    const cy = CANVAS_PX / 2;

    /* 画地球 */
    for (let py = -GLOBE_R; py <= GLOBE_R; py++) {
      const rSlice = Math.sqrt(GLOBE_R * GLOBE_R - py * py);
      for (let px = -Math.floor(rSlice); px <= Math.floor(rSlice); px++) {
        // 屏幕像素 → 球面坐标
        const sx = px / GLOBE_R;
        const sy = py / GLOBE_R;
        const sz2 = 1 - sx * sx - sy * sy;
        if (sz2 < 0) continue;
        const sz = Math.sqrt(sz2);

        // 反向旋转得到经纬度
        const rx = sx * Math.cos(-rotY) + sz * Math.sin(-rotY);
        const rz = -sx * Math.sin(-rotY) + sz * Math.cos(-rotY);

        const lat = Math.asin(-sy) * (180 / Math.PI);
        const lon = Math.atan2(rx, rz) * (180 / Math.PI);

        const isLand = getLand(lat, lon);

        // 简单光照
        const light = Math.max(0, sz * 0.6 + 0.4);
        let r: number, g: number, b: number;
        if (isLand) {
          // 绿色陆地
          r = Math.floor(0x3d + (0x5b - 0x3d) * light);
          g = Math.floor(0x7a + (0x9a - 0x7a) * light);
          b = Math.floor(0x2a + (0x3c - 0x2a) * light);
        } else {
          // 蓝色海洋
          r = Math.floor(0x1e + (0x2a - 0x1e) * light);
          g = Math.floor(0x3a + (0x4e - 0x3a) * light);
          b = Math.floor(0x6a + (0x8a - 0x6a) * light);
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect((cx + px) * PIXEL, (cy + py) * PIXEL, PIXEL, PIXEL);
      }
    }

    /* 球体边缘轮廓 */
    ctx.strokeStyle = COLOR_OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx * PIXEL + PIXEL / 2, cy * PIXEL + PIXEL / 2, GLOBE_R * PIXEL, 0, Math.PI * 2);
    ctx.stroke();

    /* 画标记点 */
    const markerScreenPos: { sx: number; sy: number; idx: number }[] = [];
    globeMarkers.forEach((marker, idx) => {
      const p = latLonTo3D(marker.lat, marker.lon, rotY);
      if (p.z < 0.05) return; // 背面不画

      const screenX = (cx + p.x * GLOBE_R) * PIXEL;
      const screenY = (cy + p.y * GLOBE_R) * PIXEL;

      markerScreenPos.push({ sx: screenX, sy: screenY, idx });

      // 闪烁动画
      const blink = Math.sin(frameRef.current * 0.1 + idx) * 0.5 + 0.5;
      const markerSize = PIXEL * 2;

      // 发光圈
      ctx.save();
      ctx.globalAlpha = 0.3 + blink * 0.4;
      ctx.fillStyle = COLOR_MARKER_GLOW;
      ctx.beginPath();
      ctx.arc(screenX, screenY, markerSize * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 标记点
      ctx.fillStyle = COLOR_MARKER;
      ctx.fillRect(screenX - markerSize / 2, screenY - markerSize / 2, markerSize, markerSize);

      // 高亮边框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX - markerSize / 2, screenY - markerSize / 2, markerSize, markerSize);

      // 标签
      const labelAlpha = hoveredMarker === idx ? 1 : (p.z > 0.5 ? 0.9 : 0.5);
      ctx.save();
      ctx.globalAlpha = labelAlpha;
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.textAlign = 'center';

      const label = marker.label;
      const labelY = screenY - markerSize * 3;
      const metrics = ctx.measureText(label);
      const lw = metrics.width + 12;
      const lh = 20;

      // 标签背景
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(screenX - lw / 2, labelY - lh / 2, lw, lh);
      ctx.strokeStyle = COLOR_MARKER_GLOW;
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX - lw / 2, labelY - lh / 2, lw, lh);

      // 标签文字
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, screenX, labelY + 5);
      ctx.restore();
    });

    animRef.current = requestAnimationFrame(render);
  }, [hoveredMarker]);

  /* ───── 启停渲染循环 ───── */
  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  /* ───── 鼠标/触摸拖拽 ───── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { active: true, lastX: e.clientX };
    autoRotateRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    rotRef.current += dx * 0.01;
    dragRef.current.lastX = e.clientX;
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false;
    // 松手3秒后恢复自动旋转
    setTimeout(() => { autoRotateRef.current = true; }, 3000);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className={`relative transition-all duration-500 ease-out flex flex-col items-center
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-6'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="mb-4 text-center">
          <h2 className="font-pixel text-[#FFD700] text-lg drop-shadow-lg">🌍 我们的足迹</h2>
        </div>

        {/* 地球仪 — 像素风容器 */}
        <div
          className="relative bg-[#0a0a1a] border-4 border-[#3a3a5a] rounded-lg p-3"
          style={{
            boxShadow: '0 0 40px rgba(42, 78, 138, 0.4), inset 0 0 20px rgba(0,0,0,0.5)',
            imageRendering: 'pixelated',
          }}
        >
          {/* 像素风木底座 */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-gradient-to-b from-[#8B6914] to-[#6B4F12] border-2 border-[#5a4010] rounded-b-md" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-gradient-to-b from-[#A0782C] to-[#8B6914] border-x-2 border-[#5a4010]" />

          <canvas
            ref={canvasRef}
            width={REAL_SIZE}
            height={REAL_SIZE}
            className="cursor-grab active:cursor-grabbing"
            style={{
              width: REAL_SIZE / 1,
              height: REAL_SIZE / 1,
              imageRendering: 'pixelated',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />

          {/* 星空背景装饰 */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.3 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>

        {/* 标记点图例 */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {globeMarkers.map((m, i) => (
            <div key={i} className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded border border-[#3a3a5a]">
              <div className="w-3 h-3 bg-[#ff4455] border border-white" />
              <span className="font-pixel text-white text-xs">{m.label}</span>
              {m.note && <span className="font-pixel text-[#FFD700] text-[10px]">— {m.note}</span>}
            </div>
          ))}
        </div>

        {/* 操作提示 */}
        <div className="mt-3 text-center">
          <span className="font-pixel text-white/50 text-[10px]">
            拖拽旋转地球　|　按 E / Esc 关闭
          </span>
        </div>
      </div>
    </div>
  );
}
