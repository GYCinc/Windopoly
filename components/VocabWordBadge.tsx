'use client';

import React, { useState } from 'react';
import { Volume2, BookOpen, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { VOCABULARY_DATABASE } from '@/lib/energy-data';
import { SoundManager } from '@/lib/audio';

interface VocabWordBadgeProps {
  vocabId: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onMastered?: (id: string) => void;
  isMastered?: boolean;
}

export function VocabWordBadge({
  vocabId,
  size = 'md',
  showDetails = false,
  onMastered,
  isMastered = false,
}: VocabWordBadgeProps) {
  const [expanded, setExpanded] = useState(showDetails);
  const [isPlaying, setIsPlaying] = useState(false);

  const item = VOCABULARY_DATABASE[vocabId.toLowerCase()];
  if (!item) {
    return <span className="font-semibold text-emerald-700 underline decoration-dotted">{vocabId}</span>;
  }

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    SoundManager.speak(`${item.word}. ${item.simpleDefinition}`, 0.85, () => {
      setIsPlaying(false);
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className={`inline-block my-1 transition-all ${expanded ? 'w-full' : ''}`}>
      {/* Compact Word Chip */}
      <div
        onClick={handleToggle}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer select-none transition-all ${
          expanded
            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-sm'
            : 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900'
        }`}
        title="Tap to learn definition & pronunciation"
      >
        <button
          type="button"
          onClick={handleSpeak}
          aria-label={`Listen to pronunciation of ${item.word}`}
          className={`p-1 rounded-md transition-colors ${
            isPlaying ? 'bg-emerald-500 text-white animate-pulse' : 'text-emerald-700 hover:bg-emerald-200/80'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>

        <span className="font-bold text-sm tracking-tight underline decoration-dotted decoration-emerald-400 underline-offset-2">
          {item.word}
        </span>

        <span className="text-xs text-emerald-700/80 font-mono hidden sm:inline">
          {item.phonetic}
        </span>

        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-800">
          {item.cefrLevel}
        </span>

        {isMastered && (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
        )}

        <span className="text-emerald-700 ml-0.5">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </div>

      {/* Progressive Disclosure: Nested Plain English Explanation Card */}
      {expanded && (
        <div className="mt-2 p-3.5 bg-white border border-emerald-200 rounded-xl shadow-sm text-left animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-emerald-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900">{item.word}</span>
                <span className="text-xs font-mono text-slate-500">{item.phonetic}</span>
                <span className="text-xs text-slate-400">({item.syllables})</span>
              </div>
              <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                {item.partOfSpeech} • CEFR {item.cefrLevel} Level
              </span>
            </div>

            <button
              type="button"
              onClick={handleSpeak}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen
            </button>
          </div>

          <div className="mt-2.5 space-y-2 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Simple Definition:</span>
              <p className="text-slate-800 font-medium leading-relaxed">{item.simpleDefinition}</p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs font-semibold text-teal-800 uppercase tracking-wide block">Energy Context:</span>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{item.energyContext}</p>
            </div>

            <div className="text-xs text-slate-600 italic">
              &quot;{item.exampleSentence}&quot;
            </div>

            <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900">
              <span className="font-semibold text-amber-800">Business English Tip: </span>
              {item.businessTip}
            </div>
          </div>

          {onMastered && !isMastered && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  SoundManager.playSuccessChime();
                  onMastered(item.id);
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                Mark as Practiced (+5 XP)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
