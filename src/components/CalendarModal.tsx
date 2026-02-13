'use client';
/**
 * 📅 日历模态框 — 翻页日历效果，显示纪念日信息
 */
import React, { useEffect, useState } from 'react';
import { calendarDate, calendarMessage } from '@/config';
import { useGameStore } from '@/game/store';

export default function CalendarModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  // Parse date for display
  const today = new Date();
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                       '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const month = monthNames[today.getMonth()];
  const day = today.getDate();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = weekDays[today.getDay()];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="relative max-w-[360px] w-[85vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 日历主体 */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200"
             style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          {/* 日历顶部装饰环 */}
          <div className="flex justify-center gap-16 -mt-2 relative z-10">
            <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500 shadow-inner" />
            <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-gray-500 shadow-inner" />
          </div>

          {/* 月份头 */}
          <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-center py-3 -mt-3">
            <p className="font-pixel text-lg tracking-wider">{month}</p>
            <p className="font-pixel text-[10px] opacity-80">星期{weekDay}</p>
          </div>

          {/* 日期 */}
          <div className={`text-center py-6 transition-all duration-500 ${
            flipped ? 'opacity-100 scale-100' : 'opacity-0 scale-y-0'
          }`}>
            <p className="text-7xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
              {day}
            </p>
          </div>

          {/* 纪念日标记 */}
          <div className={`text-center px-6 pb-4 transition-all duration-700 delay-200 ${
            flipped ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg p-4 border border-pink-200">
              <p className="font-pixel text-xs text-red-400 mb-2">
                ❤️ {calendarDate}
              </p>
              <p className="font-pixel text-[11px] text-gray-600 leading-relaxed whitespace-pre-line">
                {calendarMessage}
              </p>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="flex justify-center gap-1 pb-3">
            {['💕', '✨', '💕'].map((e, i) => (
              <span key={i} className="text-sm" style={{
                animation: `pulse ${1.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}>{e}</span>
            ))}
          </div>
        </div>

        {/* 关闭提示 */}
        <p className="text-center font-pixel text-[10px] text-white/60 mt-3">
          按 E / Esc 关闭
        </p>
      </div>
    </div>
  );
}
