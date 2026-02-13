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

import { assetPath } from './basePath';

// ==================== 📚 书架 ====================
// 靠近书架按 E，弹出像素风对话框逐字显示
export const bookTexts: Record<string, string[]> = {
  book1: [
    '《爱你就像爱生命》'
  ],
};

// ==================== 💌 信件 ====================
// 靠近桌上的信封按 E，展开一封手写信
// 支持分页：数组中每个元素为一页内容
export const letterPages: string[] = [
  `亲爱的可可：

可可，见字如面。这次的信的形式很特殊吧，哈哈！

我们竟然要过第二个情人节了!时间过得真快，我们也不再是一年前刚在一起时的稚嫩样子。我们一起做了很多事，现在的你，变得强大独立了，但脸上还是我初见你那天的天真善良。这让我很高兴。我也在努力学着怎么去关心一个人，怎么把心放在你的位置上思考，虽然有时候还是显得笨手笨拙的。

我们的这一年，汗水也有，泪水也有，但这才是生活嘛。还记得你说我\u201C劝退\u201D你的那次吗？现在我才琢磨明白，其实我想说，生活写就的童话，从不是故事绘本里的那样，王子骑着白马，公主从不牙疼。
我们的童话，就是生活本身。它是我们忙里偷闲凑在一起打的游戏，是复习周跑去咖啡馆占的座位，是辛劳一天依旧拥抱送别。我们的幸福不是一句\u201C从此幸福快乐地生活在一起\u201D就能打发了的，它是心情忽上忽下的曲线，是这些琐碎得不能再琐碎的瞬间。`,

  `所以，与其说是过\u201C情人节\u201D，我倒更想叫它\u201C爱人节\u201D。在这个日子里，我们不庆祝什么虚无缥缈的浪漫，我们庆祝这一年的相互懂得，庆祝我们是在泥泞里互相扶持着长大的，庆祝这些实实在在的、属于我们自己的爱。

写到这儿，好多事儿像潮水一样涌上来，我笔头太笨（实际上是在VScode里面敲），实在写不出那份甜蜜和好，只能对着屏幕傻笑。`,

  `希望不管这世界变得多么老，日子变得多么长，你都能守护好自己的天真善良，都能自信快乐得成长，受到再大的辛苦和劳累，我的怀抱都能成为你最独特的一处温暖。
希望不管这世界变得多么老，日子变得多么长，你都是我的小女孩，我们都能保有对生活童话般的期待，我都会精心挑选或是制作礼物，用很久，给你写一封信，只为守护好你心里的小朋友。

Happy Valentine\u2019s Day. Happy Day of Our Love.

亮亮 ❤️

2026.2.14`,
];

// ==================== 📅 日历 ====================
// 右房间床头日历
export const calendarDate: string = '2026年2月14日';
export const calendarMessage: string = '今天是我们度过的第二个情人节哦 💕';

// ==================== 📺 视频 ====================
// 靠近电视按 E，会播放视频
// 把视频文件放在 public/videos/ 文件夹里
export const videoSource: string = assetPath('/videos/our-video.mp4');
export const videoTitle: string = '📺\u201C真正喜欢一个人的时候会想什么\u201D   \u201C想以后\u201D';

// ==================== 🎁 礼物 ====================
// 电视柜旁的礼物盒
export const giftMessage: string[] = [
  '你发现了一个精心包装的礼物盒！🎁',
  '轻轻打开……',
  '叮！你的Steam收到了一张通往鹈鹕镇的车票（《星露谷物语》已送达）！',
  '想到之后可能会异地，就希望能有一个无论现实距离多远，我们都能随时\u2018见面\u2019的地方。 ',
  '这是一个属于我们的新世界，想和你一起在这里种下第一颗防风草，想送你代表共度一生承诺的\u2018美人鱼吊坠\u2019，想和你一起度过像素世界里的春夏秋冬。',
  '让我们一起搭建起属于我们的小家吧 ~',
];

// ==================== 🖼️ 相框 ====================
// 靠近墙上的相框按 E，查看照片
// 把照片放在 public/photos/ 文件夹里
// 单张: { src, caption }
// 照片墙 (按 E 翻页): [{ src, caption }, ...]
type PhotoEntry = { src: string; caption: string };
export const photoFrames: Record<string, PhotoEntry | PhotoEntry[]> = {
  photo1: {
    src: assetPath('/photos/photo1.png'),
    caption: '一直用作手机壁纸的合照 📸',
  },
  photo2: {
    src: assetPath('/photos/photo2.png'),
    caption: '这是一起去看《ZOOTOPIA 2》的那天！ 🖼️',
  },
  photo3: {
    src: assetPath('/photos/photo3.png'),
    caption: '这是我们去\u2018布城\u2019的那天',
  },
  photo4: [
    { src: assetPath('/photos/wall1.png'), caption: '狼狈且开心的\u2018云顶之旅~\u2019' },
    { src: assetPath('/photos/wall2.png'), caption: '周年纪念日的花花' },
    { src: assetPath('/photos/wall3.png'), caption: '可爱的小三花和可爱的她' },
    { src: assetPath('/photos/wall4.png'), caption: '非常美丽的一件裙子！' },
    { src: assetPath('/photos/wall5.png'), caption: '希腊女神裙配库洛米哈哈哈哈' },
    { src: assetPath('/photos/wall6.png'), caption: '去到你的城市' },
  ],
  map: {
    src: assetPath('/photos/map.jpg'),
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
export const bgmSource: string = assetPath('/music/bgm.mp3');

// ==================== 🌍 地球仪标记点 ====================
// 靠近地球仪按 E，打开像素风地球仪
// lat: 纬度 (北正南负)  lon: 经度 (东正西负)  label: 标签名  note: 备注
export const globeMarkers: { lat: number; lon: number; label: string; note?: string }[] = [
  { lat: 24.48, lon: 118.09, label: '厦门', note: '想念那个我们在海边光脚的夏天' },
  { lat: 3.14, lon: 101.69, label: '吉隆坡', note: '这是我们相遇的地方' },
];

// ==================== 角色设置 ====================
export const playerName: string = '可可';
