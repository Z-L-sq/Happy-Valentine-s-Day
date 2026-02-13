'use client';
/**
 * 📚 书架对话框 — 像素风游戏对话框，逐字显示文字
 *
 * 在 src/config.ts 的 bookTexts 中按 id 配置每个书架的内容
 */
import React, { useEffect, useState, useCallback } from 'react';
import { bookTexts } from '@/config';
import { useGameStore } from '@/game/store';

export default function BookModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const objectId = useGameStore((s) => s.modalObjectId);
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const lines = (objectId && bookTexts[objectId]) || bookTexts.book1 || ['书架上摆满了书……'];
  const currentText = lines[currentLine] ?? '';
  const isLastLine = currentLine >= lines.length - 1;

  // 逐字显示效果
  useEffect(() => {
    if (!isTyping) return;
    if (displayedChars >= currentText.length) {
      setIsTyping(false);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayedChars((c) => c + 1);
    }, 40);
    return () => clearTimeout(timer);
  }, [displayedChars, currentText, isTyping]);

  const advanceText = useCallback(() => {
    if (isTyping) {
      setDisplayedChars(currentText.length);
      setIsTyping(false);
    } else if (!isLastLine) {
      setCurrentLine((l) => l + 1);
      setDisplayedChars(0);
      setIsTyping(true);
    } else {
      closeModal();
    }
  }, [isTyping, currentText.length, isLastLine, closeModal]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        advanceText();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal, advanceText]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 pointer-events-none">
      <div
        className="pointer-events-auto max-w-[640px] w-[90vw] cursor-pointer"
        onClick={advanceText}
      >
        <div className="relative bg-[#3a2a18] border-[3px] border-[#c8a96e] rounded-xl p-1 shadow-2xl"
             style={{ boxShadow: '0 0 20px rgba(200, 169, 110, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <div className="bg-gradient-to-b from-[#f5e6c8] to-[#efe0c0] rounded-lg p-5 min-h-[120px] flex flex-col justify-between">
            {/* 标题栏 */}
            <div className="flex items-center gap-2 mb-3 border-b border-[#d4b896] pb-2">
              <span className="text-lg">📚</span>
              <span className="font-pixel text-[#4a3520] text-xs font-bold">书架</span>
              <div className="ml-auto flex gap-1">
                {Array.from({ length: lines.length }).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i <= currentLine ? 'bg-[#8b6914]' : 'bg-[#d4b896]'
                  }`} />
                ))}
              </div>
            </div>

            {/* 文字内容 */}
            <p className="font-pixel text-[#4a3520] text-sm leading-relaxed min-h-[3em] flex-1">
              {currentText.slice(0, displayedChars)}
              {isTyping && (
                <span className="inline-block w-2 h-4 bg-[#8b6914] ml-0.5 animate-pulse" />
              )}
            </p>

            {/* 底部 */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#d4b896]">
              <span className="font-pixel text-[10px] text-[#8b6914]">
                {currentLine + 1} / {lines.length}
              </span>
              {!isTyping && (
                <span className="font-pixel text-[10px] text-[#8b6914] animate-bounce">
                  {isLastLine ? '按 E 关闭' : '按 E 继续 ▸'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
