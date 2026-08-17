'use client';

import React, { useState } from 'react';
import { Copy, Check, Clock, Award, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function ExperienceCardsSection() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'q1' | 'q2'>('q1');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>('B');

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF9D1A', '#A6E22E', '#0F1115', '#FAF7F1'],
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://tpaper.tpgofighting.top/p/calculus-midterm');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="experience" className="py-16 sm:py-24 border-t-[2px] border-ink bg-paper relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 区域标题 */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink px-3 py-1 bg-paper-pure border-[1.5px] border-ink rounded-full shadow-[2px_2px_0px_#0F1115] mb-3">
            <span>05 / 交互产物能力</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-ink tracking-tight">
            不仅是 PDF 阅读器，更是真正的交互式网页
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate font-medium">
            每个生成的试卷产物都是一个轻量、自包含的交互式 Web 网页应用。
          </p>
        </div>

        {/* 模块化交互能力卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 卡片 1: 智能题卡与实时选项切换 */}
          <div className="md:col-span-2 paper-card p-6 bg-paper-pure flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-mist mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-ink text-paper px-2 py-0.5 rounded">
                    模块 01
                  </span>
                  <span className="font-display font-bold text-sm text-ink">
                    智能试题卡片
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('q1');
                      setSelectedAnswer('B');
                    }}
                    className={`font-mono text-xs px-2.5 py-1 rounded border border-ink ${
                      activeTab === 'q1' ? 'bg-orange text-ink font-bold' : 'bg-paper text-slate'
                    }`}
                  >
                    第 1 题
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('q2');
                      setSelectedAnswer(null);
                    }}
                    className={`font-mono text-xs px-2.5 py-1 rounded border border-ink ${
                      activeTab === 'q2' ? 'bg-orange text-ink font-bold' : 'bg-paper text-slate'
                    }`}
                  >
                    第 2 题
                  </button>
                </div>
              </div>

              {activeTab === 'q1' ? (
                <div className="space-y-3">
                  <p className="font-sans font-bold text-sm sm:text-base text-ink">
                    求导数：求函数 f(x) = e^(2x) · cos(x) 在 x = 0 处的一阶导数值：
                  </p>
                  <div className="p-2.5 bg-paper border-[1.5px] border-ink rounded-lg font-mono text-xs text-center font-bold text-ink">
                    f&apos;(0) 其中 f(x) = e^(2x)cos(x)
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    {[
                      { key: 'A', text: '1' },
                      { key: 'B', text: '2 (正确答案)' },
                      { key: 'C', text: '-1' },
                      { key: 'D', text: '0' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setSelectedAnswer(opt.key)}
                        className={`p-2.5 rounded-lg border-[1.5px] border-ink text-left font-bold transition-all ${
                          selectedAnswer === opt.key
                            ? 'bg-lime-light border-lime shadow-[2px_2px_0px_#0F1115]'
                            : 'bg-paper-pure hover:bg-paper'
                        }`}
                      >
                        <span className="text-slate mr-1">{opt.key}.</span> {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-sans font-bold text-sm sm:text-base text-ink">
                    定积分计算填空题：
                  </p>
                  <div className="p-2.5 bg-paper border-[1.5px] border-ink rounded-lg font-mono text-xs text-center font-bold text-ink">
                    ∫₀² (3x² - 2x + 1) dx
                  </div>
                  <input
                    type="text"
                    defaultValue="6"
                    className="w-full p-2.5 bg-paper border-[1.5px] border-ink rounded-lg font-mono text-xs font-bold outline-none focus:border-orange"
                    placeholder="输入计算所得的整数..."
                  />
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-mist font-mono text-xs text-slate flex items-center justify-between">
              <span>选项双向绑定 · KaTeX 公式实时渲染</span>
              <span className="text-orange font-bold">可实时操作组件</span>
            </div>
          </div>

          {/* 卡片 2: 实时判分与彩带庆祝 */}
          <div className="paper-card p-6 bg-paper-pure flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-mist mb-4">
                <Award className="w-4 h-4 text-orange" />
                <span className="font-display font-bold text-sm text-ink">
                  即时自动评分
                </span>
              </div>

              <div className="text-center py-4">
                <div className="inline-block p-4 rounded-2xl bg-lime-light border-[2px] border-ink shadow-[4px_4px_0px_#0F1115] mb-3">
                  <span className="font-display font-black text-4xl sm:text-5xl text-ink">
                    92
                  </span>
                  <span className="font-mono text-xs font-bold text-slate ml-1">/ 100 分</span>
                </div>

                <p className="font-mono text-xs font-bold text-emerald-800">
                  评级 A · 5 道题已全部完成
                </p>
              </div>
            </div>

            <button
              onClick={triggerConfetti}
              className="btn-primary w-full py-2.5 text-xs font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange" />
              <span>测试放彩带庆祝 🎉</span>
            </button>
          </div>

          {/* 卡片 3: 答题计时器 */}
          <div className="paper-card p-6 bg-paper-pure flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-mist mb-4">
                <Clock className="w-4 h-4 text-orange" />
                <span className="font-display font-bold text-sm text-ink">
                  考试倒计时模块
                </span>
              </div>

              <div className="text-center py-4">
                <div className="font-mono font-black text-3xl sm:text-4xl text-ink bg-paper border-[1.5px] border-ink rounded-xl py-3 shadow-[2px_2px_0px_#0F1115]">
                  28:45
                </div>
                <span className="font-mono text-[11px] text-slate font-semibold mt-2 block">
                  支持自定义考试时长与到时自动交卷
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-mist font-mono text-xs text-slate-dark font-bold text-center">
              内置轻量定时器 Worker
            </div>
          </div>

          {/* 卡片 4: 一键发布与链接分享 */}
          <div className="md:col-span-2 paper-card p-6 bg-paper-pure flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-mist mb-4">
                <Share2 className="w-4 h-4 text-orange" />
                <span className="font-display font-bold text-sm text-ink">
                  一键发布与多端链接分享
                </span>
              </div>

              <p className="font-sans text-xs sm:text-sm text-slate mb-4">
                每份试卷发布为独立、隔离的永久链接。可直接发给学生、同学或学习群组：
              </p>

              <div className="flex items-center gap-2 bg-paper border-[1.5px] border-ink rounded-xl p-2 shadow-[2px_2px_0px_#0F1115]">
                <span className="font-mono text-xs text-ink font-bold truncate flex-1 px-2">
                  https://tpaper.tpgofighting.top/p/calculus-midterm
                </span>
                <button
                  onClick={handleCopyLink}
                  className="btn-white py-1.5 px-3 text-xs font-mono shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>已复制！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制链接</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-mist font-mono text-xs text-slate flex items-center justify-between">
              <span>做题者无需注册登录即可作答</span>
              <span className="text-emerald-700 font-bold">支持公开或私密发布</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
