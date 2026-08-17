'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MascotInteractive } from './MascotInteractive';

interface FooterCTAProps {
  onOpenDemo?: () => void;
}

export function FooterCTA({ onOpenDemo }: FooterCTAProps) {
  return (
    <footer className="border-t-[2px] border-ink bg-paper-pure relative pt-16 pb-12 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 底部超大 CTA 模块 */}
        <div className="paper-card p-8 sm:p-14 bg-paper relative overflow-hidden border-[2.5px] border-ink shadow-[8px_8px_0px_#0F1115] text-center mb-16">
          {/* 顶部吉祥物 */}
          <div className="flex justify-center mb-4">
            <MascotInteractive mood="excited" size="md" speechText="让做题变得好玩起来！" />
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-ink tracking-tight max-w-2xl mx-auto leading-tight">
            你的下一份试卷， <br />
            <span className="hand-drawn-underline">不该只是一张纸。</span>
          </h2>

          <p className="font-sans text-sm sm:text-base text-slate font-medium max-w-md mx-auto mt-4 mb-8">
            数秒内将作业、复习资料、历年真题转化为高颜值的交互式网页试题。
          </p>

          <div className="flex justify-center">
            <button
              onClick={onOpenDemo}
              className="btn-secondary text-base sm:text-lg py-3.5 px-8"
            >
              <span>立即体验转换</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 底部版权与导航 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-mist font-mono text-xs text-slate">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-ink text-sm bg-paper-warm px-2 py-0.5 rounded border border-ink">
              TP
            </span>
            <span className="font-bold text-ink">tpaper</span>
            <span>— AI 驱动的交互式试卷平台</span>
          </div>

          <div className="flex items-center gap-6 font-bold">
            <a href="#the-idea" className="hover:text-ink transition-colors">核心理念</a>
            <a href="#before-after" className="hover:text-ink transition-colors">前后对比</a>
            <a href="#how-it-works" className="hover:text-ink transition-colors">工作流程</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-ink transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
