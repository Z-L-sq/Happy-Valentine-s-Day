'use client';
/**
 * 💌 信件模态框 — 展开信纸动画，显示手写体信（支持翻页）
 *
 * 在 src/config.ts 的 letterPages 中配置信的内容
 */
import React, { useEffect, useState } from 'react';
import { letterPages } from '@/config';
import { useGameStore } from '@/game/store';
import { assetPath } from '@/basePath';

export default function LetterModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const totalPages = letterPages.length;

  // 打开动画
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 键盘控制
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setPage((p) => Math.min(p + 1, totalPages - 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPage((p) => Math.max(p - 1, 0));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal, totalPages]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className={`relative max-w-[550px] w-[90vw] transition-all duration-700 ease-out origin-top
          ${isOpen
            ? 'opacity-100 scale-100 rotate-0'
            : 'opacity-0 scale-y-0 -rotate-3'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 信封（初始状态） */}
        <div
          className={`transition-all duration-500 ${isOpen ? 'opacity-0 scale-y-0 h-0' : 'opacity-100'
            }`}
        >
          <div className="bg-[#D4A574] border-4 border-[#8B6914] rounded-lg p-8 text-center shadow-xl">
            <span className="text-4xl">💌</span>
            <p className="font-pixel text-sdv-dark text-xs mt-2">
              点击打开信封...
            </p>
          </div>
        </div>

        {/* 信纸 */}
        <div
          className={`transition-all duration-700 delay-200 ${isOpen ? 'opacity-100' : 'opacity-0 scale-y-0'
            }`}
        >
          {/* 信纸背景 */}
          <div
            className="relative rounded-lg shadow-2xl overflow-hidden"
            style={{
              backgroundImage: `url('${assetPath('/sprites/letter.png')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* 左侧红线 */}
            <div className="absolute left-12 top-0 bottom-0 w-[2px] bg-red-300/40" />

            {/* 信纸装饰边框 */}
            <div className="border-4 border-[#D4A574] rounded-lg m-1">
              {/* 顶部装饰 */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="flex gap-1">
                  {['💕', '✨', '💕'].map((e, i) => (
                    <span key={i} className="text-lg animate-sparkle" style={{ animationDelay: `${i * 0.3}s` }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* 信件内容 */}
              <div className="px-8 pb-6 pl-16">
                <div className="font-letter text-[#4A3520] text-lg leading-[32px] whitespace-pre-line">
                  {letterPages[page]}
                </div>
              </div>

              {/* 翻页指示器 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pb-4">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page === 0}
                    className={`font-pixel text-xs px-2 py-1 rounded transition-colors
                      ${page === 0
                        ? 'text-[#D4A574]/40 cursor-not-allowed'
                        : 'text-[#4A3520] hover:bg-[#D4A574]/30 active:translate-y-[1px]'
                      }`}
                  >
                    ◀ 上一页
                  </button>
                  <span className="font-pixel text-xs text-[#4A3520]/60">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={page === totalPages - 1}
                    className={`font-pixel text-xs px-2 py-1 rounded transition-colors
                      ${page === totalPages - 1
                        ? 'text-[#D4A574]/40 cursor-not-allowed'
                        : 'text-[#4A3520] hover:bg-[#D4A574]/30 active:translate-y-[1px]'
                      }`}
                  >
                    下一页 ▶
                  </button>
                </div>
              )}

              {/* 底部装饰 */}
              <div className="flex justify-center pb-4">
                <div className="flex gap-2">
                  {['🌸', '💝', '🌸'].map((e, i) => (
                    <span key={i} className="text-sm">{e}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* 纸张折痕效果 */}
            <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-[#D4A574]/20" />
            <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-[#D4A574]/20" />
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={closeModal}
            className="mt-4 w-full font-pixel text-xs bg-sdv-dark text-sdv-cream py-2 rounded
                     hover:bg-sdv-brown transition-colors border-2 border-sdv-brown
                     active:translate-y-[1px]"
          >
            ✕ 合上信纸 (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
