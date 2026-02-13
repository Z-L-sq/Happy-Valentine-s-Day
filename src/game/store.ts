/**
 * Zustand 游戏状态管理
 */
import { create } from 'zustand';
import { Direction, PLAYER_START_X, PLAYER_START_Y, InteractableType } from './constants';

// ==================== 类型定义 ====================
export type ModalType = InteractableType | null;

interface GameState {
  // 玩家状态
  playerX: number;
  playerY: number;
  direction: Direction;
  isMoving: boolean;
  animFrame: number;

  // 互动状态
  nearbyObject: string | null; // 附近可互动物体的 id
  activeModal: ModalType;
  modalObjectId: string | null;

  // 游戏状态
  isMusicPlaying: boolean;

  // Actions
  movePlayer: (x: number, y: number) => void;
  setDirection: (dir: Direction) => void;
  setIsMoving: (moving: boolean) => void;
  nextAnimFrame: () => void;
  setNearbyObject: (id: string | null) => void;
  openModal: (type: ModalType, objectId?: string) => void;
  closeModal: () => void;
  toggleMusic: () => void;
}

// ==================== Store ====================
export const useGameStore = create<GameState>((set) => ({
  playerX: PLAYER_START_X,
  playerY: PLAYER_START_Y,
  direction: Direction.DOWN,
  isMoving: false,
  animFrame: 0,

  nearbyObject: null,
  activeModal: null,
  modalObjectId: null,

  isMusicPlaying: false,

  movePlayer: (x, y) => set({ playerX: x, playerY: y }),
  setDirection: (dir) => set({ direction: dir }),
  setIsMoving: (moving) => set({ isMoving: moving }),
  nextAnimFrame: () => set((s) => ({ animFrame: (s.animFrame + 1) % 4 })),
  setNearbyObject: (id) => set({ nearbyObject: id }),
  openModal: (type, objectId) => set({ activeModal: type, modalObjectId: objectId ?? null }),
  closeModal: () => set({ activeModal: null, modalObjectId: null }),
  toggleMusic: () => set((s) => ({ isMusicPlaying: !s.isMusicPlaying })),
}));
