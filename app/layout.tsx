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
  metadataBase: new URL('https://tpaper.tpgofighting.top'),
  title: {
    default: 'tpaper — 把任意试卷变成交互式网页',
    template: '%s | tpaper',
  },
  description: '上传 PDF、Word 或图片，让 AI 自动把试卷与复习资料转换成可在线作答、自动评分、查看解析并分享的交互式网页试卷。',
  keywords: ['AI试卷转换', 'PDF转试卷', '交互式试题', '在线做题', 'tpaper', 'HTML Artifact'],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'tpaper',
    title: 'tpaper — 把任意试卷变成交互式网页',
    description: '将 PDF、Word 或图片试卷转换成可作答、自动评分、查看解析并分享的交互式网页试卷。',
    url: 'https://tpaper.tpgofighting.top/',
  },
  twitter: {
    card: 'summary',
    title: 'tpaper — 把任意试卷变成交互式网页',
    description: 'AI 试卷转换与在线作答工具。',
  },
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
      <head>
        <script type="application/ld+json" data-tp-seo-jsonld dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: "tpaper", url: "https://tpaper.tpgofighting.top/", description: "将 PDF、Word 或图片试卷转换成可作答、自动评分、查看解析并分享的交互式网页试卷。", applicationCategory: "EducationalApplication", inLanguage: "zh-CN" }) }} />
      </head>
      <body className="paper-grid font-sans antialiased text-ink selection:bg-orange selection:text-ink">
        {children}
      </body>
    </html>
  );
}
