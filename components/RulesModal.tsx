'use client';

import React from 'react';
import { BookOpen, X, Wind, Zap, CloudLightning, ShieldAlert, Award, Volume2 } from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  const handleSpeakRules = () => {
    SoundManager.speak(
      'Welcome to Windopoly. Your goal is to build a clean energy empire while learning professional English vocabulary. Roll the dice to move across the 24 grid tiles. Buy wind farms, avoid curtailment, and balance variable weather conditions.',
      0.88
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                Quick Guide & English Strategy
              </span>
              <h2 className="text-lg font-black leading-tight text-white">
                How to Play Windopoly
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSpeakRules}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Listen to guide"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          {/* Rule 1: The Goal */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <h3 className="font-bold text-emerald-950 flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-700" />
              1. The Ultimate Goal
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Acquire onshore, coastal, and offshore wind concessions, connect them to HVDC transmission corridors, and generate clean Megawatt-hours (MWh). Simultaneously master 16+ key professional English energy terms.
            </p>
          </div>

          {/* Rule 2: Dynamic Weather System */}
          <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl">
            <h3 className="font-bold text-sky-950 flex items-center gap-2 mb-1">
              <CloudLightning className="w-4 h-4 text-sky-700" />
              2. Weather Affects Revenue & Maintenance
            </h3>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-1 list-disc pl-4 leading-relaxed">
              <li><strong>Gale Storms:</strong> +50% power output surge, but +60% blade wear and maintenance cost!</li>
              <li><strong>Calm Doldrums:</strong> Wind output drops to 40%, but battery storage keeps earning.</li>
              <li><strong>Heatwaves:</strong> Spot electricity prices spike, doubling your feed-in tariffs!</li>
            </ul>
          </div>

          {/* Rule 3: Variable Maintenance Costs */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
            <h3 className="font-bold text-amber-950 flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              3. Variable Maintenance & Inspections
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Saltwater corrosion and mechanical wear erode profits. Upgrade your assets with smart AI sensors or battery packs to stabilize output and lower risk.
            </p>
          </div>

          {/* Rule 4: English Acquisition Perks */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
            <h3 className="font-bold text-purple-950 flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-purple-700" />
              4. Language Mastery Unlocks Real In-Game Capital
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Answer dispatch vocabulary challenges or practice boardroom dialogs to win bonus green subsidies (+$15M to +$50M each). Every word has full audio pronunciation!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
          >
            Got it, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
}
