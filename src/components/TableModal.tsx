'use client';
/**
 * 💄 梳妆台模态框 — 简短文字提示
 */
import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/game/store';
import { tableMessage } from '@/config';

export default function TableModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsOpen(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className={`relative max-w-[400px] w-[85vw] transition-all duration-500 ease-out
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-6'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 像素风边框 */}
        <div
          className="bg-gradient-to-b from-[#5C3317] to-[#3E2210] border-4 border-[#8B6914] rounded-lg p-6"
          style={{
            boxShadow:
              '0 0 20px rgba(139,105,20,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="text-center mb-4">
            <span className="text-4xl">💄</span>
          </div>

          <p className="font-pixel text-white text-sm text-center leading-relaxed">
            {tableMessage}
          </p>

          <div className="mt-5 text-center">
            <span className="font-pixel text-white/40 text-[10px]">
              按 E / Esc 关闭
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
