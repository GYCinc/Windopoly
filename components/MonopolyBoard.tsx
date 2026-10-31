'use client';

import React, { useState } from 'react';
import { PropertyDeed, MONOPOLY_SPACES } from '@/lib/monopoly-board-data';
import { RealDice3D } from './RealDice3D';
import { TileHoverCard } from './TileHoverCard';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Wind,
  Sun,
  Waves,
  BatteryCharging,
  FileText,
  AlertTriangle,
  PauseCircle,
  PiggyBank,
  Share2,
  Car,
  Flame,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  Building2,
} from 'lucide-react';

export interface PlayerState {
  id: string;
  name: string;
  companyName?: string;
  companySlogan?: string;
  avatarId?: string;
  spellingScore?: number;
  tokenType: 'turbine' | 'car' | 'solar' | 'pylon' | 'battery' | 'hydro' | 'drone' | 'geothermal';
  color: string;
  money: number;
  position: number; // 0 to 39
  inCurtailmentTurns: number;
  propertiesOwned: number[]; // Space IDs
  upgradesBySpace: Record<number, number>; // spaceId -> upgradeCount (0-5)
  totalMWhGenerated: number;
}

interface MonopolyBoardProps {
  players: PlayerState[];
  activePlayerIndex: number;
  weatherName: string;
  weatherSpeedMps: number;
  weatherMultiplier: number;
  weatherDurationTurns: number;
  onOpenWeatherModal: () => void;
  onOpenCustomizer?: () => void;
  onSpaceClick: (deed: PropertyDeed) => void;
  onRollComplete: (die1: number, die2: number) => void;
  canRoll: boolean;
  onDrawChance: (deck: 'dispatch' | 'climate') => void;
}

export function MonopolyBoard({
  players,
  activePlayerIndex,
  weatherName,
  weatherSpeedMps,
  weatherMultiplier,
  weatherDurationTurns,
  onOpenWeatherModal,
  onOpenCustomizer,
  onSpaceClick,
  onRollComplete,
  canRoll,
  onDrawChance,
}: MonopolyBoardProps) {
  const [hoveredDeed, setHoveredDeed] = useState<PropertyDeed | null>(null);

  const activePlayer = players[activePlayerIndex];

  // Helper to render miniature player tokens
  const renderPlayerToken = (tokenType: string) => {
    switch (tokenType) {
      case 'turbine':
        return <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'car':
        return <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'solar':
        return <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'hydro':
        return <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'battery':
        return <BatteryCharging className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'geothermal':
        return <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'drone':
        return <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      default:
        return <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
  };

  const getSpaceOwner = (spaceId: number): PlayerState | undefined => {
    return players.find((p) => p.propertiesOwned.includes(spaceId));
  };

  // Clean, collision-free label formatter
  const getTileLabel = (deed: PropertyDeed) => {
    switch (deed.type) {
      case 'go':
        return { top: 'GRID SYNC', bot: 'START' };
      case 'jail':
        return { top: 'CURTAIL', bot: 'BAY' };
      case 'free_parking':
        return { top: 'MICROGRID', bot: 'OASIS' };
      case 'go_to_jail':
        return { top: 'GRID', bot: 'ALERT' };
      case 'chance':
        return { top: 'DISPATCH', bot: 'NOTICE' };
      case 'community_chest':
        return { top: 'CLIMATE', bot: 'CHEST' };
      case 'tax':
        return {
          top: deed.name.includes('CARBON') ? 'CARBON' : 'GRID',
          bot: deed.name.includes('CARBON') ? 'TAX' : 'TARIFF',
        };
      case 'transit':
        return {
          top: deed.shortName.replace(' HVDC', ''),
          bot: 'HVDC',
        };
      case 'utility':
        return {
          top: deed.shortName.replace(' UTILITY', ''),
          bot: 'STORAGE',
        };
      default: {
        const words = deed.shortName.split(' ');
        if (words.length === 1) return { top: words[0], bot: '' };
        if (words.length === 2) return { top: words[0], bot: words[1] };
        return { top: words[0], bot: words.slice(1).join(' ') };
      }
    }
  };

  // Render individual space
  const renderSpace = (spaceId: number, orientation: 'bottom' | 'top' | 'left' | 'right' | 'corner') => {
    const deed = MONOPOLY_SPACES[spaceId];
    if (!deed) return null;

    const owner = getSpaceOwner(spaceId);
    const playersHere = players.filter((p) => p.position === spaceId);
    const upgradeLevel = owner?.upgradesBySpace[spaceId] || 0;
    const isCorner = ['go', 'jail', 'free_parking', 'go_to_jail'].includes(deed.type);
    const label = getTileLabel(deed);

    return (
      <div
        key={deed.id}
        onClick={() => onSpaceClick(deed)}
        onMouseEnter={() => setHoveredDeed(deed)}
        onMouseLeave={() => setHoveredDeed(null)}
        className={`relative flex flex-col justify-between border border-slate-700/60 transition-colors select-none cursor-pointer overflow-hidden ${
          isCorner
            ? 'bg-[#f4efe4] hover:bg-[#eae3d4] text-slate-900 font-black'
            : 'bg-[#faf7f0] hover:bg-white text-slate-900'
        } ${hoveredDeed?.id === deed.id ? 'ring-2 ring-emerald-400 z-30' : ''}`}
        style={{
          boxShadow: 'inset 0 0 6px rgba(0,0,0,0.04)',
        }}
        title={`Hover for definition or click to inspect ${deed.name}`}
      >
        {/* Top/Side Color Bar for properties */}
        {deed.type === 'property' && (
          <div
            className="w-full h-2.5 sm:h-3.5 md:h-4 border-b border-slate-800 shrink-0 flex items-center justify-center shadow-xs"
            style={{ backgroundColor: deed.colorHex }}
          >
            {upgradeLevel > 0 && (
              <div className="flex items-center gap-0.5 text-[7px] sm:text-[8px] font-black text-white drop-shadow-xs">
                {upgradeLevel === 5 ? (
                  <span className="bg-amber-400 text-slate-950 px-1 rounded-xs font-mono text-[7px]">HUB</span>
                ) : (
                  [...Array(upgradeLevel)].map((_, i) => <span key={i}>▲</span>)
                )}
              </div>
            )}
          </div>
        )}

        {/* Space Body */}
        <div className="flex-1 p-0.5 flex flex-col justify-between items-center text-center overflow-hidden w-full">
          {/* Space Name */}
          <div className="w-full flex-1 flex flex-col justify-center items-center overflow-hidden">
            <span className="text-[7.5px] sm:text-[8.5px] md:text-[9.5px] font-black uppercase tracking-tight text-slate-950 leading-none block truncate max-w-full px-0.5">
              {label.top}
            </span>
            {label.bot && (
              <span className="text-[6.5px] sm:text-[7.5px] md:text-[8px] font-bold uppercase tracking-tighter text-slate-700 leading-tight block truncate max-w-full mt-0.5">
                {label.bot}
              </span>
            )}

            {/* Specialized Icons ONLY for non-property or special spaces */}
            {deed.type === 'transit' && (
              <div className="my-0.5 text-sky-700">
                <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            )}
            {deed.type === 'utility' && (
              <div className="my-0.5 text-amber-600">
                <BatteryCharging className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            )}
            {deed.type === 'chance' && (
              <div className="my-0.5 text-amber-600 font-serif text-xs sm:text-sm font-black leading-none">
                ?
              </div>
            )}
            {deed.type === 'community_chest' && (
              <div className="my-0.5 text-blue-600">
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            )}
            {deed.type === 'tax' && (
              <div className="my-0.5 text-rose-600">
                <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            )}
            {deed.type === 'go' && (
              <div className="my-0.5 text-emerald-700 flex flex-col items-center">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
              </div>
            )}
            {deed.type === 'jail' && (
              <div className="my-0.5 text-slate-700 flex flex-col items-center">
                <PauseCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800" />
              </div>
            )}
            {deed.type === 'free_parking' && (
              <div className="my-0.5 text-emerald-700 flex flex-col items-center">
                <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />
              </div>
            )}
            {deed.type === 'go_to_jail' && (
              <div className="my-0.5 text-rose-700 flex flex-col items-center">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              </div>
            )}
          </div>

          {/* Pricing tag - Clean and collision free */}
          {deed.price ? (
            <span className="text-[7px] sm:text-[8px] md:text-[8.5px] font-mono font-black text-slate-900 border-t border-slate-300/80 w-full pt-0.5 leading-none mt-auto bg-slate-100/80">
              ${deed.price}M
            </span>
          ) : isCorner && deed.type === 'go' ? (
            <span className="text-[6.5px] sm:text-[7.5px] font-mono font-black text-emerald-800 leading-none mt-auto">
              +$200M
            </span>
          ) : null}
        </div>

        {/* Ownership Corner Ribbon */}
        {owner && (
          <div
            className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-tl-md shadow-xs border-t border-l border-white/70"
            style={{ backgroundColor: owner.color }}
            title={`Owned by ${owner.name}`}
          />
        )}

        {/* Animated Players on this Tile with Smooth Hop Spring Physics */}
        {playersHere.length > 0 && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex items-center justify-center gap-1 p-0.5 z-20">
            {playersHere.map((p) => (
              <motion.div
                key={p.id}
                layoutId={`token-${p.id}`}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.45)] flex items-center justify-center text-white ring-1 ring-black/20"
                style={{ backgroundColor: p.color }}
                title={`${p.name} is here`}
              >
                {renderPlayerToken(p.tokenType)}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full aspect-square p-1 sm:p-1.5 bg-[#1b2b20] rounded-2xl border-2 sm:border-4 border-amber-700/80 shadow-2xl flex flex-col justify-center overflow-hidden">
      {/* 11x11 Grid with authentic Monopoly proportions: corners 1.3fr, middle parcels 1fr with minmax(0,...) */}
      <div className="grid grid-cols-[minmax(0,1.3fr)_repeat(9,minmax(0,1fr))_minmax(0,1.3fr)] grid-rows-[minmax(0,1.3fr)_repeat(9,minmax(0,1fr))_minmax(0,1.3fr)] aspect-square w-full h-full bg-[#fdfbf7] rounded-xl border border-slate-800 overflow-hidden shadow-inner relative">
        {/* CORNER: Space 20 (Top-Left: MICROGRID OASIS) */}
        <div className="col-start-1 row-start-1">{renderSpace(20, 'corner')}</div>

        {/* TOP ROW: Spaces 21 to 29 (Left to Right) */}
        <div className="col-start-2 row-start-1">{renderSpace(21, 'top')}</div>
        <div className="col-start-3 row-start-1">{renderSpace(22, 'top')}</div>
        <div className="col-start-4 row-start-1">{renderSpace(23, 'top')}</div>
        <div className="col-start-5 row-start-1">{renderSpace(24, 'top')}</div>
        <div className="col-start-6 row-start-1">{renderSpace(25, 'top')}</div>
        <div className="col-start-7 row-start-1">{renderSpace(26, 'top')}</div>
        <div className="col-start-8 row-start-1">{renderSpace(27, 'top')}</div>
        <div className="col-start-9 row-start-1">{renderSpace(28, 'top')}</div>
        <div className="col-start-10 row-start-1">{renderSpace(29, 'top')}</div>

        {/* CORNER: Space 30 (Top-Right: GRID COLLAPSE / GO TO JAIL) */}
        <div className="col-start-11 row-start-1">{renderSpace(30, 'corner')}</div>

        {/* RIGHT COLUMN: Spaces 31 to 39 (Top to Bottom) */}
        <div className="col-start-11 row-start-2">{renderSpace(31, 'right')}</div>
        <div className="col-start-11 row-start-3">{renderSpace(32, 'right')}</div>
        <div className="col-start-11 row-start-4">{renderSpace(33, 'right')}</div>
        <div className="col-start-11 row-start-5">{renderSpace(34, 'right')}</div>
        <div className="col-start-11 row-start-6">{renderSpace(35, 'right')}</div>
        <div className="col-start-11 row-start-7">{renderSpace(36, 'right')}</div>
        <div className="col-start-11 row-start-8">{renderSpace(37, 'right')}</div>
        <div className="col-start-11 row-start-9">{renderSpace(38, 'right')}</div>
        <div className="col-start-11 row-start-10">{renderSpace(39, 'right')}</div>

        {/* CORNER: Space 0 (Bottom-Right: GRID SYNC / GO) */}
        <div className="col-start-11 row-start-11">{renderSpace(0, 'corner')}</div>

        {/* BOTTOM ROW: Spaces 9 to 1 (Right to Left) */}
        <div className="col-start-10 row-start-11">{renderSpace(9, 'bottom')}</div>
        <div className="col-start-9 row-start-11">{renderSpace(8, 'bottom')}</div>
        <div className="col-start-8 row-start-11">{renderSpace(7, 'bottom')}</div>
        <div className="col-start-7 row-start-11">{renderSpace(6, 'bottom')}</div>
        <div className="col-start-6 row-start-11">{renderSpace(5, 'bottom')}</div>
        <div className="col-start-5 row-start-11">{renderSpace(4, 'bottom')}</div>
        <div className="col-start-4 row-start-11">{renderSpace(3, 'bottom')}</div>
        <div className="col-start-3 row-start-11">{renderSpace(2, 'bottom')}</div>
        <div className="col-start-2 row-start-11">{renderSpace(1, 'bottom')}</div>

        {/* CORNER: Space 10 (Bottom-Left: CURTAILMENT BAY / JAIL) */}
        <div className="col-start-1 row-start-11">{renderSpace(10, 'corner')}</div>

        {/* LEFT COLUMN: Spaces 19 to 11 (Bottom to Top) */}
        <div className="col-start-1 row-start-10">{renderSpace(19, 'left')}</div>
        <div className="col-start-1 row-start-9">{renderSpace(18, 'left')}</div>
        <div className="col-start-1 row-start-8">{renderSpace(17, 'left')}</div>
        <div className="col-start-1 row-start-7">{renderSpace(16, 'left')}</div>
        <div className="col-start-1 row-start-6">{renderSpace(15, 'left')}</div>
        <div className="col-start-1 row-start-5">{renderSpace(14, 'left')}</div>
        <div className="col-start-1 row-start-4">{renderSpace(13, 'left')}</div>
        <div className="col-start-1 row-start-3">{renderSpace(12, 'left')}</div>
        <div className="col-start-1 row-start-2">{renderSpace(11, 'left')}</div>

        {/* CENTER ARENA: Columns 2 to 10, Rows 2 to 10 */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-gradient-to-b from-[#e8eedd] via-[#dce8ce] to-[#e4eed7] p-2 sm:p-4 flex flex-col items-center justify-between relative overflow-hidden">
          {/* Subtle Wind Turbine Watermark in Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
            <Wind className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 text-emerald-950 animate-spin [animation-duration:35s]" />
          </div>

          {/* Top of Center: Elegant Vintage Title Banner */}
          <div className="text-center z-10 pt-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-emerald-950 font-serif drop-shadow-xs leading-none">
              WINDOPOLY
            </h1>
            <p className="text-[10px] sm:text-xs text-emerald-900 font-bold uppercase tracking-wider mt-0.5">
              Clean Energy Empire • Language Acquisition
            </p>
          </div>

          {/* Integrated Center Player Status (No floating header) */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 z-10 my-0.5">
            {/* Player 1 Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs shadow-xs transition-all ${
                activePlayerIndex === 0
                  ? 'bg-emerald-950 text-white border-emerald-400 ring-2 ring-emerald-400/60 shadow-emerald-950/40'
                  : 'bg-white/85 text-slate-800 border-slate-300'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: players[0].color }}
              >
                <Wind className="w-2.5 h-2.5" />
              </div>
              <span className="font-black text-[11px] sm:text-xs">{players[0].name}</span>
              {activePlayerIndex === 0 && (
                <span className="text-[8px] font-black uppercase bg-emerald-400 text-slate-950 px-1 py-0.2 rounded-xs">
                  TURN
                </span>
              )}
              <span className="font-mono font-bold text-[11px] sm:text-xs text-emerald-400">
                ${players[0].money}M
              </span>
              <span className="text-[10px] opacity-75">
                ({players[0].propertiesOwned.length}P)
              </span>
              {onOpenCustomizer && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCustomizer();
                  }}
                  className="p-0.5 hover:bg-white/20 rounded text-slate-300 hover:text-white"
                  title="Customize Company & Avatar"
                >
                  <Building2 className="w-3 h-3 text-emerald-300" />
                </button>
              )}
            </div>

            <span className="text-emerald-900 font-black text-[10px] uppercase">VS</span>

            {/* Player 2 Badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs shadow-xs transition-all ${
                activePlayerIndex === 1
                  ? 'bg-blue-950 text-white border-blue-400 ring-2 ring-blue-400/60 shadow-blue-950/40'
                  : 'bg-white/85 text-slate-800 border-slate-300'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: players[1].color }}
              >
                <Wind className="w-2.5 h-2.5" />
              </div>
              <span className="font-black text-[11px] sm:text-xs">{players[1].name}</span>
              {activePlayerIndex === 1 && (
                <span className="text-[8px] font-black uppercase bg-blue-400 text-slate-950 px-1 py-0.2 rounded-xs">
                  TURN
                </span>
              )}
              <span className="font-mono font-bold text-[11px] sm:text-xs text-blue-400">
                ${players[1].money}M
              </span>
              <span className="text-[10px] opacity-75">
                ({players[1].propertiesOwned.length}P)
              </span>
            </div>
          </div>

          {/* Slanted Physical Card Decks flanking the Center Station */}
          <div className="w-full flex items-center justify-around z-10 my-0.5 px-2">
            {/* Grid Dispatch Notice Deck */}
            <div
              onClick={() => onDrawChance('dispatch')}
              className="w-20 h-14 sm:w-28 sm:h-20 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-xl border border-amber-300/40 shadow-[0_8px_16px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.4)] transform -rotate-6 hover:scale-105 active:scale-95 transition-transform cursor-pointer flex flex-col items-center justify-center p-1.5 text-center"
              title="Click to draw Grid Dispatch card"
            >
              <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider leading-tight drop-shadow-xs">
                GRID DISPATCH
              </span>
              <span className="text-base sm:text-xl font-black text-amber-100 font-serif">?</span>
            </div>

            {/* Center Dice Arena */}
            <div className="z-20">
              <RealDice3D
                onRollComplete={onRollComplete}
                disabled={!canRoll}
                playerName={activePlayer.name}
              />
            </div>

            {/* Climate & Policy Chest Deck */}
            <div
              onClick={() => onDrawChance('climate')}
              className="w-20 h-14 sm:w-28 sm:h-20 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 rounded-xl border border-sky-300/40 shadow-[0_8px_16px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.4)] transform rotate-6 hover:scale-105 active:scale-95 transition-transform cursor-pointer flex flex-col items-center justify-center p-1.5 text-center"
              title="Click to draw Climate Policy card"
            >
              <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider leading-tight drop-shadow-xs">
                CLIMATE CHEST
              </span>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-sky-100 mt-0.5 drop-shadow-xs" />
            </div>
          </div>

          {/* Bottom of Center: Atmospheric Weather Indicator Pill */}
          <div
            onClick={onOpenWeatherModal}
            className="z-10 cursor-pointer hover:scale-105 transition-transform flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-emerald-900/25 text-[10px] sm:text-xs text-emerald-950 shadow-sm"
            title="Click to view detailed weather probabilities & ESL vocabulary"
          >
            <span className="font-bold flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-700" />
              {weatherName}:
            </span>
            <span className="font-mono font-bold text-teal-900">
              {weatherSpeedMps} m/s
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono font-bold text-emerald-800">
              Tariff: {Math.round(weatherMultiplier * 100)}%
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-amber-700 font-bold">
              {weatherDurationTurns} {weatherDurationTurns === 1 ? 'turn' : 'turns'} left
            </span>
            <ExternalLink className="w-3 h-3 text-emerald-600 ml-0.5" />
          </div>

          {/* Holographic Vocabulary & Property Hover Tooltip Overlay */}
          <AnimatePresence>
            {hoveredDeed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2"
                onClick={() => onSpaceClick(hoveredDeed)}
              >
                <TileHoverCard
                  deed={hoveredDeed}
                  owner={getSpaceOwner(hoveredDeed.id)}
                  weatherMultiplier={weatherMultiplier}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
