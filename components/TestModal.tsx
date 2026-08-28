'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Check } from 'lucide-react';
import { generateStandaloneTestHtml } from '@/lib/html-generator';
import { SamplePaper, SAMPLE_PAPERS } from '@/lib/sample-papers';
import confetti from 'canvas-confetti';

interface TestModalProps {
  paperId: string | null;
  customPaper?: SamplePaper | null;
  onClose: () => void;
}

export function TestModal({ paperId, customPaper, onClose }: TestModalProps) {
  const [copied, setCopied] = useState(false);
  const [fetchedPaper, setFetchedPaper] = useState<SamplePaper | null>(null);

  // 如果客户端未直接传入 customPaper 且不是预设样例，则通过 API 动态获取
  useEffect(() => {
    if (paperId && !customPaper && !SAMPLE_PAPERS[paperId]) {
      fetch(`/api/papers/${paperId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.paper) {
            setFetchedPaper(data.paper);
          }
        })
        .catch(() => {});
    }
  }, [paperId, customPaper]);

  const paper: SamplePaper = useMemo(() => {
    if (customPaper) return customPaper;
    if (fetchedPaper) return fetchedPaper;
    if (paperId && SAMPLE_PAPERS[paperId]) {
      return SAMPLE_PAPERS[paperId];
    }
    return SAMPLE_PAPERS['calculus-midterm'];
  }, [paperId, customPaper, fetchedPaper]);

  // 同步生成 HTML 确保挂载即渲染
  const iframeSrcDoc = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return generateStandaloneTestHtml(paper, {
      gradingEndpoint: origin ? `${origin}/api/papers/grade` : undefined,
      parentOrigin: origin,
      logoSrc: '/tabbit-logo.jpg',
    });
  }, [paper]);

  const [progressInfo, setProgressInfo] = useState<{ answered: number; total: number; percent: number }>({
    answered: 0,
    total: paper.questions.length,
    percent: 0,
  });

  useEffect(() => {
    setProgressInfo({
      answered: 0,
      total: paper.questions.length,
      percent: 0,
    });
  }, [paper]);

  // 监听来自 iframe 的 postMessage 通信事件
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'TPAPER_PROGRESS') {
        setProgressInfo({
          answered: e.data.answered,
          total: e.data.total,
          percent: e.data.percent,
        });
      } else if (e.data.type === 'TPAPER_SUBMIT') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF9D1A', '#A6E22E', '#0F1115', '#FAF7F1'],
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!paperId) return null;

  const handleDownloadHtml = () => {
    const blob = new Blob([iframeSrcDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.id}-tpaper-artifact.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(`https://tpaper.tpgofighting.top/p/${paper.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="w-full max-w-5xl h-[92vh] bg-paper border-[2.5px] border-ink rounded-2xl shadow-[8px_8px_0px_#0F1115] flex flex-col overflow-hidden"
        >
          {/* 模态框头部 */}
          <div className="bg-paper-pure border-b-[2px] border-ink px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-display font-extrabold text-base px-2.5 py-0.5 rounded bg-ink text-paper border border-ink">
                TP 沙箱预览
              </span>
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-ink truncate max-w-xs sm:max-w-md">
                  {paper.title}
                </h3>
                <span className="font-mono text-[11px] text-slate">
                  答题进度：已作答 {progressInfo.answered} / 共 {progressInfo.total} 题 ({progressInfo.percent}%)
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadHtml}
                title="导出单文件 HTML 试卷"
                className="hidden sm:inline-flex btn-white py-1.5 px-3 text-xs font-mono"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出 .html 文件</span>
              </button>

              <button
                onClick={handleCopyShareUrl}
                className="btn-white py-1.5 px-3 text-xs font-mono"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>已复制链接！</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-orange" />
                    <span className="hidden sm:inline">复制分享链接</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border-[1.5px] border-ink bg-paper hover:bg-mist transition-colors text-ink shadow-[1.5px_1.5px_0px_#0F1115]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 沙箱 Iframe 容器 */}
          <div className="flex-1 bg-paper relative overflow-hidden">
            <iframe
              key={`${paper.id}-${paperId}`}
              title={paper.title}
              srcDoc={iframeSrcDoc}
              sandbox="allow-scripts"
              className="w-full h-full border-0 bg-paper"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
