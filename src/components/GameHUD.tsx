'use client';
/**
 * 🎵 背景音乐控制器 + 操作提示 HUD
 */
import React, { useRef, useEffect } from 'react';
import { bgmSource, gameTitle, gameSubtitle } from '@/config';
import { useGameStore } from '@/game/store';

export default function GameHUD() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMusicPlaying = useGameStore((s) => s.isMusicPlaying);
  const toggleMusic = useGameStore((s) => s.toggleMusic);
  const nearbyObject = useGameStore((s) => s.nearbyObject);

  // 播放/暂停音乐
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  return (
    <>
      {/* 背景音乐 */}
      <audio ref={audioRef} src={bgmSource} loop preload="auto" />

      {/* 顶部标题 */}
      <div className="text-center mb-4">
        <h1 className="font-pixel text-sdv-gold text-lg drop-shadow-lg">
          {gameTitle}
        </h1>
        <p className="font-pixel text-sdv-cream text-xs mt-1 opacity-70">
          {gameSubtitle}
        </p>
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between mt-3 max-w-[960px] w-full px-2">
        {/* 左：操作说明 */}
        <div className="font-pixel text-[10px] text-sdv-cream/70 space-y-0.5">
          <p>🎮 WASD / 方向键 — 移动</p>
          <p>🔑 E — 互动</p>
        </div>

        {/* 中：互动提示 */}
        <div className="font-pixel text-xs text-sdv-gold min-w-[200px] text-center">
          {nearbyObject && (
            <span className="animate-bounce-soft inline-block">
              ✨ 按 E 查看 ✨
            </span>
          )}
        </div>

        {/* 右：音乐按钮 */}
        <button
          onClick={toggleMusic}
          className="font-pixel text-xs bg-sdv-dark text-sdv-cream px-3 py-1.5 rounded
                   border-2 border-sdv-brown hover:bg-sdv-brown transition-colors
                   active:translate-y-[1px]"
        >
          {isMusicPlaying ? '🎵 音乐 ON' : '🔇 音乐 OFF'}
        </button>
      </div>
    </>
  );
}
