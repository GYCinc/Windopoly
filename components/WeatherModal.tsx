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
  RotateCw,
  AlertTriangle,
  Zap,
  X,
  Compass,
} from 'lucide-react';

interface WeatherModalProps {
  currentWeather: DynamicWeatherEvent;
  durationTurnsLeft: number;
  onSimulateShift: () => void;
  onClose: () => void;
}

export function WeatherModal({
  currentWeather,
  durationTurnsLeft,
  onSimulateShift,
  onClose,
}: WeatherModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const getWeatherIcon = (id: string, className = 'w-6 h-6') => {
    switch (id) {
      case 'storm':
        return <CloudLightning className={`${className} text-rose-400`} />;
      case 'strong_winds':
        return <Wind className={`${className} text-amber-400`} />;
      case 'calm_period':
        return <SunDim className={`${className} text-sky-300`} />;
      case 'icing':
        return <Snowflake className={`${className} text-indigo-300`} />;
      default:
        return <Wind className={`${className} text-emerald-400`} />;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/80 rounded-2xl shadow-2xl p-5 text-white select-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-black tracking-wide text-white uppercase">
              Dynamic Weather System
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Condition Highlight */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-950/90 border border-emerald-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black/50 border border-emerald-500/30 flex items-center justify-center">
                {getWeatherIcon(currentWeather.id, 'w-7 h-7')}
              </div>
              <div>
                <span className="text-xs uppercase font-black tracking-wider text-emerald-400">
                  Current Condition
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {currentWeather.name}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {currentWeather.beaufortScale} • {currentWeather.speedMps} m/s
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                {durationTurnsLeft} {durationTurnsLeft === 1 ? 'turn' : 'turns'} left
              </span>
              <button
                type="button"
                onClick={handleSpeakWeather}
                disabled={isPlayingAudio}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-xs text-emerald-300 hover:text-white transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Pronounce</span>
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-200 leading-relaxed border-t border-slate-800/80 pt-2.5">
            {currentWeather.plainEnglishExplanation}
          </p>

          {/* Economic Tariff Impact */}
          <div className="mt-3 flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-slate-800 text-xs font-semibold">
            <span className="text-slate-300">Economic Tariff Impact:</span>
            {currentWeather.id === 'storm' ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Shut Down ($25M inspection fee)
              </span>
            ) : currentWeather.tariffMultiplier > 1 ? (
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> +50% Surge Dispatch Multiplier
              </span>
            ) : currentWeather.tariffMultiplier < 1 ? (
              <span className="text-sky-300 font-bold">50% Curtailment Rent Output</span>
            ) : (
              <span className="text-emerald-300 font-bold">100% Standard Grid Dispatch</span>
            )}
          </div>
        </div>

        {/* Probabilities Distribution */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Atmospheric Probability Distribution
            </span>
            <button
              type="button"
              onClick={onSimulateShift}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
            >
              <RotateCw className="w-3 h-3" /> Roll Front
            </button>
          </div>

          <div className="space-y-1.5">
            {Object.values(DYNAMIC_WEATHER_EVENTS).map((evt) => {
              const isCurrent = evt.id === currentWeather.id;
              return (
                <div
                  key={evt.id}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                    isCurrent
                      ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                      : 'bg-black/30 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {getWeatherIcon(evt.id, 'w-4 h-4')}
                    {evt.name}
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span>{evt.speedMps} m/s</span>
                    <span className="px-2 py-0.5 rounded bg-black/60 text-emerald-300 font-bold">
                      {evt.probability}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weather Vocabulary Lesson */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">
            ESL Weather & Meteorology Vocabulary
          </span>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {currentWeather.pedagogicalTerms.map((t, idx) => (
              <div key={idx} className="bg-black/50 p-2.5 rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{t.term}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{t.phonetic}</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5">{t.definition}</p>
                <p className="text-amber-300/80 italic text-[10px] mt-0.5">&quot;{t.example}&quot;</p>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close Weather Status
          </button>
        </div>
      </div>
    </div>
  );
}
