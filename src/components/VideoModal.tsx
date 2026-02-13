'use client';
/**
 * 📺 视频模态框 — 播放视频
 *
 * 视频放在 /public/videos/ 文件夹中
 */
import React, { useEffect, useRef } from 'react';
import { videoSource, videoTitle } from '@/config';
import { useGameStore } from '@/game/store';

export default function VideoModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="relative max-w-[720px] w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 电视外壳 */}
        <div className="bg-gradient-to-b from-[#3a3a3a] to-[#2a2a2a] rounded-2xl p-4 shadow-2xl border border-gray-700"
             style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          {/* 品牌标 */}
          <div className="text-center mb-2">
            <span className="font-pixel text-[10px] text-gray-400">
              {videoTitle}
            </span>
          </div>

          {/* 屏幕 */}
          <div className="bg-black rounded-lg overflow-hidden border-2 border-gray-600 aspect-video relative">
            <video
              ref={videoRef}
              src={videoSource}
              controls
              playsInline
              className="w-full h-full object-contain"
            >
              <source src={videoSource} type="video/mp4" />
            </video>

            {/* 屏幕反光效果 */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />
          </div>

          {/* 底部指示灯 */}
          <div className="flex items-center justify-center mt-3 gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            <div className="w-8 h-0.5 bg-gray-600 rounded" />
          </div>
        </div>

        {/* 电视底座 */}
        <div className="mx-auto w-24 h-2 bg-[#2a2a2a] rounded-b-lg" />
        <div className="mx-auto w-36 h-1.5 bg-[#333] rounded-b" />

        {/* 关闭按钮 */}
        <button
          onClick={closeModal}
          className="mt-4 w-full font-pixel text-xs bg-gray-800 text-gray-200 py-2.5 rounded-lg
                   hover:bg-gray-700 transition-colors border border-gray-600
                   active:translate-y-[1px]"
        >
          ✕ 关闭 (Esc)
        </button>
      </div>
    </div>
  );
}
