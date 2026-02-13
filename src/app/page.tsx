'use client';
/**
 * 🏠 主页面 — 组合所有游戏组件
 */
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import InteractionModal from '@/components/InteractionModal';
import GameHUD from '@/components/GameHUD';

// 动态导入 GameCanvas（避免 SSR 中使用 Canvas）
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[960px] h-[704px] bg-sdv-dark border-4 border-sdv-brown rounded-lg">
      <div className="text-center">
        <p className="font-pixel text-sdv-gold text-sm animate-sparkle">
          加载中...
        </p>
        <p className="font-pixel text-sdv-cream text-xs mt-2 opacity-70">
          正在布置小屋 🏠
        </p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [stars, setStars] = useState<{ x: number; y: number; delay: number; duration: number }[]>([]);

  // 生成星星背景
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
    }));
    setStars(newStars);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#1a1a2e] p-4">
      {/* 星星背景 */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            '--delay': `${star.delay}s`,
            '--duration': `${star.duration}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* 开场画面 */}
      {showIntro && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1a2e] cursor-pointer"
          onClick={() => setShowIntro(false)}
        >
          <div className="text-center animate-fade-in">
            <div className="mb-6">
              <span className="text-6xl">🏠</span>
            </div>
            <h1 className="font-pixel text-sdv-gold text-xl mb-4 drop-shadow-lg">
              💕 我们的小屋 💕
            </h1>
            <p className="font-pixel text-sdv-cream text-xs mb-2 opacity-80">
              — 情人节快乐 —
            </p>
            <div className="mt-8">
              <p className="font-pixel text-sdv-gold text-xs animate-bounce-soft">
                ✨ 点击任意位置开始 ✨
              </p>
            </div>
            <div className="mt-12 font-pixel text-[10px] text-sdv-cream/40 space-y-1">
              <p>🎮 WASD / 方向键 移动角色</p>
              <p>🔑 靠近物体按 E 互动</p>
              <p>📸 探索房间，发现惊喜</p>
            </div>
          </div>
        </div>
      )}

      {/* 游戏 HUD (标题 + 控制) */}
      <GameHUD />

      {/* 游戏画布 */}
      <GameCanvas />

      {/* 模态框层 */}
      <InteractionModal />
    </main>
  );
}
