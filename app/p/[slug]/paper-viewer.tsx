'use client';

import React from 'react';
import Link from 'next/link';
import { SamplePaper } from '@/lib/sample-papers';
import { generateStandaloneTestHtml } from '@/lib/html-generator';
import { ArrowLeft, Download } from 'lucide-react';

interface PaperViewerProps {
  slug: string;
  paper: SamplePaper;
}

export function PaperViewer({ slug, paper }: PaperViewerProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const htmlContent = generateStandaloneTestHtml(paper, {
    gradingEndpoint: origin ? `${origin}/api/papers/grade` : undefined,
    parentOrigin: origin,
    logoSrc: '/tabbit-logo.jpg',
  });

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.id}-tpaper.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* 顶部操作条 */}
      <header className="bg-paper-pure border-b-[2px] border-ink px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-xs font-bold text-ink hover:text-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回 tpaper 首页</span>
          </Link>
          <span className="text-mist-dark">|</span>
          <span className="font-mono text-xs text-slate truncate max-w-xs sm:max-w-md">
            独立试卷产物: /p/{slug}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="btn-white py-1 px-3 text-xs font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出独立 HTML</span>
          </button>
        </div>
      </header>

      {/* 嵌入的单文件独立 HTML 产物 */}
      <div className="flex-1 w-full h-[calc(100vh-50px)]">
        <iframe
          srcDoc={htmlContent}
          title={paper.title}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
