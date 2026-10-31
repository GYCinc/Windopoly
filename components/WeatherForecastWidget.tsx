'use client';

import React, { useState } from 'react';
import {
  DynamicWeatherEvent,
  DYNAMIC_WEATHER_EVENTS,
} from '@/lib/weatherEngine';
import { SoundManager } from '@/lib/audio';
import {
  Wind,
  CloudLightning,
  SunDim,
  Snowflake,
  Volume2,
  ChevronDown,
  ChevronUp,
  RotateCw,
  AlertTriangle,
  Zap,
  Info,
} from 'lucide-react';

interface WeatherForecastWidgetProps {
  currentWeather: DynamicWeatherEvent;
  durationTurnsLeft: number;
  onSimulateShift: () => void;
}

export function WeatherForecastWidget({
  currentWeather,
  durationTurnsLeft,
  onSimulateShift,
}: WeatherForecastWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const getWeatherIcon = (id: string) => {
    switch (id) {
      case 'storm':
        return <CloudLightning className="w-5 h-5 text-rose-400 animate-pulse" />;
      case 'strong_winds':
        return <Wind className="w-5 h-5 text-amber-400" />;
      case 'calm_period':
        return <SunDim className="w-5 h-5 text-sky-300" />;
      case 'icing':
        return <Snowflake className="w-5 h-5 text-indigo-300" />;
      default:
        return <Wind className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleSpeakWeather = () => {
    setIsPlayingAudio(true);
    SoundManager.speak(
      `Atmospheric status: ${currentWeather.name}. Wind speed: ${currentWeather.speedMps} meters per second. ${currentWeather.plainEnglishExplanation}`,
      0.9,
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <div className="relative">
      {/* Compact Status Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-md text-white text-xs select-none">
        {/* Weather Icon & Name */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
            {getWeatherIcon(currentWeather.id)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-slate-100 text-[11px] sm:text-xs">
                {currentWeather.name}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30">
                {currentWeather.speedMps} m/s
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">
              {currentWeather.beaufortScale}
            </span>
          </div>
        </div>

        {/* Duration Countdown Badge */}
        <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md border border-slate-700 text-[10px] font-mono text-amber-300">
          <span>Active:</span>
          <span className="font-bold">{durationTurnsLeft} {durationTurnsLeft === 1 ? 'turn' : 'turns'} left</span>
        </div>

        {/* Multiplier / Impact Pill */}
        {currentWeather.id === 'storm' ? (
          <span className="hidden sm:inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Cut-Out Locked ($25M Fee)
          </span>
        ) : currentWeather.tariffMultiplier > 1 ? (
          <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
            <Zap className="w-3 h-3" /> +50% Payout
          </span>
        ) : currentWeather.tariffMultiplier < 1 ? (
          <span className="hidden sm:inline-flex items-center gap-1 bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
            50% Low Breeze
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
            100% Rated
          </span>
        )}

        {/* Audio Speech */}
        <button
          type="button"
          onClick={handleSpeakWeather}
          disabled={isPlayingAudio}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Listen to atmospheric condition"
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        {/* Expand / Forecast details */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-0.5 p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-[10px] font-bold"
          title="Atmospheric probability & vocabulary"
        >
          <span>Probabilities</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Forecast & Vocabulary Popover */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 z-40 w-80 sm:w-96 bg-slate-900 border-2 border-emerald-500/70 rounded-2xl p-4 shadow-2xl text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-400" /> Dynamic Weather Probabilities
            </span>
            <button
              type="button"
              onClick={onSimulateShift}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-[10px] font-bold transition-colors"
              title="Test a probabilistic weather shift"
            >
              <RotateCw className="w-3 h-3" /> Roll Front
            </button>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            {currentWeather.plainEnglishExplanation}
          </p>

          {/* Probability Matrix */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Atmospheric Probability Distribution:
            </span>
            {Object.values(DYNAMIC_WEATHER_EVENTS).map((evt) => {
              const isCurrent = evt.id === currentWeather.id;
              return (
                <div
                  key={evt.id}
                  className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                      : 'bg-black/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {getWeatherIcon(evt.id)}
                    {evt.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span>{evt.speedMps} m/s</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-emerald-300 font-bold">
                      {evt.probability}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weather Vocabulary in Context */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              Weather Mechanics & Terminology:
            </span>
            {currentWeather.pedagogicalTerms.map((t, idx) => (
              <div key={idx} className="bg-black/50 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{t.term}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{t.phonetic}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">{t.definition}</p>
                <p className="text-[10px] text-amber-300/90 italic mt-0.5">&quot;{t.example}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
