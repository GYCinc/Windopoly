'use client';

import React from 'react';
import { PlayerState } from './MonopolyBoard';
import { MONOPOLY_SPACES } from '@/lib/monopoly-board-data';
import { DynamicWeatherEvent } from '@/lib/weatherEngine';
import {
  Wind,
  Zap,
  TrendingUp,
  Leaf,
  ShieldCheck,
  Building2,
  Compass,
  AlertTriangle,
  RotateCw,
  Sun,
  Waves,
  BatteryCharging,
} from 'lucide-react';

interface EmpireSidePanelsProps {
  player1: PlayerState;
  player2: PlayerState;
  activePlayerIndex: number;
  currentWeather: DynamicWeatherEvent;
  weatherDurationTurns: number;
  onOpenCustomizer: () => void;
  onOpenWeatherModal: () => void;
  onSimulateShift: () => void;
}

export function LeftEmpirePanel({
  player1,
  activePlayerIndex,
  onOpenCustomizer,
}: {
  player1: PlayerState;
  activePlayerIndex: number;
  onOpenCustomizer: () => void;
}) {
  const ownedDeeds = player1.propertiesOwned.map((id) => MONOPOLY_SPACES[id]).filter(Boolean);
  const totalUpgrades = Object.values(player1.upgradesBySpace).reduce((a, b) => a + b, 0);

  return (
    <aside className="hidden xl:flex flex-col justify-between w-64 2xl:w-72 h-[calc(100vh-24px)] bg-slate-950/85 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-2xl text-white select-none overflow-y-auto">
      {/* Empire Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs border border-white/20"
              style={{ backgroundColor: player1.color }}
            >
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{player1.name}</span>
                {activePlayerIndex === 0 && (
                  <span className="px-1.5 py-0.2 rounded-xs bg-emerald-400 text-slate-950 text-[9px] font-black uppercase tracking-wider animate-pulse">
                    YOUR TURN
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold block truncate max-w-[130px]">
                {player1.companyName || 'Player 1 Clean Energy'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCustomizer}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Edit Company Name & Practice Spelling"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        {/* Live Generation & Financial Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">
              Grid Capital
            </span>
            <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
              ${player1.money}M
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">
              Generation
            </span>
            <span className="text-base font-black text-teal-300 font-mono mt-0.5 block">
              {player1.totalMWhGenerated} <span className="text-[10px]">MWh</span>
            </span>
          </div>
        </div>

        {/* Clean Energy Impact Stats */}
        <div className="space-y-2 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>CO₂ Avoided:</span>
            </span>
            <span className="font-mono font-bold text-emerald-300">
              {Math.round(player1.totalMWhGenerated * 0.42)} Tons
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Turbine Fleet:</span>
            </span>
            <span className="font-mono font-bold text-amber-300">
              {totalUpgrades} Turbines
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Vocabulary Mastered:</span>
            </span>
            <span className="font-mono font-bold text-sky-300">
              {ownedDeeds.length + 6} Terms
            </span>
          </div>
        </div>

        {/* Portfolio of Clean Energy Parcels */}
        <div className="mt-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
            Acquired Clean Parcels ({ownedDeeds.length}):
          </span>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {ownedDeeds.length === 0 ? (
              <span className="text-[10px] text-slate-500 italic">No parcels claimed yet.</span>
            ) : (
              ownedDeeds.map((deed) => (
                <div
                  key={deed.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-slate-800 text-[10px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: deed.colorHex }}
                    />
                    <span className="font-bold text-white truncate">{deed.name}</span>
                  </div>
                  <span className="font-mono text-emerald-400 shrink-0 font-bold ml-1">
                    ${deed.price}M
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 text-[9px] text-slate-500 italic text-center">
        Hover any space for definition & IPA
      </div>
    </aside>
  );
}

export function RightEmpirePanel({
  player2,
  activePlayerIndex,
  currentWeather,
  weatherDurationTurns,
  onOpenWeatherModal,
  onSimulateShift,
}: {
  player2: PlayerState;
  activePlayerIndex: number;
  currentWeather: DynamicWeatherEvent;
  weatherDurationTurns: number;
  onOpenWeatherModal: () => void;
  onSimulateShift: () => void;
}) {
  const ownedDeeds = player2.propertiesOwned.map((id) => MONOPOLY_SPACES[id]).filter(Boolean);

  return (
    <aside className="hidden xl:flex flex-col justify-between w-64 2xl:w-72 h-[calc(100vh-24px)] bg-slate-950/85 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-2xl text-white select-none overflow-y-auto">
      <div>
        {/* Competitor / AI Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs border border-white/20"
              style={{ backgroundColor: player2.color }}
            >
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{player2.name}</span>
                {activePlayerIndex === 1 && (
                  <span className="px-1.5 py-0.2 rounded-xs bg-blue-400 text-slate-950 text-[9px] font-black uppercase tracking-wider animate-pulse">
                    AI TURN
                  </span>
                )}
              </div>
              <span className="text-[10px] text-blue-400 font-mono font-bold block truncate max-w-[130px]">
                {player2.companyName || 'Player 2 Grid Dynamics'}
              </span>
            </div>
          </div>

          <span className="text-xs font-mono font-black text-blue-400">
            ${player2.money}M
          </span>
        </div>

        {/* Atmospheric Station Widget */}
        <div className="my-3 p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-teal-300 uppercase tracking-wide">
              <Compass className="w-3.5 h-3.5" /> Atmospheric Station
            </div>
            <button
              type="button"
              onClick={onSimulateShift}
              className="p-1 rounded-lg bg-white/10 hover:bg-teal-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Roll atmospheric front"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div>
              <span className="text-xs font-black text-white block">
                {currentWeather.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {currentWeather.speedMps} m/s • {currentWeather.beaufortScale}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-black/40 text-amber-300 font-mono text-[10px] font-bold border border-white/10">
              {weatherDurationTurns} {weatherDurationTurns === 1 ? 'turn' : 'turns'} left
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenWeatherModal}
            className="w-full mt-1.5 py-1.5 px-2.5 rounded-xl bg-teal-800/50 hover:bg-teal-700/70 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-teal-500/30"
          >
            <span>Atmospheric Forecast & Radar</span>
          </button>
        </div>

        {/* Live Energy Market News Feed */}
        <div className="mt-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
            Live Clean Energy Market Feed:
          </span>
          <div className="space-y-1.5 text-[10px]">
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-emerald-400 font-bold block">Grid Sync Active</span>
              <p className="text-slate-300 text-[9px] leading-tight mt-0.5">
                Pass Go to receive $200M clean energy tariff incentive.
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-amber-400 font-bold block">Curtailment Bay</span>
              <p className="text-slate-300 text-[9px] leading-tight mt-0.5">
                Over-generation shutdown holds turbines for 2 turn cycles.
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-sky-400 font-bold block">HVDC Transmission</span>
              <p className="text-slate-300 text-[9px] leading-tight mt-0.5">
                Interconnectors route surplus power with minimal resistance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Holdings */}
      <div className="pt-2 border-t border-slate-800/80">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
          Player 2 Parcels ({ownedDeeds.length}):
        </span>
        <div className="flex flex-wrap gap-1">
          {ownedDeeds.map((deed) => (
            <span
              key={deed.id}
              className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
              style={{ backgroundColor: deed.colorHex }}
            >
              {deed.shortName.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
