'use client';
/**
 * 🖼️ 相框模态框 — 像素风相框展示照片 + 说明文字
 *
 * 支持两种模式:
 *   单张照片: photoFrames[id] = { src, caption }
 *   照片墙:   photoFrames[id] = [{ src, caption }, ...] → 按 E 翻页
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { photoFrames } from '@/config';
import { useGameStore } from '@/game/store';

export default function PhotoModal() {
  const closeModal = useGameStore((s) => s.closeModal);
  const objectId = useGameStore((s) => s.modalObjectId) ?? 'photo1';
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  const rawEntry = photoFrames[objectId];
  const gallery = Array.isArray(rawEntry)
    ? rawEntry
    : [rawEntry ?? { src: '/photos/photo1.jpg', caption: '一张照片' }];
  const isGallery = gallery.length > 1;
  const frame = gallery[currentIndex] ?? gallery[0];

  const goNext = useCallback(() => {
    if (!isGallery) return;
    setImgError(false);
    setImgLoaded(false);
    setImgSize(null);
    setCurrentIndex((i) => (i + 1) % gallery.length);
  }, [isGallery, gallery.length]);

  const goPrev = useCallback(() => {
    if (!isGallery) return;
    setImgError(false);
    setImgLoaded(false);
    setImgSize(null);
    setCurrentIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }, [isGallery, gallery.length]);

  useEffect(() => {
    const t = setTimeout(() => setIsOpen(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'e' || e.key === 'E') {
        if (isGallery) { goNext(); } else { closeModal(); }
        return;
      }
      if (isGallery) {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') goNext();
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') goPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal, isGallery, goNext, goPrev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className={`relative transition-all duration-500 ease-out
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-6'
          }`}
        style={{
          width: imgSize ? `min(${imgSize.w}px, 92vw)` : undefined,
          maxWidth: '92vw',
          maxHeight: '94vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 像素风相框 */}
        <div className="relative">
          {/* 外框 - 木质纹理 */}
          <div
            className="bg-gradient-to-br from-[#8B6914] via-[#A0782C] to-[#6B4F12] p-3 rounded-sm"
            style={{
              boxShadow:
                '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* 内框 - 金色镶边 */}
            <div className="bg-gradient-to-br from-[#D4A54A] to-[#B8912E] p-1 rounded-sm">
              {/* 暗色衬底 */}
              <div className="bg-[#2a2018] p-1 rounded-sm">
                {/* 照片区域 */}
                <div className="relative bg-[#1a1410] overflow-hidden rounded-sm">
                  {imgError ? (
                    /* 照片占位 */
                    <div className="flex flex-col items-center justify-center py-20 px-10 bg-gradient-to-br from-[#3a2a20] to-[#2a1a10]">
                      <span className="text-5xl mb-3">🖼️</span>
                      <p className="font-pixel text-[#8B6914] text-xs">
                        把照片放在 /public/photos/ 文件夹
                      </p>
                      <p className="font-pixel text-[#6B4F12] text-[10px] mt-1">
                        文件名: {frame.src.split('/').pop()}
                      </p>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={frame.src}
                      alt={frame.caption}
                      className={`block w-full h-auto transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                      style={{ maxHeight: 'calc(94vh - 100px)' }}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalWidth && img.naturalHeight) {
                          // 计算实际应显示的尺寸：尽量撑满视口
                          const vw = window.innerWidth * 0.92 - 20; // 减去边框padding
                          const vh = window.innerHeight * 0.94 - 100;
                          const imgRatio = img.naturalWidth / img.naturalHeight;
                          let w: number, h: number;
                          if (vw / vh > imgRatio) {
                            // 视口更宽，高度受限
                            h = Math.min(vh, img.naturalHeight);
                            w = h * imgRatio;
                          } else {
                            // 视口更窄，宽度受限
                            w = Math.min(vw, img.naturalWidth);
                            h = w / imgRatio;
                          }
                          setImgSize({ w: w + 20, h: h + 20 }); // 加边框余量
                        }
                        setImgLoaded(true);
                      }}
                      onError={() => setImgError(true)}
                    />
                  )}

                  {/* 加载中占位 */}
                  {!imgLoaded && !imgError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-pixel text-[#8B6914] text-xs animate-pulse">加载中...</span>
                    </div>
                  )}

                  {/* 玻璃反光效果 */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 挂钉装饰 */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#888] rounded-full border-2 border-[#666] shadow-md" />
        </div>

        {/* 说明文字 */}
        <div className="mt-4 text-center">
          <p className="font-pixel text-white text-sm drop-shadow-lg">
            {frame.caption}
          </p>
        </div>

        {/* 页码指示器 (画廊模式) */}
        {isGallery && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {gallery.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'bg-[#FFD700] scale-125'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* 关闭/导航提示 */}
        <div className="mt-3 text-center">
          <span className="font-pixel text-white/50 text-[10px]">
            {isGallery
              ? `${currentIndex + 1} / ${gallery.length}　按 E / → 下一张　按 A / ← 上一张　Esc 关闭`
              : '按 E / Esc 关闭'
            }
          </span>
        </div>
      </div>
    </div>
  );
}
