'use client';

import React from 'react';
import { FileSearch, Code, PlayCircle, Share2 } from 'lucide-react';

export function HowItWorksComic() {
  const steps = [
    {
      num: '01',
      title: 'READ / 读取',
      subtitle: '支持任意原始资料',
      description: 'PDF、Word 试卷、扫描试卷、手机拍摄的习题图片。多模态 AI 智能提取题目、公式与图表，不错漏关键信息。',
      icon: FileSearch,
      accent: 'border-b-4 border-b-orange',
      badge: 'bg-orange-light text-ink',
    },
    {
      num: '02',
      title: 'BUILD / 构建',
      subtitle: 'TP 设计并编写试卷网页',
      description: '无需繁琐的题库录入与字段映射。Agent 自主设计最匹配该试卷的答题排版，直接生成单文件 HTML 产物。',
      icon: Code,
      accent: 'border-b-4 border-b-lime',
      badge: 'bg-lime-light text-ink',
    },
    {
      num: '03',
      title: 'ANSWER / 作答',
      subtitle: '像真实在线考场一样答题',
      description: '支持单选、多选、填空、数学公式，内置考试倒计时，点击提交即可完成自动批改与逐题详细解析。',
      icon: PlayCircle,
      accent: 'border-b-4 border-b-orange',
      badge: 'bg-orange-light text-ink',
    },
    {
      num: '04',
      title: 'SHARE / 分享',
      subtitle: '一键发布，随时随地开练',
      description: '生成独立固定短链接（如 tpaper.co/p/calc-midterm）。学生、同行或学习小组点击即可直接作答。',
      icon: Share2,
      accent: 'border-b-4 border-b-ink',
      badge: 'bg-mist text-ink',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-t-[2px] border-ink bg-paper-warm/40 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 区域标题 */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink px-3 py-1 bg-paper-pure border-[1.5px] border-ink rounded-full shadow-[2px_2px_0px_#0F1115] mb-3">
            <span>04 / AGENT 工作流</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-ink tracking-tight">
            tpaper 自动化生成流水线
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate font-medium">
            从原始文档到高质量交互式网页的 4 步全自动闭环。
          </p>
        </div>

        {/* 4 步漫画分镜卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`paper-card p-6 flex flex-col justify-between relative group ${step.accent}`}
              >
                <div>
                  {/* 分镜头部 */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono font-black text-2xl text-ink">
                      {step.num}
                    </span>
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border border-ink ${step.badge}`}>
                      {step.title}
                    </span>
                  </div>

                  {/* 图标 */}
                  <div className="w-12 h-12 rounded-xl bg-paper border-[1.5px] border-ink flex items-center justify-center mb-4 shadow-[2px_2px_0px_#0F1115] group-hover:bg-orange-light transition-colors">
                    <Icon className="w-6 h-6 text-ink" />
                  </div>

                  {/* 标题与描述 */}
                  <h3 className="font-display font-bold text-lg text-ink mb-2">
                    {step.subtitle}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-slate leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-mist font-mono text-[11px] font-bold text-slate">
                  AI 自主闭环节点
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
