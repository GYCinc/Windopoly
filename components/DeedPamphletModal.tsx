'use client';

import React, { useState } from 'react';
import { PropertyDeed } from '@/lib/monopoly-board-data';
import { SoundManager } from '@/lib/audio';
import {
  Volume2,
  X,
  Zap,
  HelpCircle,
  CheckCircle,
  FileText,
  ChevronRight,
  Maximize2,
  RotateCw,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeedPamphletModalProps {
  deed: PropertyDeed;
  ownerName: string | null;
  ownerColor?: string;
  isCurrentPlayerOwner: boolean;
  canBuy: boolean;
  playerMoney: number;
  upgradesCount?: number; // 0 to 5
  weatherMultiplier?: number;
  onBuy: () => void;
  onUpgrade: () => void;
  onPayRent: (amount: number) => void;
  onClose: () => void;
  onAwardBonus?: (amount: number) => void;
}

export function DeedPamphletModal({
  deed,
  ownerName,
  ownerColor,
  isCurrentPlayerOwner,
  canBuy,
  playerMoney,
  upgradesCount = 0,
  weatherMultiplier = 1.0,
  onBuy,
  onUpgrade,
  onPayRent,
  onClose,
  onAwardBonus,
}: DeedPamphletModalProps) {
  const [isPamphletExpanded, setIsPamphletExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<'schematic' | 'collocations'>('schematic');

  const baseRent = deed.rent || 10;
  const currentRent =
    upgradesCount > 0 && deed.multUpgrades && deed.multUpgrades[upgradesCount - 1]
      ? deed.multUpgrades[upgradesCount - 1]
      : baseRent;
  const weatherAdjustedRent = Math.round(currentRent * weatherMultiplier);
  const upgradeCost = deed.upgradeCost || 100;
  const canAffordUpgrade = isCurrentPlayerOwner && upgradesCount < 5 && playerMoney >= upgradeCost;

  const playPronunciation = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlayingAudio(true);
    SoundManager.speak(`${deed.vocabWord}. ${deed.definition}`, 0.88, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (quizAnswered) return;
    setQuizAnswered(true);
    if (isCorrect) {
      SoundManager.playSuccessChime();
      if (onAwardBonus) onAwardBonus(20);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl shadow-2xl border-4 border-slate-300 text-slate-900 transition-all duration-300 relative flex flex-col overflow-hidden max-h-[92vh] ${
          isPamphletExpanded ? 'max-w-4xl w-full' : 'max-w-md w-full'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), inset 0 0 100px rgba(0,0,0,0.02)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Outer Split Container (Deed Card on Left, Expanded Pamphlet on Right) */}
        <div className={`flex flex-col md:flex-row flex-1 overflow-y-auto`}>
          {/* LEFT: Classic Authentic Monopoly Deed Card */}
          <div
            className={`p-6 flex flex-col justify-between border-b md:border-b-0 ${
              isPamphletExpanded ? 'md:w-5/12 md:border-r border-slate-200 bg-amber-50/20' : 'w-full'
            }`}
          >
            <div>
              {/* Authentic Double Border Box Header */}
              <div
                className="p-4 rounded-xl text-center shadow-md border-2 border-slate-800 text-white relative overflow-hidden"
                style={{ backgroundColor: deed.colorHex }}
              >
                <span className="text-[10px] uppercase font-black tracking-widest text-white/80 block">
                  TITLE DEED • CLEAN ENERGY
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5 drop-shadow-xs">
                  {deed.name}
                </h2>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-white/90 font-mono font-bold">
                  <span>Acquisition:</span>
                  <span className="text-amber-200 text-sm font-black">${deed.price || 200}M</span>
                </div>
              </div>

              {/* Rent & Tier Breakdown */}
              <div className="mt-4 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-300">
                  <span className="font-sans font-bold text-slate-700">RENT (Base Generation)</span>
                  <span className="font-black text-sm text-slate-900">${deed.rent}M</span>
                </div>

                {deed.multUpgrades && (
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-sans">With 1 Turbine / PV Array</span>
                      <span className="font-bold text-slate-900">${deed.multUpgrades[0]}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">With 2 Turbines / PV Arrays</span>
                      <span className="font-bold text-slate-900">${deed.multUpgrades[1]}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">With 3 Turbines / PV Arrays</span>
                      <span className="font-bold text-slate-900">${deed.multUpgrades[2]}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans">With 4 Turbines / PV Arrays</span>
                      <span className="font-bold text-slate-900">${deed.multUpgrades[3]}M</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800 font-bold">
                      <span className="font-sans flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        With CLEAN MICROGRID HUB
                      </span>
                      <span>${deed.multUpgrades[4]}M</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t-2 border-slate-300 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-sans">Turbine Upgrade Cost</span>
                    <span className="font-bold text-slate-800">${deed.upgradeCost || 100}M each</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans">Mortgage Value</span>
                    <span className="font-bold text-slate-800">${deed.mortgage || 100}M</span>
                  </div>
                </div>
              </div>

              {/* Ownership Status */}
              <div className="mt-4 p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Concession Status</span>
                  <span className="font-bold text-slate-800">
                    {ownerName ? `Owned by ${ownerName}` : 'Unclaimed Concession'}
                  </span>
                </div>
                {ownerName && (
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: ownerColor || '#10b981' }}
                  />
                )}
              </div>
            </div>

            {/* Quick Unfold Button (Toggles Pamphlet) */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsPamphletExpanded(!isPamphletExpanded)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span>{isPamphletExpanded ? 'Collapse Pamphlet' : '📖 Unfold Technical Pamphlet & Vocabulary'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Expandable Educational Pamphlet (Blueprint & Pedagogical Breakdown) */}
          {isPamphletExpanded && (
            <div className="p-6 md:w-7/12 bg-white flex flex-col justify-between space-y-5 animate-in slide-in-from-right duration-200">
              <div>
                {/* Pamphlet Ribbon Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider">
                      Technical Brochure
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      CEFR {deed.cefrLevel} Level
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={playPronunciation}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                    <span>Listen English</span>
                  </button>
                </div>

                {/* Target Vocabulary Hero Display */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 shadow-xs">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {deed.vocabWord}
                    </h3>
                    <span className="font-mono text-xs text-emerald-700 font-bold">
                      {deed.phonetic}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({deed.syllables})
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-200/80">
                      {deed.partOfSpeech}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 mt-2 leading-relaxed">
                    {deed.definition}
                  </p>
                </div>

                {/* Interactive Blueprint Schematic / Cutaway Section */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      Engineering Cutaway: {deed.cutawayPart}
                    </span>
                    <span className="text-[10px] text-slate-400">Component Blueprint</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {deed.cutawayDescription}
                  </p>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-emerald-300">
                    <strong className="text-white block mb-0.5">Real Energy Application:</strong>
                    {deed.energyExplanation}
                  </div>
                </div>

                {/* Business English Collocation & Grammar Tip */}
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="font-black text-amber-800 uppercase tracking-wide block text-[11px]">
                    Executive Business English Collocation:
                  </span>
                  <p className="font-bold text-amber-900 font-mono">
                    &quot;{deed.businessCollocation}&quot;
                  </p>
                  <p className="text-amber-800 italic mt-1">
                    Example: &quot;{deed.sampleSentence}&quot;
                  </p>
                </div>

                {/* Instant Quick Vocabulary Check Quiz */}
                <div className="mt-4 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                      Vocabulary Check: Win +$20M Clean Credit!
                    </span>
                    {quizAnswered && (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Checked!
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700">
                    What does <strong className="text-purple-950">{deed.vocabWord}</strong> refer to?
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuizAnswer(true)}
                      disabled={quizAnswered}
                      className="min-h-[48px] h-auto p-2.5 rounded-xl bg-white hover:bg-purple-100 border border-purple-300 text-left font-medium text-xs text-slate-800 transition-colors cursor-pointer leading-snug whitespace-normal break-words flex items-center"
                    >
                      {deed.definition}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuizAnswer(false)}
                      disabled={quizAnswered}
                      className="min-h-[48px] h-auto p-2.5 rounded-xl bg-white hover:bg-purple-100 border border-purple-300 text-left font-medium text-xs text-slate-800 transition-colors cursor-pointer leading-snug whitespace-normal break-words flex items-center"
                    >
                      A dirty coal combustion furnace.
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Board Game Monopoly Gameplay) */}
        <div className="p-4 bg-slate-100 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3">
          {/* Situation 1: Available to Buy */}
          {!ownerName && deed.price && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Pass / End Turn
              </button>
              <button
                type="button"
                onClick={() => {
                  SoundManager.playSuccessChime();
                  onBuy();
                }}
                disabled={playerMoney < deed.price}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 ${
                  playerMoney >= deed.price
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 active:scale-95 cursor-pointer ring-2 ring-emerald-400/40'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {playerMoney >= deed.price
                    ? `Purchase Parcel ($${deed.price}M)`
                    : `Need $${deed.price}M (Have $${playerMoney}M)`}
                </span>
              </button>
            </>
          )}

          {/* Situation 2: Owned by Opponent -> Pay Rent */}
          {ownerName && !isCurrentPlayerOwner && (
            <div className="w-full flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-500 block">Feed-in Grid Usage Fee</span>
                <span className="font-bold text-slate-800 text-sm">
                  Pay ${weatherAdjustedRent}M to {ownerName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onPayRent(weatherAdjustedRent)}
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white shadow-md active:scale-95 cursor-pointer"
              >
                Pay Feed-in Rent (${weatherAdjustedRent}M)
              </button>
            </div>
          )}

          {/* Situation 3: Owned by Current Player -> Option to Upgrade */}
          {isCurrentPlayerOwner && (
            <div className="w-full flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-500 block">Your Asset</span>
                <span className="font-bold text-emerald-800 text-sm">
                  Level: {upgradesCount === 5 ? 'Clean Microgrid Hub' : `${upgradesCount}/4 Turbines`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {canAffordUpgrade && (
                  <button
                    type="button"
                    onClick={() => {
                      SoundManager.playSuccessChime();
                      onUpgrade();
                    }}
                    className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Install Next Turbine (${upgradeCost}M)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Non-property tiles */}
          {!deed.price && !ownerName && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl font-black text-xs uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                Acknowledge & Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
