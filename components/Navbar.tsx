'use client';

import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  onOpenDemo?: () => void;
}

export function Navbar({ onOpenDemo }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b-[2px] border-ink bg-paper/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-ink text-paper font-display font-extrabold text-xl px-2.5 py-1 rounded-lg border-[1.5px] border-ink group-hover:bg-orange group-hover:text-ink transition-colors duration-150 shadow-[2px_2px_0px_#0F1115]">
            TP
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-ink">
            tpaper
          </span>
          <span className="hidden sm:inline-block font-mono text-xs px-2 py-0.5 rounded-full border border-ink/20 bg-mist font-semibold text-slate-dark">
            AI 交互试卷生成器
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-ink">
          <Link href="/#the-idea" className="hover:text-orange transition-colors">
            核心理念
          </Link>
          <Link href="/#before-after" className="hover:text-orange transition-colors">
            前后对比
          </Link>
          <Link href="/#how-it-works" className="hover:text-orange transition-colors">
            工作流程
          </Link>
          <Link href="/#experience" className="hover:text-orange transition-colors">
            交互产物
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDemo}
            className="btn-primary py-2 px-4 sm:px-6 text-xs sm:text-sm"
          >
            <span>体验演示</span>
            <span className="text-orange">→</span>
          </button>
        </div>
      </div>
    </header>
  );
}
