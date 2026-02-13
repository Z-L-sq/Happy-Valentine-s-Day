import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '💕 我们的小屋 — 纪念日快乐',
  description: '一个星露谷物语风格的纪念日互动小游戏',
  icons: { icon: '❤️' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#1a1a2e] min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
