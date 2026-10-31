'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SoundManager } from '@/lib/audio';
import { Sparkles, Dices } from 'lucide-react';

interface RealDice3DProps {
  onRollComplete: (die1: number, die2: number) => void;
  disabled?: boolean;
  playerName: string;
}

export function RealDice3D({ onRollComplete, disabled = false, playerName }: RealDice3DProps) {
  const [die1, setDie1] = useState(3);
  const [die2, setDie2] = useState(4);
  const [isRolling, setIsRolling] = useState(false);
  const [rotations1, setRotations1] = useState({ x: 0, y: 0 });
  const [rotations2, setRotations2] = useState({ x: 0, y: 0 });
  const [lastTotal, setLastTotal] = useState<number | null>(null);
  const [isDoubles, setIsDoubles] = useState(false);

  // Map 1-6 values to final 3D rotations [rotateX, rotateY]
  const faceRotations: Record<number, [number, number]> = {
    1: [0, 0], // Front face
    2: [0, -90], // Right face
    3: [-90, 0], // Top face
    4: [90, 0], // Bottom face
    5: [0, 90], // Left face
    6: [180, 0], // Back face
  };

  const rollDice = () => {
    if (disabled || isRolling) return;
    setIsRolling(true);
    SoundManager.playWindWhoosh();

    let audioTicks = 0;
    const clickInterval = setInterval(() => {
      SoundManager.playDiceClick();
      audioTicks++;
      if (audioTicks > 5) clearInterval(clickInterval);
    }, 120);

    const final1 = Math.floor(Math.random() * 6) + 1;
    const final2 = Math.floor(Math.random() * 6) + 1;
    const doubles = final1 === final2;

    const spinsX1 = (Math.floor(Math.random() * 3) + 3) * 360 + faceRotations[final1][0];
    const spinsY1 = (Math.floor(Math.random() * 3) + 3) * 360 + faceRotations[final1][1];

    const spinsX2 = (Math.floor(Math.random() * 3) + 3) * 360 + faceRotations[final2][0];
    const spinsY2 = (Math.floor(Math.random() * 3) + 3) * 360 + faceRotations[final2][1];

    setRotations1({ x: spinsX1, y: spinsY1 });
    setRotations2({ x: spinsX2, y: spinsY2 });

    setTimeout(() => {
      setDie1(final1);
      setDie2(final2);
      setLastTotal(final1 + final2);
      setIsDoubles(doubles);
      setIsRolling(false);
      SoundManager.playSuccessChime();
      onRollComplete(final1, final2);
    }, 1000);
  };

  const rollDiceRef = useRef(rollDice);
  useEffect(() => {
    rollDiceRef.current = rollDice;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !disabled && !isRolling) {
        e.preventDefault();
        rollDiceRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isRolling]);

  const renderFacePips = (faceNum: number) => {
    const pipsMap: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };
    const activePips = pipsMap[faceNum] || [4];

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-1 gap-0.5 pointer-events-none">
        {[...Array(9)].map((_, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {activePips.includes(idx) && (
              <div className="w-2 h-2 rounded-full bg-slate-950 shadow-inner" />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Cube half-size is 24px (die is 48px x 48px)
  const halfSize = '24px';

  return (
    <div className="flex flex-col items-center justify-center select-none my-0.5">
      {/* 3D Dice Felt Arena with Precision Bezel */}
      <div
        onClick={rollDice}
        className={`relative w-44 h-20 sm:w-52 sm:h-24 rounded-2xl bg-gradient-to-b from-[#0c1a11] via-[#08130c] to-[#0a170e] border border-emerald-500/30 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8),0_8px_20px_rgba(0,0,0,0.25)] flex items-center justify-center gap-5 sm:gap-7 cursor-pointer overflow-hidden transition-all ${
          disabled ? 'opacity-65 cursor-default' : 'hover:border-emerald-400/60 active:scale-[0.99]'
        }`}
        style={{ perspective: '800px' }}
        title={disabled ? 'Waiting for turn...' : 'Click or Press Spacebar to Roll!'}
      >
        {/* Felt Texture subtle pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />

        {/* Die 1 */}
        <div
          className="relative w-12 h-12 transition-transform ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotations1.x}deg) rotateY(${rotations1.y}deg)`,
            transitionDuration: isRolling ? '1s' : '0.15s',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-[#faf8f2] rounded-lg border border-[#ded9cf] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_4px_8px_rgba(0,0,0,0.2)] flex items-center justify-center"
            style={{ transform: `translateZ(${halfSize})` }}
          >
            {renderFacePips(1)}
          </div>
          {/* Right */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateY(90deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(2)}
          </div>
          {/* Top */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateX(90deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(3)}
          </div>
          {/* Bottom */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateX(-90deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(4)}
          </div>
          {/* Left */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateY(-90deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(5)}
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateY(180deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(6)}
          </div>
        </div>

        {/* Die 2 */}
        <div
          className="relative w-12 h-12 transition-transform ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotations2.x}deg) rotateY(${rotations2.y}deg)`,
            transitionDuration: isRolling ? '1s' : '0.15s',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `translateZ(${halfSize})` }}
          >
            {renderFacePips(1)}
          </div>
          {/* Right */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateY(90deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(2)}
          </div>
          {/* Top */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateX(90deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(3)}
          </div>
          {/* Bottom */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateX(-90deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(4)}
          </div>
          {/* Left */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateY(-90deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(5)}
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-white rounded-lg border border-slate-300 shadow-md flex items-center justify-center"
            style={{ transform: `rotateY(180deg) translateZ(${halfSize})` }}
          >
            {renderFacePips(6)}
          </div>
        </div>

        {/* Rolling overlay indicator */}
        {isRolling && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs font-black tracking-widest text-amber-300 uppercase animate-pulse">
              Rolling...
            </span>
          </div>
        )}
      </div>

      {/* Result & Roll Trigger Button */}
      <div className="mt-2 flex flex-col items-center gap-1.5 w-full">
        {lastTotal !== null && !isRolling && (
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
              Dispatched:
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-950 font-mono bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300/80 shadow-xs">
              {die1} + {die2} = {lastTotal} Spaces
            </span>
            {isDoubles && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wide animate-bounce flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" /> Grid Frequency Match!
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={rollDice}
          disabled={disabled || isRolling}
          className={`py-2 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
            disabled
              ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-slate-600/60'
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-emerald-950/40 cursor-pointer ring-1 ring-emerald-400/40'
          }`}
        >
          <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'Rolling...' : `Roll Dice for ${playerName}`}</span>
          <span className="text-[10px] opacity-75 font-mono hidden sm:inline">(Space)</span>
        </button>
      </div>
    </div>
  );
}
