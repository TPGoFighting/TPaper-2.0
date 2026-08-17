'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck } from 'lucide-react';
import { InteractiveDropzone } from './InteractiveDropzone';
import { SamplePaper } from '@/lib/sample-papers';

interface HeroSectionProps {
  onPaperReady: (paperId: string, customPaper?: SamplePaper) => void;
}

export function HeroSection({ onPaperReady }: HeroSectionProps) {
  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* 左侧文案与吉祥物区域 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6 flex flex-col"
          >
            {/* 顶栏徽章 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider bg-orange-light text-orange border-[1.5px] border-ink px-3 py-1 rounded-full shadow-[2px_2px_0px_#0F1115] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                <span>AI-Native 试卷交互引擎</span>
              </span>
            </div>

            {/* 大标题 */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.08] mb-6">
              把任意试卷变成
              <br />
              <span className="relative inline-block mt-1">
                <span className="relative z-10 text-ink">交互式答题网页</span>
                <span className="absolute left-0 bottom-1.5 w-full h-3.5 bg-orange -rotate-1 rounded-sm -z-0 opacity-80" />
              </span>
            </h1>

            {/* 副标题 */}
            <p className="font-sans text-base sm:text-lg text-slate-dark leading-relaxed mb-8 max-w-lg">
              扔进 PDF、Word 试卷或题目照片，AI 自动理解排版并生成<strong className="text-ink font-bold">即刻作答、自动批改、分步解析</strong>的独立单文件 HTML 网页。
            </p>

            {/* 特性徽章列表 */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="paper-badge">
                <Zap className="w-3.5 h-3.5 text-orange" />
                <span className="font-mono text-xs text-ink font-bold">无需传统固定题库</span>
              </div>
              <div className="paper-badge">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-xs text-ink font-bold">单 HTML 产物架构</span>
              </div>
            </div>

            {/* 品牌主角图 */}
            <div className="mt-8 relative w-48 h-48 sm:w-56 sm:h-56 hidden md:block">
              <Image
                src="/brand/hero-character-tp.png"
                alt="tpaper character mascot"
                fill
                priority
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* 右侧交互上传区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <InteractiveDropzone onPaperReady={(paperId, customPaper) => onPaperReady(paperId, customPaper)} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
