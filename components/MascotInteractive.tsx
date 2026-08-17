'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MascotProps {
  mood?: 'idle' | 'uploading' | 'processing' | 'done' | 'excited';
  size?: 'sm' | 'md' | 'lg';
  showSpeech?: boolean;
  speechText?: string;
}

export function MascotInteractive({
  mood = 'idle',
  size = 'md',
  showSpeech = true,
  speechText,
}: MascotProps) {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const mascotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - mascotCenterX;
      const deltaY = e.clientY - mascotCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      const maxOffset = 6;
      if (distance === 0) return;
      const factor = Math.min(distance / 200, 1);
      setPupilOffset({
        x: (deltaX / distance) * maxOffset * factor,
        y: (deltaY / distance) * maxOffset * factor,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
  };

  const defaultSpeech = {
    idle: '好奇心满满！把试卷扔给我吧。',
    uploading: '收到！直接松开鼠标即可！',
    processing: '正在解析题目与数学公式... ✦',
    done: '你的试卷已经变活了！✓',
    excited: '满分达成！太棒啦！🎉',
  }[mood];

  return (
    <div className="relative inline-flex flex-col items-center select-none" ref={mascotRef}>
      {/* Speech Bubble */}
      {showSpeech && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          key={speechText || defaultSpeech}
          className="mb-2 bg-paper-pure border-[1.5px] border-ink px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-ink shadow-[2px_2px_0px_#0F1115] relative"
        >
          {speechText || defaultSpeech}
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-paper-pure border-r-[1.5px] border-b-[1.5px] border-ink rotate-45" />
        </motion.div>
      )}

      {/* Mascot SVG Character */}
      <motion.div
        animate={
          mood === 'processing'
            ? { y: [0, -6, 0], rotate: [-2, 2, -2] }
            : mood === 'excited'
            ? { y: [0, -10, 0], scale: [1, 1.08, 1] }
            : { y: [0, -3, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: mood === 'processing' ? 0.8 : 2.5,
          ease: 'easeInOut',
        }}
        className={`relative ${sizeClasses[size]} cursor-pointer`}
      >
        <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-[2px_3px_0px_rgba(15,17,21,0.15)]">
          {/* Antenna */}
          <g>
            <motion.path
              d="M 80 40 Q 80 18 80 12"
              fill="none"
              stroke="#0F1115"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
            <circle cx="80" cy="10" r="7" fill="#A6E22E" stroke="#0F1115" strokeWidth="3.5" />
          </g>

          {/* Lime Blob Body */}
          <path
            d="M 30 115 
               C 15 110, 10 90, 20 65 
               C 28 42, 50 35, 80 35 
               C 110 35, 132 42, 140 65 
               C 150 90, 145 110, 130 115 
               C 115 120, 100 118, 80 118 
               C 60 118, 45 120, 30 115 Z"
            fill="#A6E22E"
            stroke="#0F1115"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Highlight Spec */}
          <path
            d="M 35 55 C 38 48, 50 44, 65 43"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Left Eye */}
          <g>
            <circle cx="58" cy="72" r="16" fill="#FFFFFF" stroke="#0F1115" strokeWidth="3.5" />
            <circle
              cx={58 + pupilOffset.x}
              cy={72 + pupilOffset.y}
              r="8"
              fill="#0F1115"
            />
            <circle
              cx={56 + pupilOffset.x * 0.8}
              cy={69 + pupilOffset.y * 0.8}
              r="3"
              fill="#FFFFFF"
            />
          </g>

          {/* Right Eye */}
          <g>
            <circle cx="102" cy="72" r="16" fill="#FFFFFF" stroke="#0F1115" strokeWidth="3.5" />
            <circle
              cx={102 + pupilOffset.x}
              cy={72 + pupilOffset.y}
              r="8"
              fill="#0F1115"
            />
            <circle
              cx={100 + pupilOffset.x * 0.8}
              cy={69 + pupilOffset.y * 0.8}
              r="3"
              fill="#FFFFFF"
            />
          </g>

          {/* Mouth */}
          {mood === 'excited' || mood === 'done' ? (
            <path
              d="M 70 94 Q 80 108 90 94"
              fill="#FF9D1A"
              stroke="#0F1115"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : mood === 'processing' ? (
            <ellipse cx="80" cy="95" rx="5" ry="6" fill="#0F1115" />
          ) : (
            <path
              d="M 72 94 Q 80 102 88 94"
              fill="none"
              stroke="#0F1115"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Cheeks */}
          <circle cx="38" cy="85" r="4" fill="#FF9D1A" opacity="0.6" />
          <circle cx="122" cy="85" r="4" fill="#FF9D1A" opacity="0.6" />
        </svg>
      </motion.div>
    </div>
  );
}
