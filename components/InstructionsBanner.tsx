'use client';

import React from 'react';
import { Compass, Volume2, Lightbulb } from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface InstructionsBannerProps {
  phase: 'roll' | 'decision' | 'event' | 'maintenance' | 'end';
  stepTitle: string;
  instructionText: string;
  tipText?: string;
  activePlayerName: string;
}

export function InstructionsBanner({
  phase,
  stepTitle,
  instructionText,
  tipText,
  activePlayerName,
}: InstructionsBannerProps) {
  const handleSpeakInstruction = () => {
    SoundManager.speak(`${stepTitle}. ${instructionText} ${tipText ? tipText : ''}`, 0.9);
  };

  const getStepNumber = () => {
    switch (phase) {
      case 'roll':
        return 'Step 1';
      case 'decision':
      case 'event':
        return 'Step 2';
      case 'maintenance':
        return 'Step 3';
      case 'end':
        return 'Ready';
    }
  };

  return (
    <div className="bg-emerald-950 text-white border-b border-emerald-800/80 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-800/80 px-2.5 py-1 rounded-lg border border-emerald-600/50 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-emerald-300" />
            <span>{getStepNumber()}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-300 font-semibold">
                Turn: <strong className="text-white">{activePlayerName}</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs uppercase font-bold tracking-wide text-emerald-400">
                {stepTitle}
              </span>
            </div>
            <p className="text-sm md:text-base font-semibold text-slate-100 mt-0.5 leading-snug">
              {instructionText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tipText && (
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-700/50 px-3 py-1.5 rounded-lg text-xs text-emerald-200">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{tipText}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSpeakInstruction}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition-colors shrink-0"
            title="Read instructions aloud"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Read Aloud</span>
          </button>
        </div>
      </div>
    </div>
  );
}
