'use client';

import React, { useState } from 'react';
import { BoardTile, Player, WeatherCondition } from '@/types/game';
import { VocabWordBadge } from './VocabWordBadge';
import {
  Wind,
  Zap,
  Wrench,
  ShieldCheck,
  ArrowUpCircle,
  X,
  Volume2,
  DollarSign,
  Activity,
  Award,
  AlertCircle,
} from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface TileCardModalProps {
  tile: BoardTile;
  activePlayer: Player;
  owner: Player | null;
  weather: WeatherCondition;
  onBuy: () => void;
  onUpgrade: () => void;
  onPayRent: (amount: number) => void;
  onPayMaintenance: (amount: number) => void;
  onClose: () => void;
}

export function TileCardModal({
  tile,
  activePlayer,
  owner,
  weather,
  onBuy,
  onUpgrade,
  onPayRent,
  onPayMaintenance,
  onClose,
}: TileCardModalProps) {
  const [showVocabDetails, setShowVocabDetails] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [maintenanceDiscount, setMaintenanceDiscount] = useState(1.0);

  const isOwner = owner?.id === activePlayer.id;
  const isUnowned = !owner && tile.cost && tile.cost > 0;
  const isOpponentOwned = owner && !isOwner;

  // Calculate rent adjusted by weather output multiplier
  const currentUpgrades = tile.upgradesCount || 0;
  const baseRent = currentUpgrades > 0 && tile.rentWithUpgrades
    ? tile.rentWithUpgrades[currentUpgrades - 1]
    : tile.baseRent || 0;

  // In heatwaves, grid demand surges tariffs; in doldrums, output drops
  const adjustedRent = Math.round(baseRent * weather.outputMultiplier);

  // Calculate variable maintenance cost based on weather strain
  const baseMaintenance = tile.maintenanceCost || 8;
  const variableMaintenance = Math.round(baseMaintenance * weather.maintenanceMultiplier * maintenanceDiscount);

  // Upgrade cost
  const upgradeCost = tile.upgradeCost || 60;
  const canUpgrade = isOwner && (tile.upgradesCount || 0) < 4 && activePlayer.money >= upgradeCost;

  const handleSpeakTile = () => {
    SoundManager.speak(
      `${tile.name}. ${tile.description}. Regular energy generation is ${tile.baseOutputMWh} megawatt-hours.`,
      0.88
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div
          className="p-5 text-white flex items-center justify-between"
          style={{ backgroundColor: tile.accentColor || '#059669' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                {tile.type.replace('_', ' ')}
              </span>
              <h2 className="text-xl font-black leading-tight text-white flex items-center gap-2">
                {tile.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSpeakTile}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Listen to asset details"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Plain English Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Plain English Overview
            </span>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {tile.description}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {tile.cost && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-800 font-semibold block">Asset Price</span>
                <span className="text-base font-black text-emerald-950 font-mono">${tile.cost}M</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
              <span className="text-xs text-teal-800 font-semibold block">Feed-in Rent</span>
              <span className="text-base font-black text-teal-950 font-mono">${adjustedRent}M</span>
              <span className="text-[10px] text-teal-700 block">
                (x{weather.outputMultiplier.toFixed(1)} weather)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-xs text-sky-800 font-semibold block">Generation</span>
              <span className="text-base font-black text-sky-950 font-mono">
                {Math.round(tile.baseOutputMWh * weather.outputMultiplier)} MWh
              </span>
              <span className="text-[10px] text-sky-700 block">rated capacity</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-800 font-semibold block">Maintenance</span>
              <span className="text-base font-black text-amber-950 font-mono">${variableMaintenance}M</span>
              <span className="text-[10px] text-amber-700 block">per turn wear</span>
            </div>
          </div>

          {/* Ownership Status Banner */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 uppercase font-bold block">Current Owner</span>
              <span className="text-sm font-bold text-slate-900">
                {owner ? owner.name : 'Unclaimed Concession (Available for Purchase)'}
              </span>
            </div>
            {owner && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${owner.color}20`, color: owner.color }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: owner.color }} />
                <span>{owner.roleTitle}</span>
              </div>
            )}
          </div>

          {/* Upgrades Breakdown if property */}
          {tile.rentWithUpgrades && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-600">
                <span>Infrastructure Tier</span>
                <span>Feed-in Rent (Base)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-center font-mono">
                <div className={`p-2 rounded-lg border ${currentUpgrades === 1 ? 'bg-emerald-100 border-emerald-400 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="block text-[10px] text-slate-600">Tier 1</span>
                  ${tile.rentWithUpgrades[0]}M
                </div>
                <div className={`p-2 rounded-lg border ${currentUpgrades === 2 ? 'bg-emerald-100 border-emerald-400 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="block text-[10px] text-slate-600">Tier 2</span>
                  ${tile.rentWithUpgrades[1]}M
                </div>
                <div className={`p-2 rounded-lg border ${currentUpgrades === 3 ? 'bg-emerald-100 border-emerald-400 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="block text-[10px] text-slate-600">Tier 3</span>
                  ${tile.rentWithUpgrades[2]}M
                </div>
                <div className={`p-2 rounded-lg border ${currentUpgrades === 4 ? 'bg-emerald-100 border-emerald-400 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="block text-[10px] text-slate-600">Smart BESS</span>
                  ${tile.rentWithUpgrades[3]}M
                </div>
              </div>
            </div>
          )}

          {/* Shaded Card: English Vocabulary Insight */}
          {tile.associatedVocab && tile.associatedVocab.length > 0 && (
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 uppercase tracking-wide">
                  <Award className="w-4 h-4 text-teal-700" />
                  <span>Target Energy Vocabulary</span>
                </div>
                <span className="text-xs text-teal-700 font-medium">Click words to hear pronunciation</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {tile.associatedVocab.map((vocabId) => (
                  <VocabWordBadge key={vocabId} vocabId={vocabId} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Situation 1: Unowned Property -> Player can Buy or Pass */}
          {isUnowned && tile.cost && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                Pass / Save Capital
              </button>
              <button
                type="button"
                onClick={() => {
                  SoundManager.playSuccessChime();
                  onBuy();
                }}
                disabled={activePlayer.money < tile.cost}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 ${
                  activePlayer.money >= tile.cost
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-95'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {activePlayer.money >= tile.cost
                    ? `Purchase Asset ($${tile.cost}M)`
                    : `Insufficient Funds (Need $${tile.cost}M)`}
                </span>
              </button>
            </>
          )}

          {/* Situation 2: Opponent Owned -> Pay Rent */}
          {isOpponentOwned && (
            <div className="w-full flex items-center justify-between gap-3">
              <div className="text-sm">
                <span className="text-slate-500 block text-xs">Feed-in Grid Usage Fee</span>
                <span className="font-bold text-slate-800">
                  Pay ${adjustedRent}M to {owner?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onPayRent(adjustedRent)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                Pay Feed-in Rent (${adjustedRent}M)
              </button>
            </div>
          )}

          {/* Situation 3: Owned by Current Player -> Option to Upgrade */}
          {isOwner && (
            <div className="w-full flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <span className="text-slate-500 block text-xs">Your Asset (Tier {currentUpgrades}/4)</span>
                <span className="font-bold text-emerald-800">Operational & Earning</span>
              </div>

              <div className="flex items-center gap-2">
                {canUpgrade && (
                  <button
                    type="button"
                    onClick={() => {
                      SoundManager.playSuccessChime();
                      onUpgrade();
                    }}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>Install Upgrade (${upgradeCost}M)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100"
                >
                  Done / Close
                </button>
              </div>
            </div>
          )}

          {/* Non-property tiles like Start, Maintenance, etc. */}
          {!tile.cost && !owner && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800"
              >
                Understood / Continue Turn
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
