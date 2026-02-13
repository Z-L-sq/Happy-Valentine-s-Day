# 💕 我们的小屋 — 纪念日互动小游戏

一个星露谷物语风格的像素风 Web 互动小游戏，作为纪念日礼物 🎁

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器访问
# http://localhost:3000
```

## 🎮 操作说明

| 按键 | 功能 |
|------|------|
| WASD / 方向键 | 控制角色移动 |
| E | 与附近物体互动 |
| Esc | 关闭弹窗 |

## 📁 如何自定义内容

### 📸 照片
1. 把合照放到 `public/photos/` 文件夹
2. 打开 `src/config.ts`，修改 `galleryImages` 数组

### 🎬 视频
1. 把视频放到 `public/videos/` 文件夹
2. 打开 `src/config.ts`，修改 `videoSource` 路径

### 📚 书架文字
打开 `src/config.ts`，修改 `bookshelfText` 数组

### 💌 信件内容
打开 `src/config.ts`，修改 `letterContent` 字符串

### 🎵 背景音乐
1. 把音乐文件放到 `public/music/` 文件夹
2. 打开 `src/config.ts`，修改 `bgmSource` 路径

## 📂 项目结构

```
214/
├── public/
│   ├── photos/         ← 📸 合照放这里
│   ├── videos/         ← 🎬 视频放这里
│   └── music/          ← 🎵 背景音乐放这里
├── src/
│   ├── app/
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 页面布局
│   │   └── page.tsx        # 主页面
│   ├── components/
│   │   ├── GameCanvas.tsx       # 🎮 游戏画布（渲染+移动）
│   │   ├── GameHUD.tsx          # HUD（标题+控制栏）
│   │   ├── InteractionModal.tsx # 模态框管理器
│   │   ├── PhotoModal.tsx       # 📸 相框弹窗
│   │   ├── TVModal.tsx          # 📺 电视弹窗
│   │   ├── BookshelfModal.tsx   # 📚 书架对话框
│   │   ├── LetterModal.tsx      # 💌 信件弹窗
│   │   └── FireplaceModal.tsx   # 🔥 壁炉弹窗
│   ├── game/
│   │   ├── constants.ts    # 地图、碰撞、物体定义
│   │   ├── collision.ts    # 碰撞+互动检测
│   │   ├── renderer.ts     # Canvas 渲染函数
│   │   └── store.ts        # Zustand 状态管理
│   └── config.ts           # ⭐ 自定义内容配置文件
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🌐 部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

也可以一键部署到 Vercel：
1. 推送到 GitHub
2. 在 vercel.com 导入项目
3. 自动部署完成！

---

用 ❤️ 制作
