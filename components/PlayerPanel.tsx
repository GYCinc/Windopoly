'use client';

import React from 'react';
import { Player } from '@/types/game';
import { DollarSign, Zap, Home, Award, CheckCircle2, Bot, User } from 'lucide-react';

interface PlayerPanelProps {
  players: Player[];
  activePlayerId: string;
  onEndTurn: () => void;
  canEndTurn: boolean;
}

export function PlayerPanel({
  players,
  activePlayerId,
  onEndTurn,
  canEndTurn,
}: PlayerPanelProps) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400">
          Executive Energy Consortia
        </h3>

        {canEndTurn && (
          <button
            type="button"
            onClick={onEndTurn}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 animate-pulse transition-all"
          >
            End Turn & Next Player →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {players.map((player) => {
          const isActive = player.id === activePlayerId;

          return (
            <div
              key={player.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-80'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-100">{player.name}</span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Turn
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">{player.roleTitle}</span>
                  </div>
                </div>

                {player.curtailedTurnsLeft > 0 && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-semibold border border-rose-500/30">
                    Curtailed ({player.curtailedTurnsLeft}t)
                  </span>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-0.5">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> Capital
                  </span>
                  <div className="flex items-baseline justify-center gap-0.5 font-mono font-black text-sm text-white">
                    <span>${player.money}</span>
                    <span className="text-xs text-emerald-400">M</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-0.5">
                    <Zap className="w-3 h-3 text-sky-400" /> Output
                  </span>
                  <div className="flex items-baseline justify-center gap-0.5 font-mono font-black text-sm text-white">
                    <span>{player.totalMWhGenerated}</span>
                    <span className="text-[10px] text-sky-400">MWh</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-0.5">
                    <Home className="w-3 h-3 text-amber-400" /> Assets
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    {player.propertiesOwned.length}
                  </span>
                </div>
              </div>

              {/* Vocabulary practice meter */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" /> Vocabulary Mastered:
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {player.masteredVocabIds.length} Terms
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
