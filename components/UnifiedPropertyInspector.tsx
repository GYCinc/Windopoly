'use client';

import React, { useState } from 'react';
import { PropertyDeed } from '@/lib/monopoly-board-data';
import { SoundManager } from '@/lib/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  X,
  Zap,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface UnifiedPropertyInspectorProps {
  deed: PropertyDeed;
  ownerName: string | null;
  ownerColor?: string;
  isCurrentPlayerOwner: boolean;
  canBuy: boolean;
  playerMoney: number;
  upgradesCount?: number;
  weatherMultiplier?: number;
  weatherName?: string;
  onBuy: () => void;
  onUpgrade: () => void;
  onPayRent: (amount: number) => void;
  onClose: () => void;
  onAwardBonus?: (amount: number) => void;
}

// Curated linguistic and engineering comprehension checks
function getContextualChallenge(deed: PropertyDeed) {
  const word = deed.vocabWord.toLowerCase();

  if (word.includes('turbine') || word.includes('generator') || word.includes('nacelle')) {
    return {
      prompt: `Linguistic & Technical Insight: What is the primary function of a ${deed.vocabWord}?`,
      options: [
        { text: 'Converts kinetic mechanical energy into clean electrical current', correct: true },
        { text: 'Stores chemical fuel in high-pressure subterranean tanks', correct: false },
        { text: 'Acts purely as an aerodynamic aesthetic landmark', correct: false },
      ],
      explanation: 'Turbines harness fluid dynamics to spin electromagnetic rotors, producing grid-ready alternating current.',
    };
  }

  if (word.includes('curtail') || word.includes('congestion') || word.includes('interconnect')) {
    return {
      prompt: `Grid Economics: When would an operator enact "${deed.vocabWord}"?`,
      options: [
        { text: 'When transmission wires reach thermal capacity, necessitating throttled output', correct: true },
        { text: 'When power consumption doubles unexpectedly in winter', correct: false },
        { text: 'During routine quarterly shareholder dividends', correct: false },
      ],
      explanation: 'Curtailment protects transmission infrastructure when regional supply temporarily exceeds line capacity.',
    };
  }

  if (word.includes('solar') || word.includes('photovoltaic') || word.includes('inverter') || word.includes('heliostat')) {
    return {
      prompt: `Clean Tech Vocabulary: In standard English, how is "${deed.vocabWord}" defined?`,
      options: [
        { text: deed.definition, correct: true },
        { text: 'A thermal gas combustion chamber for peak loads', correct: false },
        { text: 'A manual battery disconnection switch', correct: false },
      ],
      explanation: deed.energyExplanation,
    };
  }

  return {
    prompt: `Professional English: How is "${deed.vocabWord}" applied in renewable enterprise?`,
    options: [
      { text: deed.definition, correct: true },
      { text: 'A fossil-fuel combustion protocol for emergency backup', correct: false },
      { text: 'A secondary retail consumer tariff for residential heating', correct: false },
    ],
    explanation: deed.energyExplanation,
  };
}

export function UnifiedPropertyInspector({
  deed,
  ownerName,
  ownerColor,
  isCurrentPlayerOwner,
  canBuy,
  playerMoney,
  upgradesCount = 0,
  weatherMultiplier = 1.0,
  weatherName,
  onBuy,
  onUpgrade,
  onPayRent,
  onClose,
  onAwardBonus,
}: UnifiedPropertyInspectorProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [challengeResolved, setChallengeResolved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'language' | 'financials'>('overview');

  const baseRent = deed.rent || 10;
  const currentRent =
    upgradesCount > 0 && deed.multUpgrades && deed.multUpgrades[upgradesCount - 1]
      ? deed.multUpgrades[upgradesCount - 1]
      : baseRent;
  const weatherAdjustedRent = Math.round(currentRent * weatherMultiplier);
  const upgradeCost = deed.upgradeCost || 100;
  const canAffordUpgrade = isCurrentPlayerOwner && upgradesCount < 5 && playerMoney >= upgradeCost;

  const challenge = getContextualChallenge(deed);

  const handleSpeak = (text: string) => {
    setIsPlayingAudio(true);
    SoundManager.speak(text, 0.88, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleSelectOption = (idx: number) => {
    if (challengeResolved) return;
    setSelectedQuizIndex(idx);
    setChallengeResolved(true);

    const isCorrect = challenge.options[idx]?.correct;
    if (isCorrect) {
      SoundManager.playSuccessChime();
      if (onAwardBonus) onAwardBonus(25);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Precision Header with Color Banner */}
        <div
          className="px-5 py-4 flex items-center justify-between border-b border-white/10 relative overflow-hidden"
          style={{ backgroundColor: `${deed.colorHex}18` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shadow-xs border border-white/40 shrink-0"
              style={{ backgroundColor: deed.colorHex }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-sans">
                  {deed.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold border border-white/10">
                  Space #{deed.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 capitalize font-medium">
                {deed.group.replace('_', ' ')} • {deed.type.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
            title="Close Sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Navigation Tab Bar */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Property Dossier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('language')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'language'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Language Mastery</span>
            <span className="text-[10px] px-1 rounded-sm bg-amber-400/20 text-amber-300 font-mono">
              {deed.cefrLevel}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'financials'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tariff & Generation
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Financial Snapshot Matrix */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                    Acquisition Cost
                  </span>
                  <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                    ${deed.price || 150}M
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                    Base Generation Rent
                  </span>
                  <span className="text-lg font-black text-amber-400 font-mono mt-0.5 block">
                    ${weatherAdjustedRent}M
                  </span>
                  {weatherMultiplier !== 1 && (
                    <span className="text-[10px] text-amber-300 font-semibold">
                      ({Math.round(weatherMultiplier * 100)}% {weatherName || 'Weather'})
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                    Facility Status
                  </span>
                  {ownerName ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ownerColor || '#10b981' }}
                      />
                      <span className="text-xs font-bold text-white truncate">{ownerName}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 mt-1 block">
                      Unclaimed Parcel
                    </span>
                  )}
                </div>
              </div>

              {/* Clean Energy & Engineering Explanation */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wide">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clean Energy Infrastructure</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {deed.energyExplanation}
                </p>
                <div className="pt-2 border-t border-emerald-500/15 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Component: <strong className="text-emerald-200">{deed.cutawayPart}</strong></span>
                  <span className="font-mono text-emerald-400/90">{deed.businessCollocation}</span>
                </div>
              </div>

              {/* Integrated Vocabulary Spotlight */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">{deed.vocabWord}</span>
                    <span className="text-xs font-mono text-slate-400">{deed.phonetic}</span>
                    <span className="text-xs text-amber-400 italic">({deed.partOfSpeech})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeak(`${deed.vocabWord}. ${deed.definition}`)}
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Pronounce</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{deed.definition}</p>
                <div className="p-2 rounded-xl bg-black/40 text-[11px] text-slate-300 italic">
                  &ldquo;{deed.sampleSentence}&rdquo;
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LANGUAGE MASTERY */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              {/* Syllable Breakdown Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Phonetic Architecture & Enunciation
                </span>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <h4 className="text-xl font-black text-white font-mono tracking-wider">
                      {deed.syllables}
                    </h4>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                      IPA Pronunciation: {deed.phonetic}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeak(deed.vocabWord)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </button>
                </div>
              </div>

              {/* Contextual Linguistic Challenge */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Comprehension & Collocation Challenge
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    +$25M Credit
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium">{challenge.prompt}</p>

                <div className="space-y-2">
                  {challenge.options.map((opt, idx) => {
                    const isSelected = selectedQuizIndex === idx;
                    const showResult = challengeResolved;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={challengeResolved}
                        className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all border ${
                          showResult
                            ? opt.correct
                              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50'
                              : isSelected
                              ? 'bg-rose-950/80 border-rose-400 text-rose-200'
                              : 'bg-slate-900/40 border-slate-800 text-slate-500'
                            : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/80 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{opt.text}</span>
                          {showResult && opt.correct && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {challengeResolved && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-black/50 border border-slate-700/60 text-xs text-slate-300"
                  >
                    <strong className="text-amber-300 block mb-0.5">Linguistic Context:</strong>
                    {challenge.explanation}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Production Tariff Schedule (Weather-Adjusted)
                </span>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-slate-800">
                    <span className="text-slate-300 font-sans">Base Unimproved Parcel</span>
                    <span className="font-bold text-amber-400">${Math.round((deed.rent || 10) * weatherMultiplier)}M</span>
                  </div>

                  {deed.multUpgrades?.map((upRent, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        upgradesCount === idx + 1
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-white'
                          : 'bg-black/20 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-sans">
                        {idx === 4 ? 'Microgrid Hub' : `Tier ${idx + 1} (${idx + 1} Turbines/Panels)`}
                      </span>
                      <span className="font-bold text-emerald-400">
                        ${Math.round(upRent * weatherMultiplier)}M
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {deed.upgradeCost && (
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Upgrade Cost Per Installation:</span>
                  <span className="font-mono font-bold text-white">${deed.upgradeCost}M</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tactile Action Footer */}
        <div className="p-4 px-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-400 block font-medium">Your Treasury:</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              ${playerMoney}M
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* If Unclaimed: Can Buy or Pass */}
            {!ownerName && canBuy && (
              <button
                type="button"
                onClick={onBuy}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-md hover:shadow-emerald-500/25 cursor-pointer"
              >
                <span>Acquire Parcel for ${deed.price}M</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* If Owned by Current Player: Can Upgrade */}
            {isCurrentPlayerOwner && canAffordUpgrade && (
              <button
                type="button"
                onClick={onUpgrade}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Upgrade Turbine (+${upgradeCost}M)</span>
              </button>
            )}

            {/* If Owned by Competitor: Pay Rent */}
            {!isCurrentPlayerOwner && ownerName && (
              <button
                type="button"
                onClick={() => onPayRent(weatherAdjustedRent)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors shadow-md cursor-pointer"
              >
                Pay Grid Tariff (${weatherAdjustedRent}M)
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Pass / Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
