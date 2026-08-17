'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';

export function BeforeAfterSection() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (opt: string) => {
    setSelectedOption(opt);
    setShowExplanation(true);
  };

  return (
    <section id="before-after" className="py-16 sm:py-24 border-t-[2px] border-ink bg-paper relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 区域标题 */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink px-3 py-1 bg-paper-pure border-[1.5px] border-ink rounded-full shadow-[2px_2px_0px_#0F1115] mb-3">
            <span>03 / 前后对比</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-ink tracking-tight">
            同样的题目，全新的答题体验
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate font-medium">
            把枯燥密集的黑白扫描卷，直接转化为充满交互感的高颜值在线网页。
          </p>
        </div>

        {/* 左右并列对比卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 转换前 Column */}
          <div className="lg:col-span-5 paper-card p-6 bg-[#F3F0E8] border-dashed flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-ink/20 mb-4">
                <span className="font-mono font-bold text-xs bg-ink/10 text-slate-dark px-2.5 py-1 rounded">
                  BEFORE: 传统静态扫描 PDF
                </span>
                <span className="text-xs text-slate font-mono">第 4 页 / 共 12 页</span>
              </div>

              {/* 模拟扫描试卷 */}
              <div className="space-y-4 opacity-75 font-serif text-sm leading-relaxed text-gray-800 select-none">
                <div className="p-3 bg-white/60 border border-gray-300 rounded font-mono text-xs">
                  <p className="font-bold mb-1">12. (本题10分) 极限与连续性求解</p>
                  <p className="italic text-gray-700">
                    设函数 f(x) 在 x=0 处连续，求极限 lim [sin(3x) / x] 当 x→0 时的值：
                  </p>
                  <div className="my-2 pl-2 border-l-2 border-gray-400 font-serif">
                    (A) 0 &nbsp;&nbsp;&nbsp;&nbsp; (B) 1 &nbsp;&nbsp;&nbsp;&nbsp; (C) 3 &nbsp;&nbsp;&nbsp;&nbsp; (D) 不存在
                  </div>
                  <div className="h-12 border border-dashed border-gray-400 bg-gray-50/50 rounded flex items-center justify-center text-gray-400 text-xs">
                    [手写答题卷空白区域...]
                  </div>
                </div>

                <div className="p-3 bg-white/40 border border-gray-300 rounded font-mono text-xs opacity-60">
                  <p className="font-bold">13. 计算定积分 ∫₀² (3x² - 2x + 1) dx = _______</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink/10 font-mono text-xs text-slate flex items-center gap-2">
              <X className="w-4 h-4 text-red-500 shrink-0" />
              <span>手机端阅读费劲 · 无法即时反馈 · 批改极其繁琐</span>
            </div>
          </div>

          {/* 中间转换徽章 */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 lg:py-0">
            <div className="w-12 h-12 rounded-full bg-orange border-[2px] border-ink flex items-center justify-center font-display font-black text-lg text-ink shadow-[3px_3px_0px_#0F1115]">
              TP
            </div>
            <span className="font-mono text-xs font-bold text-ink mt-2 text-center">
              AI 智能转换
            </span>
          </div>

          {/* 转换后 Column (交互式) */}
          <div className="lg:col-span-5 paper-card p-6 bg-paper-pure shadow-[6px_6px_0px_#FF9D1A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-mist mb-4">
                <span className="font-mono font-bold text-xs bg-lime text-ink px-2.5 py-1 rounded border border-ink shadow-[1px_1px_0px_#0F1115]">
                  AFTER: 在线交互式试卷
                </span>
                <span className="font-mono text-xs font-bold text-ink bg-mist px-2 py-0.5 rounded">
                  ⏱️ 02:45
                </span>
              </div>

              {/* 交互试题卡片 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-ink text-paper px-2 py-0.5 rounded">
                    第 12 题
                  </span>
                  <span className="font-mono text-xs font-bold text-slate">单选题 · 10 分</span>
                </div>

                <p className="font-sans font-bold text-sm text-ink">
                  求当 x 趋近于 0 时的函数极限：
                </p>

                {/* 公式展示 */}
                <div className="p-3 bg-paper border-[1.5px] border-ink rounded-xl font-mono text-center text-sm font-bold text-ink">
                  lim(x → 0) [ sin(3x) / x ] = ?
                </div>

                {/* 实时选择选项 */}
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {[
                    { key: 'A', text: '0' },
                    { key: 'B', text: '1' },
                    { key: 'C', text: '3' },
                    { key: 'D', text: '不存在' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSelect(opt.key)}
                      className={`p-2.5 rounded-lg border-[1.5px] border-ink font-bold text-left transition-all flex items-center justify-between ${
                        selectedOption === opt.key
                          ? opt.key === 'C'
                            ? 'bg-lime-light border-lime shadow-[2px_2px_0px_#0F1115]'
                            : 'bg-red-50 border-red-500 shadow-[2px_2px_0px_#0F1115]'
                          : 'bg-paper hover:bg-orange-light'
                      }`}
                    >
                      <span>
                        <span className="text-slate mr-1">{opt.key}.</span> {opt.text}
                      </span>
                      {selectedOption === opt.key && (
                        opt.key === 'C' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <X className="w-3.5 h-3.5 text-red-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* 即时解析展开 */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-paper border-[1.5px] border-ink rounded-xl text-xs"
                  >
                    <div className="font-bold text-ink flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-orange" />
                      <span>{selectedOption === 'C' ? '✓ 回答正确！' : '✗ 答案不正确'}</span>
                    </div>
                    <p className="text-slate font-medium">
                      原式变形为 3 × [sin(3x) / (3x)]。由重要极限 lim(u→0) sin(u)/u = 1，可得结果为 3 × 1 = 3。
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-mist font-mono text-xs text-slate-dark flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>多端自适应 · 提交即刻出分 · 生成独立分享链接</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
