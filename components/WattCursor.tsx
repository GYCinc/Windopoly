'use client';

import React, { useEffect, useState } from 'react';

export function WattCursor() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if interactive
      const isClickable =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer');
      setIsPointer(!!isClickable);

      // Check for custom cursor word cues
      const buttonEl = target.closest('button');
      if (target.closest('[data-cursor-text]')) {
        const textElement = target.closest('[data-cursor-text]') as HTMLElement;
        setCursorText(textElement.dataset.cursorText || '');
      } else if (buttonEl && buttonEl.textContent?.toLowerCase().includes('roll')) {
        setCursorText('ROLL');
      } else {
        setCursorText('');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible || !position) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {/* Glowing Energy Aura */}
      <div
        className={`rounded-full transition-all duration-150 flex items-center justify-center font-black uppercase tracking-wider ${
          cursorText
            ? 'px-2.5 py-1 bg-amber-400 text-slate-950 text-[10px] shadow-lg shadow-amber-500/50 scale-110'
            : isPointer
            ? 'w-7 h-7 bg-amber-400/80 shadow-lg shadow-amber-400/60 ring-2 ring-white scale-125'
            : 'w-4 h-4 bg-emerald-400/70 shadow-md shadow-emerald-400/40 ring-1 ring-white'
        }`}
      >
        {cursorText && <span>{cursorText}</span>}
      </div>
    </div>
  );
}
