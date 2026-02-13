/**
 * 🐱 NPC 系统 — 静态男孩 + 自主漫游猫咪
 *
 * 男孩 (man): 静止站在 TMX "man" 图层标记位置
 * 猫咪 (bwcat / ocat): 自主 AI 漫游，行为模拟真实猫咪：
 *   - 随机走几步 → 停下来发呆 → 再走
 *   - 有时候长时间趴着不动 (睡觉)
 *   - 使用与玩家相同的 WALKABLE_MAP 碰撞检测
 */

import { TILE_SIZE, PLAYER_SIZE, WALKABLE_MAP, MAP_COLS, MAP_ROWS, Direction } from './constants';
import { assetPath } from '../basePath';

// ==================== 类型 ====================

/** 猫的行为状态 */
export enum CatState {
    IDLE = 'idle',       // 站着发呆
    WALKING = 'walking', // 走路中
    SLEEPING = 'sleeping', // 长时间趴着
}

export interface CatNPC {
    id: string;
    x: number;          // 像素坐标
    y: number;
    direction: Direction;
    state: CatState;
    animFrame: number;
    animTimer: number;
    /** 当前状态剩余持续 tick 数 */
    stateTimer: number;
    /** 行走方向 (每次随机选) */
    walkDx: number;
    walkDy: number;
    sprite: HTMLImageElement | null;
}

export interface StaticNPC {
    id: string;
    x: number;   // 像素坐标 (脚底位置)
    y: number;
    sprite: HTMLImageElement | null;
}

// ==================== 常量 ====================

/** 猫精灵图: 4 列 × 4 行, 每帧 125×125 */
const CAT_FRAME_W = 125;
const CAT_FRAME_H = 125;
const CAT_COLS = 4;
/** 猫在游戏中的显示尺寸 */
const CAT_DRAW_W = 26;
const CAT_DRAW_H = 26;
/** 猫碰撞体大小 */
const CAT_BODY = 20;
/** 猫行走速度 */
const CAT_SPEED = 0.5;

/**
 * 猫精灵图行映射 (观察精灵图):
 *  row 0 = 正面 (down)
 *  row 1 = 右侧 (right) — 侧面朝右
 *  row 2 = 背面 (up)
 *  row 3 = 左侧 (left) — 侧面朝左 (实际是从左看)
 *
 * 注意: 精灵图的 row 3 看起来和 row 1 是对称的
 */
const CAT_DIR_TO_ROW: Record<Direction, number> = {
    [Direction.DOWN]: 0,
    [Direction.RIGHT]: 1,
    [Direction.UP]: 2,
    [Direction.LEFT]: 3,
};

/** 行走动画帧序列 */
const CAT_WALK_ANIM = [0, 1, 2, 3];

/** 男孩精灵在游戏中的显示尺寸 — 与 keqi 同高 (DRAW_H ≈ 52) */
const MAN_DRAW_H = Math.round(38 * (583 / 429)); // 与 player 的 DRAW_H 一致 ≈ 52
const MAN_DRAW_W = Math.round(MAN_DRAW_H * (220 / 433)); // 等比缩放宽度 ≈ 26

// ==================== 男孩 NPC 位置 (TMX man 图层: row 16, col 11) ====================
/** 脚底对齐到 tile (11, 16) 的中心底部 */
const MAN_TILE_COL = 11;
const MAN_TILE_ROW = 16;

// ==================== 图片加载 ====================
function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.warn(`⚠️ NPC 无法加载: ${src}`);
            resolve(null);
        };
        img.src = src;
    });
}

// ==================== 创建 NPC ====================

export async function createStaticMan(): Promise<StaticNPC> {
    const sprite = await loadImage(assetPath('/char/man/man.png'));
    // 脚底对齐 tile 中心
    const footX = MAN_TILE_COL * TILE_SIZE + TILE_SIZE / 2;
    const footY = (MAN_TILE_ROW + 1) * TILE_SIZE; // tile 底边
    return {
        id: 'man',
        x: footX - PLAYER_SIZE / 2,     // 碰撞盒左上角
        y: footY - PLAYER_SIZE,         // 碰撞盒顶
        sprite,
    };
}

export async function createCat(id: string, spritePath: string, startCol: number, startRow: number): Promise<CatNPC> {
    const sprite = await loadImage(assetPath(spritePath));
    return {
        id,
        x: startCol * TILE_SIZE,
        y: startRow * TILE_SIZE,
        direction: Direction.DOWN,
        state: CatState.IDLE,
        animFrame: 0,
        animTimer: 0,
        stateTimer: randomIdleTime(),
        walkDx: 0,
        walkDy: 0,
        sprite,
    };
}

// ==================== 猫 AI ====================

function randomIdleTime(): number {
    // 2~6 秒 @ 60fps
    return 120 + Math.floor(Math.random() * 240);
}

function randomSleepTime(): number {
    // 5~15 秒
    return 300 + Math.floor(Math.random() * 600);
}

function randomWalkTime(): number {
    // 1~4 秒
    return 60 + Math.floor(Math.random() * 180);
}

/** 碰撞检测: 猫的脚部区域是否在可行走区域 */
function isCatWalkable(px: number, py: number): boolean {
    const padding = 2;
    const left = px + padding;
    const right = px + CAT_BODY - padding;
    const top = py + CAT_BODY / 2;
    const bottom = py + CAT_BODY + 2;

    const points = [
        { x: left, y: top },
        { x: right, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
    ];

    for (const pt of points) {
        const col = Math.floor(pt.x / TILE_SIZE);
        const row = Math.floor(pt.y / TILE_SIZE);
        if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return false;
        if (WALKABLE_MAP[row][col] !== 1) return false;
    }
    return true;
}

/** 随机选择一个行走方向 */
function pickRandomDirection(): { dx: number; dy: number; dir: Direction } {
    const choices = [
        { dx: 0, dy: -CAT_SPEED, dir: Direction.UP },
        { dx: 0, dy: CAT_SPEED, dir: Direction.DOWN },
        { dx: -CAT_SPEED, dy: 0, dir: Direction.LEFT },
        { dx: CAT_SPEED, dy: 0, dir: Direction.RIGHT },
    ];
    return choices[Math.floor(Math.random() * choices.length)];
}

/** 每帧更新猫的 AI */
export function updateCat(cat: CatNPC): void {
    cat.stateTimer--;

    switch (cat.state) {
        case CatState.IDLE:
            if (cat.stateTimer <= 0) {
                // 60% 概率开始走, 20% 概率睡觉, 20% 继续发呆
                const r = Math.random();
                if (r < 0.6) {
                    const { dx, dy, dir } = pickRandomDirection();
                    cat.state = CatState.WALKING;
                    cat.walkDx = dx;
                    cat.walkDy = dy;
                    cat.direction = dir;
                    cat.stateTimer = randomWalkTime();
                    cat.animFrame = 0;
                    cat.animTimer = 0;
                } else if (r < 0.001) {
                    cat.state = CatState.SLEEPING;
                    cat.stateTimer = randomSleepTime();
                    cat.direction = Direction.DOWN; // 睡觉面朝下
                } else {
                    cat.stateTimer = randomIdleTime();
                }
            }
            break;

        case CatState.WALKING:
            // 尝试移动
            {
                const newX = cat.x + cat.walkDx;
                const newY = cat.y + cat.walkDy;
                if (isCatWalkable(newX, newY)) {
                    cat.x = newX;
                    cat.y = newY;
                } else {
                    // 撞墙了，停下来
                    cat.state = CatState.IDLE;
                    cat.stateTimer = randomIdleTime();
                    break;
                }

                // 动画
                cat.animTimer++;
                if (cat.animTimer % 10 === 0) {
                    cat.animFrame = (cat.animFrame + 1) % CAT_WALK_ANIM.length;
                }

                if (cat.stateTimer <= 0) {
                    cat.state = CatState.IDLE;
                    cat.stateTimer = randomIdleTime();
                    cat.animFrame = 0;
                }
            }
            break;

        case CatState.SLEEPING:
            if (cat.stateTimer <= 0) {
                cat.state = CatState.IDLE;
                cat.stateTimer = randomIdleTime();
            }
            break;
    }
}

// ==================== 渲染 ====================

/** 渲染男孩 (静态) */
export function renderManNPC(ctx: CanvasRenderingContext2D, man: StaticNPC): void {
    if (!man.sprite) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    // 以碰撞盒为基准居中绘制
    const drawX = man.x + PLAYER_SIZE / 2 - MAN_DRAW_W / 2;
    const drawY = man.y + PLAYER_SIZE / 2 - MAN_DRAW_H / 2;
    ctx.drawImage(man.sprite, 0, 0, man.sprite.width, man.sprite.height, drawX, drawY, MAN_DRAW_W, MAN_DRAW_H);
    ctx.restore();
}

/** 渲染猫 */
export function renderCat(ctx: CanvasRenderingContext2D, cat: CatNPC): void {
    if (!cat.sprite) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const row = CAT_DIR_TO_ROW[cat.direction];
    const col = cat.state === CatState.WALKING
        ? CAT_WALK_ANIM[cat.animFrame % CAT_WALK_ANIM.length]
        : 0; // 非行走时用第一帧 (站立)

    const srcX = col * CAT_FRAME_W;
    const srcY = row * CAT_FRAME_H;

    // 绘制位置
    const drawX = cat.x + CAT_BODY / 2 - CAT_DRAW_W / 2;
    const drawY = cat.y + CAT_BODY / 2 - CAT_DRAW_H / 2;

    ctx.drawImage(
        cat.sprite,
        srcX, srcY, CAT_FRAME_W, CAT_FRAME_H,
        drawX, drawY, CAT_DRAW_W, CAT_DRAW_H
    );
    ctx.restore();
}

// ==================== Y-Sort 支持 ====================

export interface YSortEntity {
    type: 'player' | 'man' | 'cat';
    footY: number;
    render: (ctx: CanvasRenderingContext2D) => void;
}

/** 获取男孩的 footY */
export function getManFootY(man: StaticNPC): number {
    return man.y + PLAYER_SIZE;
}

/** 获取猫的 footY */
export function getCatFootY(cat: CatNPC): number {
    return cat.y + CAT_BODY;
}

// ==================== 爱心互动 ====================

const HEART_INTERACTION_DIST = 48; // 互动距离 (像素)
const HEART_BUBBLE_DURATION = 180; // 气泡持续帧数 (3 秒 @ 60fps)

/** 检测玩家是否靠近男孩 NPC */
export function isPlayerNearMan(px: number, py: number, man: StaticNPC): boolean {
    const playerCX = px + PLAYER_SIZE / 2;
    const playerCY = py + PLAYER_SIZE / 2;
    const manCX = man.x + PLAYER_SIZE / 2;
    const manCY = man.y + PLAYER_SIZE / 2;
    const dx = playerCX - manCX;
    const dy = playerCY - manCY;
    return Math.sqrt(dx * dx + dy * dy) < HEART_INTERACTION_DIST;
}

export { HEART_BUBBLE_DURATION };

/**
 * 渲染爱心对话气泡 — 像素风格圆角气泡 + 红色爱心
 * @param cx 角色头顶中心 X
 * @param headY 角色头顶 Y
 * @param time performance.now() 用于浮动动画
 * @param progress 0~1 动画进度 (用于淡入淡出)
 */
export function renderHeartBubble(
    ctx: CanvasRenderingContext2D,
    cx: number,
    headY: number,
    time: number,
    progress: number
): void {
    ctx.save();

    // 浮动偏移
    const floatY = Math.sin(time * 0.004) * 2;
    const bubbleX = cx;
    const bubbleY = headY - 20 + floatY;

    // 淡入淡出
    const alpha = progress < 0.1
        ? progress / 0.1
        : progress > 0.85
            ? (1 - progress) / 0.15
            : 1;
    ctx.globalAlpha = alpha;

    // ---- 气泡背景 ----
    const bw = 22;
    const bh = 20;
    const bx = bubbleX - bw / 2;
    const by = bubbleY - bh;

    // 白色圆角气泡
    ctx.fillStyle = '#FFFEF5';
    ctx.beginPath();
    roundBubble(ctx, bx, by, bw, bh, 5);
    ctx.fill();

    // 气泡边框
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    roundBubble(ctx, bx, by, bw, bh, 5);
    ctx.stroke();

    // 气泡小尾巴 (三角形指向下方)
    ctx.fillStyle = '#FFFEF5';
    ctx.beginPath();
    ctx.moveTo(bubbleX - 3, by + bh - 0.5);
    ctx.lineTo(bubbleX, by + bh + 5);
    ctx.lineTo(bubbleX + 3, by + bh - 0.5);
    ctx.closePath();
    ctx.fill();
    // 尾巴边框
    ctx.strokeStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(bubbleX - 3, by + bh);
    ctx.lineTo(bubbleX, by + bh + 5);
    ctx.lineTo(bubbleX + 3, by + bh);
    ctx.stroke();

    // ---- 像素风爱心 ----
    drawPixelHeart(ctx, bubbleX, by + bh / 2 - 1);

    ctx.restore();
}

/** 画一个圆角矩形路径 */
function roundBubble(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

/** 画一个像素风红色爱心 (居中在 cx, cy) */
function drawPixelHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    const s = 1.5; // 像素单位大小
    // 经典像素爱心 pattern (7×6)
    const pattern = [
        [0, 1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
    ];

    const offsetX = cx - (pattern[0].length * s) / 2;
    const offsetY = cy - (pattern.length * s) / 2;

    // 深红色边框
    ctx.fillStyle = '#8B0000';
    for (let r = 0; r < pattern.length; r++) {
        for (let c = 0; c < pattern[r].length; c++) {
            if (pattern[r][c]) {
                ctx.fillRect(
                    Math.round(offsetX + c * s) - 0.5,
                    Math.round(offsetY + r * s) - 0.5,
                    s + 1,
                    s + 1
                );
            }
        }
    }
    // 红色填充
    ctx.fillStyle = '#E8311A';
    for (let r = 0; r < pattern.length; r++) {
        for (let c = 0; c < pattern[r].length; c++) {
            if (pattern[r][c]) {
                ctx.fillRect(
                    Math.round(offsetX + c * s),
                    Math.round(offsetY + r * s),
                    s,
                    s
                );
            }
        }
    }
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(Math.round(offsetX + 1 * s), Math.round(offsetY + 0 * s), s, s);
    ctx.fillRect(Math.round(offsetX + 1 * s), Math.round(offsetY + 1 * s), s, s);
}
