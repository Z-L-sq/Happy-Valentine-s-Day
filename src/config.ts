/**
 * ============================================================
 *  🎮 游戏配置文件 — 修改这里来自定义你的纪念日礼物！
 * ============================================================
 *
 *  📸 照片：放在 /public/photos/ 文件夹中
 *  🎬 视频：放在 /public/videos/ 文件夹中
 *  🎵 音乐：放在 /public/music/  文件夹中
 *
 *  修改下面的内容后，刷新页面即可看到效果。
 */

// ==================== 📚 书架 ====================
// 靠近书架按 E，弹出像素风对话框逐字显示
export const bookTexts: Record<string, string[]> = {
  book1: [
    '这是我们一起读过的故事……',
    '每一本书都藏着一段回忆。',
    '从第一次一起逛书店开始，',
    '到后来窝在沙发上各看各的书，',
    '那些安静又温暖的时光，',
    '是我最珍贵的宝藏。📚',
  ],
  book2: [
    '这本相册记录了我们的旅行……',
    '每张照片背后都有一个故事，',
    '有你在的地方，就是最美的风景。🌸',
  ],
  book3: [
    '一本菜谱，记着我们试过的食谱……',
    '虽然有些翻车了 😅',
    '但一起做饭的日子真的很快乐！🍳',
  ],
  book4: [
    '你的日记本……偷偷翻了一页：',
    '"今天又是被她甜到的一天。"',
    '……///💕',
  ],
};

// ==================== 💌 信件 ====================
// 靠近桌上的信封按 E，展开一封手写信
export const letterContent: string = `亲爱的可可：

在认识你之前，我很少或从不写信。

谢谢你一直陪在我身边，无论是开心还是难过的日子。

每一个和你在一起的瞬间，都是我最想珍藏的礼物。

未来的每一天，我都想和你一起度过。

永远爱你的人 ❤️

2026.2.14`;

// ==================== 📅 日历 ====================
// 右房间床头日历
export const calendarDate: string = '2026年2月14日';
export const calendarMessage: string = '今天是属于我们的日子 💕\n\n每一天都值得被铭记，\n而今天，格外特别。';

// ==================== 📺 视频 ====================
// 靠近电视按 E，会播放视频
// 把视频文件放在 public/videos/ 文件夹里
export const videoSource: string = '/videos/our-video.mp4';
export const videoTitle: string = '📺 我们的回忆';

// ==================== 🎁 礼物 ====================
// 电视柜旁的礼物盒
export const giftMessage: string[] = [
  '你发现了一个精心包装的礼物盒！🎁',
  '轻轻打开……',
  '叮！你的Steam收到了一张通往鹈鹕镇的车票（《星露谷物语》已送达）！',
  '想到之后可能会异地，就希望能有一个无论现实距离多远，我们都能随时‘见面’的地方。 ',
  '这是一个属于我们的新世界，想和你一起在这里种下第一颗防风草，想送你代表共度一生承诺的‘美人鱼吊坠’，想和你一起度过像素世界里的春夏秋冬。',
  '让我们一起搭建起属于我们的小家吧~',
];

// ==================== 🖼️ 相框 ====================
// 靠近墙上的相框按 E，查看照片
// 把照片放在 public/photos/ 文件夹里
// 单张: { src, caption }
// 照片墙 (按 E 翻页): [{ src, caption }, ...]
type PhotoEntry = { src: string; caption: string };
export const photoFrames: Record<string, PhotoEntry | PhotoEntry[]> = {
  photo1: {
    src: '/photos/photo1.png',
    caption: '一直用作手机壁纸的合照 📸',
  },
  photo2: {
    src: '/photos/photo2.png',
    caption: '看《ZOOTOPIA 2》的那天！ 🖼️',
  },
  photo3: {
    src: '/photos/photo3.png',
    caption: '这是我们去‘布城’的那天',
  },
  photo4: [
    { src: '/photos/wall1.png', caption: '狼狈且开心的‘云顶之旅~’' },
    { src: '/photos/wall2.png', caption: '周年纪念日的花花' },
    { src: '/photos/wall3.png', caption: '可爱的小三花和可爱的她' },
    { src: '/photos/wall4.png', caption: '非常美丽的一件裙子！' },
    { src: '/photos/wall5.png', caption: '希腊女神裙配库洛米哈哈哈哈' },
    { src: '/photos/wall6.png', caption: '去到你的城市' },
  ],
  map: {
    src: '/photos/map.jpg',
    caption: '我们的冒险地图 🗺️',
  },
};

// ==================== 🎮 游戏标题 ====================
export const gameTitle: string = '💕 我们的小屋 💕';
export const gameSubtitle: string = '— 情人节快乐 —';

// ==================== 💄 梳妆台 ====================
export const tableMessage: string = '可可化妆的地方 💄';

// ==================== 🎵 背景音乐（可选） ====================
// 把音乐文件放在 public/music/ 文件夹里
export const bgmSource: string = '/music/bgm.mp3';

// ==================== 🌍 地球仪标记点 ====================
// 靠近地球仪按 E，打开像素风地球仪
// lat: 纬度 (北正南负)  lon: 经度 (东正西负)  label: 标签名  note: 备注
export const globeMarkers: { lat: number; lon: number; label: string; note?: string }[] = [
  { lat: 24.48, lon: 118.09, label: '厦门', note: '想念那个在海边的夏天' },
  { lat: 3.14, lon: 101.69, label: '吉隆坡', note: '我们相遇的地方' },
];

// ==================== 角色设置 ====================
export const playerName: string = '可可';
