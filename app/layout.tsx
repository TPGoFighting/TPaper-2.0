import type { Metadata } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-satoshi',
  weight: ['500', '700'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'tpaper — 把任意试卷变成交互式网页',
  description: '上传 PDF、Word 或图片，让 AI 自动把试卷与复习资料转换成可在线作答、自动评分、查看解析并分享的交互式网页试卷。',
  keywords: ['AI试卷转换', 'PDF转试卷', '交互式试题', '在线做题', 'tpaper', 'HTML Artifact'],
  icons: {
    icon: '/brand/logo-lockup.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="paper-grid font-sans antialiased text-ink selection:bg-orange selection:text-ink">
        {children}
      </body>
    </html>
  );
}
