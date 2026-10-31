'use client';

import React from 'react';
import { PlayerState } from './MonopolyBoard';
import {
  DollarSign,
  Wind,
  Car,
  Sun,
  Share2,
  Handshake,
  History,
  RotateCcw,
  Waves,
  BatteryCharging,
  Flame,
  Zap,
  Building2,
  Volume2,
  VolumeX,
  Compass,
} from 'lucide-react';

interface PlayerCashTrayProps {
  players: PlayerState[];
  activePlayerIndex: number;
  walkthroughStep: 1 | 2 | 3 | 4;
  walkthroughInstruction: string;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onOpenCompanyCustomizer: () => void;
  onOpenTrade: () => void;
  onOpenTimeline: () => void;
  onOpen3DViewer: () => void;
  onResetGame: () => void;
}

export function PlayerCashTray({
  players,
  activePlayerIndex,
  walkthroughStep,
  walkthroughInstruction,
  isSoundMuted,
  onToggleSound,
  onOpenCompanyCustomizer,
  onOpenTrade,
  onOpenTimeline,
  onOpen3DViewer,
  onResetGame,
}: PlayerCashTrayProps) {
  const renderTokenIcon = (tokenType: string) => {
    switch (tokenType) {
      case 'turbine':
        return <Wind className="w-3.5 h-3.5" />;
      case 'car':
        return <Car className="w-3.5 h-3.5" />;
      case 'solar':
        return <Sun className="w-3.5 h-3.5" />;
      case 'hydro':
        return <Waves className="w-3.5 h-3.5" />;
      case 'battery':
        return <BatteryCharging className="w-3.5 h-3.5" />;
      case 'geothermal':
        return <Flame className="w-3.5 h-3.5" />;
      case 'drone':
        return <Zap className="w-3.5 h-3.5" />;
      default:
        return <Share2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full shrink-0 bg-[#090e1a]/95 border-t border-emerald-900/50 px-3 py-2 text-white shadow-2xl z-30 select-none">
      <div className="max-w-[1300px] mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Players Dashboard Cards */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {players.map((p, idx) => {
            const isActive = idx === activePlayerIndex;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400/50 shadow-md'
                    : 'bg-black/40 border-slate-800 opacity-75 hover:opacity-100'
                }`}
              >
                {/* Token Badge */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white border border-white/80 shrink-0 shadow-xs"
                  style={{ backgroundColor: p.color }}
                >
                  {renderTokenIcon(p.tokenType)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xs font-black text-white">{p.name}</span>
                    {isActive && (
                      <span className="text-[9px] font-black uppercase bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-xs">
                        TURN
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5 leading-none">
                    <span className="font-bold text-emerald-400">${p.money}M</span>
                    <span className="text-slate-400 text-[10px]">
                      • {p.propertiesOwned.length} Parcels
                    </span>
                    {p.companyName && (
                      <span className="text-amber-300 text-[10px] hidden sm:inline max-w-[120px] truncate">
                        • {p.companyName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Customize Profile Button */}
          <button
            type="button"
            onClick={onOpenCompanyCustomizer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-emerald-900/60 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs font-bold transition-all"
            title="Customize Company Name, Avatar & Spelling"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Customize Avatar & Company</span>
            <span className="sm:hidden">Profile</span>
          </button>
        </div>

        {/* Center: Walkthrough Direction Bar (Never leaves the learner hanging) */}
        <div className="hidden lg:flex items-center gap-2 bg-black/60 border border-slate-800 px-3 py-1 rounded-xl text-xs max-w-md">
          <Compass className="w-4 h-4 text-amber-400 shrink-0 animate-spin [animation-duration:12s]" />
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">
              Walkthrough • Step {walkthroughStep} of 4
            </span>
            <span className="text-[11px] text-slate-200 font-medium truncate">
              {walkthroughInstruction}
            </span>
          </div>
        </div>

        {/* Right: Board Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenTrade}
            className="px-2.5 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ring-1 ring-amber-400/40"
            title="Negotiate Trade with other players"
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>Trade</span>
          </button>

          <button
            type="button"
            onClick={onOpen3DViewer}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ring-1 ring-emerald-400/40"
            title="Inspect 3D Wind Turbine Cutaway"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Turbine</span>
          </button>

          <button
            type="button"
            onClick={onOpenTimeline}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Energy Scrollytelling Timeline"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timeline</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={onResetGame}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
