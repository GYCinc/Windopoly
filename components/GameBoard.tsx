'use client';

import React from 'react';
import { BoardTile, Player, WeatherCondition } from '@/types/game';
import { motion } from 'motion/react';
import {
  Wind,
  Zap,
  Share2,
  FileText,
  Users,
  AlertTriangle,
  PauseCircle,
  PiggyBank,
  Wrench,
  CheckCircle2,
  BatteryCharging,
  Compass,
  Waves,
} from 'lucide-react';

interface GameBoardProps {
  tiles: BoardTile[];
  players: Player[];
  activePlayerId: string;
  weather: WeatherCondition;
  onTileClick: (tile: BoardTile) => void;
  centerChildren?: React.ReactNode;
}

export function GameBoard({
  tiles,
  players,
  activePlayerId,
  weather,
  onTileClick,
  centerChildren,
}: GameBoardProps) {
  // Tile icon mapper
  const renderTileIcon = (tile: BoardTile) => {
    switch (tile.type) {
      case 'start':
        return tile.id === 0 ? <Zap className="w-4 h-4 text-emerald-600" /> : <PiggyBank className="w-4 h-4 text-emerald-600" />;
      case 'wind_farm':
        return tile.group === 'coastal_wind' || tile.group === 'offshore_deep' || tile.group === 'floating_mega' ? (
          <Waves className="w-4 h-4 text-teal-600" />
        ) : (
          <Wind className="w-4 h-4 text-emerald-600" />
        );
      case 'grid_infrastructure':
        return <Share2 className="w-4 h-4 text-sky-600" />;
      case 'storage':
        return <BatteryCharging className="w-4 h-4 text-purple-600" />;
      case 'dispatch_notice':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'boardroom_dialogue':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'variable_maintenance':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'curtailment_bay':
        return tile.id === 6 ? <PauseCircle className="w-4 h-4 text-slate-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'environmental_audit':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Wind className="w-4 h-4 text-slate-600" />;
    }
  };

  // Find owner for a tile
  const getOwner = (tileId: number): Player | undefined => {
    return players.find((p) => p.propertiesOwned.includes(tileId));
  };

  // Render a single tile on the grid
  const renderTile = (tileIndex: number, gridAreaStyle?: string) => {
    const tile = tiles[tileIndex];
    if (!tile) return null;

    const owner = getOwner(tile.id);
    const playersHere = players.filter((p) => p.position === tile.id);
    const isCorner = [0, 6, 12, 18].includes(tile.id);

    return (
      <div
        key={tile.id}
        onClick={() => onTileClick(tile)}
        className={`relative flex flex-col justify-between p-2 rounded-xl border transition-all cursor-pointer select-none overflow-hidden ${gridAreaStyle || ''} ${
          isCorner
            ? 'bg-slate-800 hover:bg-slate-700/90 border-slate-600 text-white font-bold shadow-md'
            : 'bg-slate-900/95 hover:bg-slate-850 hover:border-emerald-400 hover:shadow-lg border-slate-700/80 shadow-xs'
        }`}
      >
        {/* Top Vibrant Sector Color Header Band */}
        <div
          className="h-1.5 w-full rounded-full shrink-0 mb-1 shadow-xs"
          style={{ backgroundColor: tile.accentColor || '#10b981' }}
        />

        {/* Tile Content */}
        <div className="flex-1 flex flex-col justify-between min-h-[62px]">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold text-slate-400">
                #{tile.id}
              </span>
              <div className="p-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                {renderTileIcon(tile)}
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-bold text-slate-100 line-clamp-2 leading-tight mt-0.5">
              {tile.name}
            </span>
          </div>

          {/* Pricing, Generation & Tier Label */}
          <div className="mt-0.5 flex items-center justify-between text-[10px] sm:text-[11px] pt-1 border-t border-slate-800/60">
            {tile.cost ? (
              <span className="font-mono font-black text-emerald-400">${tile.cost}M</span>
            ) : (
              <span className="text-slate-300 font-semibold text-[9px] sm:text-[10px] capitalize">
                {tile.type.replace('_', ' ')}
              </span>
            )}

            {/* Upgrades or Base MWh */}
            {tile.upgradesCount && tile.upgradesCount > 0 ? (
              <span className="flex items-center text-amber-400 font-black text-xs">
                ★{tile.upgradesCount}
              </span>
            ) : (
              tile.baseOutputMWh > 0 && (
                <span className="text-[9px] text-sky-300 font-mono font-semibold bg-sky-950/60 px-1 rounded border border-sky-800/50">
                  {tile.baseOutputMWh}MWh
                </span>
              )
            )}
          </div>
        </div>

        {/* Ownership Tag */}
        {owner && (
          <div
            className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: owner.color }}
            title={`Owned by ${owner.name}`}
          />
        )}

        {/* Player Pawns Presence - Non-obscuring dedicated badge */}
        {playersHere.length > 0 && (
          <div className="absolute top-1 left-6 flex items-center gap-1 z-10 pointer-events-none">
            {playersHere.map((p) => (
              <motion.div
                key={p.id}
                layoutId={`pawn-${p.id}`}
                className="w-4 h-4 rounded-full border border-white shadow-xs flex items-center justify-center text-[9px] font-black text-white shrink-0"
                style={{ backgroundColor: p.color }}
                title={`${p.name} is here`}
              >
                {p.name.charAt(0)}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 24 Tiles in a 7x7 grid border:
  return (
    <div className="w-full max-w-[650px] mx-auto bg-slate-900/60 p-2 sm:p-3 rounded-2xl border border-slate-800 shadow-xl">
      <div className="grid grid-cols-7 grid-rows-7 gap-1 sm:gap-1.5 aspect-square w-full">
        {/* Top Row: Tile 0 to 6 */}
        <div className="col-start-1 row-start-1">{renderTile(0)}</div>
        <div className="col-start-2 row-start-1">{renderTile(1)}</div>
        <div className="col-start-3 row-start-1">{renderTile(2)}</div>
        <div className="col-start-4 row-start-1">{renderTile(3)}</div>
        <div className="col-start-5 row-start-1">{renderTile(4)}</div>
        <div className="col-start-6 row-start-1">{renderTile(5)}</div>
        <div className="col-start-7 row-start-1">{renderTile(6)}</div>

        {/* Right Column: Tile 7 to 11 */}
        <div className="col-start-7 row-start-2">{renderTile(7)}</div>
        <div className="col-start-7 row-start-3">{renderTile(8)}</div>
        <div className="col-start-7 row-start-4">{renderTile(9)}</div>
        <div className="col-start-7 row-start-5">{renderTile(10)}</div>
        <div className="col-start-7 row-start-6">{renderTile(11)}</div>

        {/* Bottom Row: Tile 12 (col 7) to Tile 18 (col 1) */}
        <div className="col-start-7 row-start-7">{renderTile(12)}</div>
        <div className="col-start-6 row-start-7">{renderTile(13)}</div>
        <div className="col-start-5 row-start-7">{renderTile(14)}</div>
        <div className="col-start-4 row-start-7">{renderTile(15)}</div>
        <div className="col-start-3 row-start-7">{renderTile(16)}</div>
        <div className="col-start-2 row-start-7">{renderTile(17)}</div>
        <div className="col-start-1 row-start-7">{renderTile(18)}</div>

        {/* Left Column: Tile 19 to 23 (bottom to top) */}
        <div className="col-start-1 row-start-6">{renderTile(19)}</div>
        <div className="col-start-1 row-start-5">{renderTile(20)}</div>
        <div className="col-start-1 row-start-4">{renderTile(21)}</div>
        <div className="col-start-1 row-start-3">{renderTile(22)}</div>
        <div className="col-start-1 row-start-2">{renderTile(23)}</div>

        {/* Center Control & Dice Arena: Col 2 to 6, Row 2 to 6 (5x5 cells) */}
        <div className="col-start-2 col-end-7 row-start-2 row-end-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center text-center overflow-hidden relative">
          {centerChildren}
        </div>
      </div>
    </div>
  );
}
