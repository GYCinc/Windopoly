'use client';

import React, { useState } from 'react';
import { Dices, Sparkles } from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface DiceRollerProps {
  onRoll: (die1: number, die2: number) => void;
  disabled?: boolean;
  lastRoll?: [number, number] | null;
  currentTurnPlayerName: string;
}

export function DiceRoller({
  onRoll,
  disabled = false,
  lastRoll,
  currentTurnPlayerName,
}: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<[number, number]>(lastRoll || [1, 2]);

  const handleRoll = () => {
    if (disabled || isRolling) return;

    setIsRolling(true);
    SoundManager.playWindWhoosh();

    // Roll animation with clicking sound
    let counter = 0;
    const interval = setInterval(() => {
      const temp1 = Math.floor(Math.random() * 6) + 1;
      const temp2 = Math.floor(Math.random() * 6) + 1;
      setDisplayDice([temp1, temp2]);
      SoundManager.playDiceClick();
      counter++;

      if (counter > 8) {
        clearInterval(interval);
        const final1 = Math.floor(Math.random() * 6) + 1;
        const final2 = Math.floor(Math.random() * 6) + 1;
        setDisplayDice([final1, final2]);
        setIsRolling(false);
        onRoll(final1, final2);
      }
    }, 70);
  };

  // Dice dot pattern renderer
  const renderDots = (value: number) => {
    const dotsMap: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };
    const activeDots = dotsMap[value] || [4];

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 p-1 gap-0.5">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {activeDots.includes(i) ? (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  const isDoubles = displayDice[0] === displayDice[1];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dice Faces */}
      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 bg-white rounded-xl shadow-md border-2 border-slate-300 flex items-center justify-center transition-transform ${
            isRolling ? 'rotate-12 scale-105' : ''
          }`}
        >
          {renderDots(displayDice[0])}
        </div>

        <div
          className={`w-14 h-14 bg-white rounded-xl shadow-md border-2 border-slate-300 flex items-center justify-center transition-transform ${
            isRolling ? '-rotate-12 scale-105' : ''
          }`}
        >
          {renderDots(displayDice[1])}
        </div>

        <div className="text-left ml-2">
          <span className="text-xs uppercase font-bold text-slate-300 block">Total Move</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {displayDice[0] + displayDice[1]} tiles
          </span>
        </div>
      </div>

      {isDoubles && !isRolling && lastRoll && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          Doubles! Clean Energy Surge
        </div>
      )}

      {/* Roll Action Button */}
      <button
        type="button"
        onClick={handleRoll}
        disabled={disabled || isRolling}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2.5 ${
          disabled
            ? 'bg-slate-200 text-slate-600 cursor-not-allowed border border-slate-300'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-[0.98]'
        }`}
      >
        <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
        <span>{isRolling ? 'Rolling Wind Coordinates...' : `Roll Dice for ${currentTurnPlayerName}`}</span>
      </button>
    </div>
  );
}
