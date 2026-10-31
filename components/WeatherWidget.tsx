'use client';

import React, { useState } from 'react';
import { WeatherCondition } from '@/types/game';
import { Wind, CloudLightning, SunDim, Snowflake, Flame, Info, Volume2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface WeatherWidgetProps {
  currentWeather: WeatherCondition;
  turnCount: number;
}

export function WeatherWidget({ currentWeather, turnCount }: WeatherWidgetProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const getWeatherIcon = (id: string) => {
    switch (id) {
      case 'gale_storm':
        return <CloudLightning className="w-6 h-6 text-amber-500 animate-pulse" />;
      case 'calm_doldrums':
        return <SunDim className="w-6 h-6 text-orange-400" />;
      case 'arctic_frost':
        return <Snowflake className="w-6 h-6 text-sky-400" />;
      case 'heatwave_peak':
        return <Flame className="w-6 h-6 text-rose-500 animate-bounce" />;
      default:
        return <Wind className="w-6 h-6 text-teal-500" />;
    }
  };

  // Determine turbine rotation animation speed based on wind speed
  const getSpinClass = () => {
    if (currentWeather.windSpeedMps > 20) return 'animate-spin [animation-duration:0.8s]';
    if (currentWeather.windSpeedMps > 10) return 'animate-spin [animation-duration:2.5s]';
    if (currentWeather.windSpeedMps > 5) return 'animate-spin [animation-duration:5s]';
    return ''; // almost still during doldrums
  };

  const handleSpeakWeather = () => {
    SoundManager.speak(
      `Current weather: ${currentWeather.name}. Wind speed: ${currentWeather.windSpeedMps} meters per second. ${currentWeather.plainEnglishExplanation}`,
      0.85
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Weather Identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center relative overflow-hidden">
            {getWeatherIcon(currentWeather.id)}
            {/* Subtle mini turbine blade in background */}
            <div className={`absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none ${getSpinClass()}`}>
              <Wind className="w-8 h-8 text-teal-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-teal-400">
                Atmospheric Conditions
              </span>
              <button
                type="button"
                onClick={handleSpeakWeather}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Listen to weather briefing"
                aria-label="Listen to weather briefing"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {currentWeather.name}
            </h3>
          </div>
        </div>

        {/* Center: Generation & Maintenance Impacts */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Wind Velocity</span>
            <span className="text-sm font-bold text-white font-mono">
              {currentWeather.windSpeedMps} m/s
            </span>
          </div>

          <div className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Energy Output</span>
            <span
              className={`text-sm font-bold flex items-center gap-0.5 font-mono ${
                currentWeather.outputMultiplier >= 1.0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {currentWeather.outputMultiplier >= 1.0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.round(currentWeather.outputMultiplier * 100)}%
            </span>
          </div>

          <div className="bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400 block text-[11px]">Maintenance Wear</span>
            <span
              className={`text-sm font-bold font-mono ${
                currentWeather.maintenanceMultiplier > 1.2
                  ? 'text-rose-400'
                  : currentWeather.maintenanceMultiplier < 1.0
                  ? 'text-emerald-400'
                  : 'text-slate-200'
              }`}
            >
              x{currentWeather.maintenanceMultiplier.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Right: Plain English Disclosure toggle */}
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
            showExplanation
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showExplanation ? 'Hide Plain English' : 'Plain English Guide'}</span>
        </button>
      </div>

      {/* Shaded Progressive Disclosure: Plain English Explanation */}
      {showExplanation && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-sm bg-slate-950/40 p-3 rounded-xl border border-teal-900/40 text-slate-300 animate-in fade-in duration-200">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 w-2 h-2 rounded-full bg-teal-400 shrink-0" />
            <div>
              <p className="font-medium text-slate-200 leading-relaxed">
                {currentWeather.plainEnglishExplanation}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Technical meteorological summary: {currentWeather.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
