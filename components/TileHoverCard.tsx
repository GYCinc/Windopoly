'use client';

import React from 'react';
import { PropertyDeed } from '@/lib/monopoly-board-data';
import { PlayerState } from './MonopolyBoard';
import {
  Wind,
  Zap,
  Volume2,
  BookOpen,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface TileHoverCardProps {
  deed: PropertyDeed | null;
  owner?: PlayerState;
  weatherMultiplier?: number;
}

export function TileHoverCard({ deed, owner, weatherMultiplier = 1 }: TileHoverCardProps) {
  if (!deed) return null;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    SoundManager.speak(`${deed.vocabWord}. ${deed.definition}`);
  };

  const adjustedRent = deed.rent ? Math.round(deed.rent * weatherMultiplier) : null;

  return (
    <div className="pointer-events-auto bg-slate-950/92 border border-emerald-500/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl p-4 text-white w-76 sm:w-84 z-40">
      {/* Top Header Strip with Color Bar */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white/60"
            style={{ backgroundColor: deed.colorHex }}
          />
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white leading-tight uppercase tracking-tight font-sans">
              {deed.name}
            </h4>
            <span className="text-[10px] text-slate-400 capitalize font-medium">
              {deed.group.replace('_', ' ')} • {deed.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {deed.price && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-black">
            ${deed.price}M
          </span>
        )}
      </div>

      {/* ESL Vocabulary Word Spotlight */}
      <div className="my-2.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black text-white">{deed.vocabWord}</span>
            <span className="text-[10px] text-slate-400 font-mono">{deed.phonetic}</span>
            <span className="text-[9px] text-amber-300 font-semibold italic">({deed.partOfSpeech})</span>
          </div>
          <button
            type="button"
            onClick={handleSpeak}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Listen to pronunciation"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        <p className="text-[11px] text-slate-200 mt-1 leading-snug">
          {deed.definition}
        </p>
      </div>

      {/* Financials & Owner Information */}
      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
        <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block font-semibold">Current Base Rent:</span>
          {adjustedRent ? (
            <span className="font-mono font-bold text-amber-400 text-[11px]">
              ${adjustedRent}M {weatherMultiplier !== 1 && `(${Math.round(weatherMultiplier * 100)}% Tariff)`}
            </span>
          ) : (
            <span className="text-slate-500">N/A</span>
          )}
        </div>

        <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block font-semibold">Ownership:</span>
          {owner ? (
            <div className="flex items-center gap-1 mt-0.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: owner.color }}
              />
              <span className="font-bold text-white truncate text-[11px]">
                {owner.name}
              </span>
            </div>
          ) : deed.price ? (
            <span className="text-emerald-400 font-bold text-[11px]">Unclaimed Parcel</span>
          ) : (
            <span className="text-slate-500">Public Utility</span>
          )}
        </div>
      </div>

      <div className="mt-2 text-[9px] text-slate-400 text-center italic">
        Click space to open full Title Deed Pamphlet
      </div>
    </div>
  );
}
