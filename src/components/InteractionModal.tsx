'use client';
/**
 * 统一的模态框管理器 — 根据 activeModal 渲染不同的弹窗
 */
import React from 'react';
import { useGameStore } from '@/game/store';
import BookModal from './BookModal';
import LetterModal from './LetterModal';
import CalendarModal from './CalendarModal';
import VideoModal from './VideoModal';
import GiftModal from './GiftModal';
import PhotoModal from './PhotoModal';
import TableModal from './TableModal';
import GlobeModal from './GlobeModal';

export default function InteractionModal() {
  const activeModal = useGameStore((s) => s.activeModal);

  if (!activeModal) return null;

  switch (activeModal) {
    case 'book':
      return <BookModal />;
    case 'letter':
      return <LetterModal />;
    case 'calendar':
      return <CalendarModal />;
    case 'video':
      return <VideoModal />;
    case 'gift':
      return <GiftModal />;
    case 'photo':
      return <PhotoModal />;
    case 'map':
      return <GlobeModal />;
    case 'table':
      return <TableModal />;
    default:
      return null;
  }
}
