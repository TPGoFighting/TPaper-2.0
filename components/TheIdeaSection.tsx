'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Cpu, Globe2 } from 'lucide-react';

export function TheIdeaSection() {
  return (
    <section id="the-idea" className="py-16 sm:py-24 border-t-[2px] border-ink bg-paper-warm/50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 区域标题 */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-orange px-3 py-1 bg-orange-light border-[1.5px] border-ink rounded-full shadow-[2px_2px_0px_#0F1115] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>02 / 核心产品理念</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-ink tracking-tight">
            任意试卷 → TP → 交互式网页
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate font-medium">
            不建传统题库，无需手动排版，直接把试卷交给 TP。
          </p>
        </div>

        {/* 核心对比网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 左侧转换图 */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl border-[2px] border-ink bg-paper-pure p-4 shadow-[6px_6px_0px_#0F1115] overflow-hidden">
              <Image
                src="/brand/paper-to-interactive.png"
                alt="试卷转换为交互式网页试卷流程"
                fill
                className="object-contain p-2"
              />
            </div>
          </div>

          {/* 右侧：产品思想革新 */}
          <div className="lg:col-span-6 space-y-4">
            <div className="paper-card p-6 border-l-4 border-l-orange">
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink flex items-center gap-2">
                <span>传统题库系统模式</span>
                <span className="text-xs font-mono font-bold bg-mist text-slate px-2 py-0.5 rounded border border-ink/20">旧模式</span>
              </h3>
              <p className="text-sm text-slate mt-2 leading-relaxed">
                依赖繁重的 OCR 切割、结构化 Schema 提取、题库建表、固定千篇一律的模板。遇到复杂数学公式、几何附图或特色排版容易错位与丢失。
              </p>
            </div>

            <div className="paper-card p-6 bg-paper-pure border-l-4 border-l-lime shadow-[5px_5px_0px_#0F1115]">
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink flex items-center gap-2">
                <span>tpaper 的 HTML Artifact 模式</span>
                <span className="text-xs font-mono font-bold bg-lime-light text-ink px-2 py-0.5 rounded border border-ink">tpaper 模式</span>
              </h3>
              <p className="text-sm text-slate-dark mt-2 leading-relaxed font-medium">
                AI 完整理解文档后，为这份试卷量身定制 Web 交互体验，直接生成包含样式、KaTeX 公式、判分逻辑与答案解析的独立单 HTML 产物。
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-mist font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange" />
                  <span>Agent 体验设计</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-lime" />
                  <span>独立可分享 URL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
