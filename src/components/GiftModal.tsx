'use client';
/**
 * 🎁 礼物模态框 — 拆礼物动画 + 逐字显示消息
 */
import React, { useEffect, useState, useCallback } from 'react';
import { giftMessage } from '@/config';
import { useGameStore } from '@/game/store';

export default function GiftModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const [stage, setStage] = useState<'wrapped' | 'opening' | 'opened'>('wrapped');
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const lines = giftMessage;
  const currentText = lines[currentLine] ?? '';
  const isLastLine = currentLine >= lines.length - 1;

  // Opening animation
  useEffect(() => {
    if (stage === 'wrapped') {
      const t = setTimeout(() => setStage('opening'), 600);
      return () => clearTimeout(t);
    }
    if (stage === 'opening') {
      const t = setTimeout(() => {
        setStage('opened');
        setIsTyping(true);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // Typing effect
  useEffect(() => {
    if (!isTyping || stage !== 'opened') return;
    if (displayedChars >= currentText.length) {
      setIsTyping(false);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayedChars((c) => c + 1);
    }, 35);
    return () => clearTimeout(timer);
  }, [displayedChars, currentText, isTyping, stage]);

  const advance = useCallback(() => {
    if (stage !== 'opened') return;
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
  }, [stage, isTyping, currentText.length, isLastLine, closeModal]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') advance();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal, advance]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
         onClick={() => stage === 'opened' ? advance() : undefined}>
      <div className="relative max-w-[480px] w-[88vw]" onClick={(e) => e.stopPropagation()}>

        {/* 未开封礼物 */}
        {stage === 'wrapped' && (
          <div className="flex flex-col items-center gap-4 animate-bounce">
            <div className="text-8xl">🎁</div>
            <p className="font-pixel text-white text-xs animate-pulse">发现了一个礼物……</p>
          </div>
        )}

        {/* 拆开动画 */}
        {stage === 'opening' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-8xl animate-spin" style={{ animationDuration: '0.5s' }}>🎁</div>
            <div className="flex gap-2">
              {['✨', '🎀', '✨', '🎀', '✨'].map((e, i) => (
                <span key={i} className="text-2xl animate-ping" style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s',
                }}>{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* 打开后的内容 */}
        {stage === 'opened' && (
          <div className="cursor-pointer" onClick={advance}>
            {/* 礼物盒已打开 */}
            <div className="text-center mb-4">
              <div className="flex justify-center gap-2 text-3xl mb-2">
                <span>🎀</span><span>✨</span><span>🎀</span>
              </div>
            </div>

            {/* 卡片内容 */}
            <div className="bg-gradient-to-b from-[#fff5f5] to-[#ffe8ec] rounded-xl p-1 shadow-2xl border-2 border-pink-300"
                 style={{ boxShadow: '0 0 30px rgba(255,182,193,0.3)' }}>
              <div className="bg-white/80 rounded-lg p-5 min-h-[100px]">
                <p className="font-pixel text-[#8b4557] text-sm leading-relaxed min-h-[2.5em]">
                  {currentText.slice(0, displayedChars)}
                  {isTyping && (
                    <span className="inline-block w-2 h-3.5 bg-pink-400 ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>

              <div className="flex justify-between items-center px-4 py-2">
                <span className="font-pixel text-[9px] text-pink-400">
                  {currentLine + 1} / {lines.length}
                </span>
                {!isTyping && (
                  <span className="font-pixel text-[9px] text-pink-400 animate-bounce">
                    {isLastLine ? '按 E 关闭' : '按 E 继续 ▸'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
