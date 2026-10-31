'use client';

import React, { useState } from 'react';
import { SoundManager } from '@/lib/audio';
import {
  X,
  History,
  Volume2,
  Wind,
  Flame,
  Sun,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface EnergyTimelineModalProps {
  onClose: () => void;
}

interface TimelineDecade {
  era: string;
  year: string;
  title: string;
  vocabFocus: string;
  phonetic: string;
  summary: string;
  energyFlowSvg: string;
  englishLesson: string;
}

const TIMELINE_DECADES: TimelineDecade[] = [
  {
    era: 'Industrial Coal Dawn',
    year: '1900s - 1950s',
    title: 'Centralized Thermal Smoke & The First Alternating Current Grids',
    vocabFocus: 'Alternating Current (AC)',
    phonetic: '[AWL-ter-nay-ting KUR-unt]',
    summary:
      'Early national grids relied entirely on massive coal combustion boilers spinning steam turbines, generating vast carbon dioxide emissions without environmental regulation.',
    energyFlowSvg: 'coal-to-grid',
    englishLesson:
      'Notice the phrase "rely on": always pair "rely" with the preposition "on" (e.g. "We rely on clean renewables, not fossil fuels").',
  },
  {
    era: 'The Global Oil Shocks',
    year: '1970s - 1980s',
    title: 'The Search for Domestic Energy Independence & Early Danish Turbines',
    vocabFocus: 'Intermittency',
    phonetic: '[in-tur-MIT-un-see]',
    summary:
      'Geopolitical crude oil embargoes forced governments to research wind and solar alternatives. Pioneer Danish carpenters engineered the iconic modern three-blade horizontal axis wind turbine.',
    energyFlowSvg: 'wind-prototype',
    englishLesson:
      'Vocabulary distinction: "Pioneer" can be both a noun ("a pioneer in wind engineering") and a verb ("she pioneered offshore foundations").',
  },
  {
    era: 'The Solar & Silicon Revolution',
    year: '2000s - 2010s',
    title: 'Swanson\'s Law: Solar Cell Costs Plummet 90% via Mass Manufacturing',
    vocabFocus: 'Levelized Cost (LCOE)',
    phonetic: '[LEV-uh-lyzed KAWST]',
    summary:
      'Automated gigafactories drove crystalline silicon solar prices down exponentially. For the first time in history, building new solar became cheaper than running existing coal plants.',
    energyFlowSvg: 'solar-surge',
    englishLesson:
      'Collocation: "Plummet exponentially" means to fall very rapidly and sharply. Use it to describe plummeting battery prices.',
  },
  {
    era: 'The Offshore Mega-Generation',
    year: '2020s - 2030s',
    title: '20MW Ocean Giants & High-Voltage Direct Current (HVDC) Subsea Highways',
    vocabFocus: 'Decarbonization',
    phonetic: '[dee-kar-bun-ih-ZAY-shun]',
    summary:
      'Wind turbines grew taller than the Eiffel Tower, anchored 50 miles offshore in deep continental shelf waters. Cross-border HVDC cables began transferring gigawatts across continents.',
    energyFlowSvg: 'offshore-hvdc',
    englishLesson:
      'Business collocation: "Decarbonize the power sector". Decarbonize is a transitive verb requiring an object.',
  },
  {
    era: 'Autonomous Net-Zero Harmony',
    year: '2050 Goal',
    title: '100% Dispatchable Clean Synchronous Grid with Green Hydrogen & Space Solar',
    vocabFocus: 'Grid Resilience',
    phonetic: '[GRID rih-ZIL-yunss]',
    summary:
      'Global energy demand is satisfied through zero-carbon power. Multi-day long-duration energy storage and intelligent demand-response algorithms maintain 50.00 Hz stability with zero emissions.',
    energyFlowSvg: 'net-zero-harmony',
    englishLesson:
      'Executive discourse: "Achieve net-zero parity". Parity means equality or equivalence in status or cost.',
  },
];

export function EnergyTimelineModal({ onClose }: EnergyTimelineModalProps) {
  const [activeDecadeIndex, setActiveDecadeIndex] = useState(0);

  const activeDecade = TIMELINE_DECADES[activeDecadeIndex];

  const handleSpeakDecade = () => {
    SoundManager.speak(
      `${activeDecade.era}, ${activeDecade.year}. ${activeDecade.title}. Key concept: ${activeDecade.vocabFocus}. ${activeDecade.summary}`,
      0.88
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-4 border-amber-600/80 rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950 via-stone-900 to-slate-950 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center">
              <History className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                SCROLLYTELLING HISTORICAL ARCHIVE
              </span>
              <h2 className="text-xl font-black text-white font-serif">
                Energy Timeline: 1900s Coal to 2050 Net-Zero
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakDecade}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
              title="Read aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeline Stepper Bar */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-2">
          {TIMELINE_DECADES.map((dec, idx) => (
            <button
              key={dec.year}
              type="button"
              onClick={() => {
                setActiveDecadeIndex(idx);
                SoundManager.playDiceClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeDecadeIndex === idx
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {dec.year}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Hero Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black tracking-wider uppercase">
                {activeDecade.era}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">
                {activeDecade.year}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white font-serif leading-snug">
              {activeDecade.title}
            </h3>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
              {activeDecade.summary}
            </p>
          </div>

          {/* Vocabulary Card */}
          <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                Era Vocabulary Anchor
              </span>
              <span className="font-mono text-xs text-emerald-300 font-bold">
                {activeDecade.phonetic}
              </span>
            </div>

            <h4 className="text-xl font-black text-white">
              {activeDecade.vocabFocus}
            </h4>
          </div>

          {/* English Grammar & Collocation Lesson */}
          <div className="p-5 rounded-2xl bg-amber-950/60 border border-amber-500/50 space-y-2">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider block">
              English Language Acquisition Tip:
            </span>
            <p className="text-sm text-amber-100 font-medium leading-relaxed">
              {activeDecade.englishLesson}
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={activeDecadeIndex === 0}
            onClick={() => setActiveDecadeIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase disabled:opacity-30 cursor-pointer"
          >
            ← Previous Era
          </button>

          <span className="text-xs text-slate-400 font-bold font-mono">
            Era {activeDecadeIndex + 1} of {TIMELINE_DECADES.length}
          </span>

          <button
            type="button"
            disabled={activeDecadeIndex === TIMELINE_DECADES.length - 1}
            onClick={() => setActiveDecadeIndex((prev) => Math.min(TIMELINE_DECADES.length - 1, prev + 1))}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase disabled:opacity-30 cursor-pointer"
          >
            Next Era →
          </button>
        </div>
      </div>
    </div>
  );
}
