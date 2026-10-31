'use client';

import React, { useState, useId } from 'react';
import { PlayerState } from './MonopolyBoard';
import { SoundManager } from '@/lib/audio';
import {
  Wind,
  Sun,
  Waves,
  BatteryCharging,
  Share2,
  Car,
  Flame,
  Plane,
  Sparkles,
  Check,
  AlertCircle,
  Volume2,
  CheckCircle2,
  X,
  Building2,
  Edit3,
} from 'lucide-react';

interface CompanyCustomizerModalProps {
  player: PlayerState;
  onSave: (updated: Partial<PlayerState>) => void;
  onClose: () => void;
}

// Vocabulary suggestions for company naming
const VOCAB_ROOTS = [
  { word: 'Aeolian', phonetic: '/eɪˈoʊ.li.ən/', meaning: 'Pertaining to the wind god Aeolus; wind energy' },
  { word: 'Helios', phonetic: '/ˈhiː.li.ɒs/', meaning: 'Sun & solar radiance' },
  { word: 'Kinetic', phonetic: '/kɪˈnet̬.ɪk/', meaning: 'Relating to movement and mechanical power' },
  { word: 'Vortex', phonetic: '/ˈvɔːr.teks/', meaning: 'Whirling energetic flow of air or fluid' },
  { word: 'Terra', phonetic: '/ˈter.ə/', meaning: 'Earth and ground-source geothermal' },
  { word: 'Hydro', phonetic: '/ˈhaɪ.droʊ/', meaning: 'Water currents and gravitational flow' },
  { word: 'Zephyr', phonetic: '/ˈzef.ɚ/', meaning: 'A light, refreshing western breeze' },
  { word: 'Solis', phonetic: '/ˈsoʊ.lɪs/', meaning: 'Pure solar energy generation' },
];

const VOCAB_ADJECTIVES = [
  'Resilient',
  'Distributed',
  'Infinite',
  'Pristine',
  'Sovereign',
  'Synergistic',
  'Circular',
  'Dynamic',
];

const VOCAB_NOUNS = [
  'Renewables',
  'Dynamics',
  'Grid Systems',
  'Ventures',
  'Alliance',
  'Power Consortium',
  'Microgrids',
  'Clean Energy',
];

// Common learner misspellings & friendly corrections
const SPELLING_DICTIONARY: Record<string, string> = {
  turbin: 'Turbine',
  turbins: 'Turbines',
  soler: 'Solar',
  sollar: 'Solar',
  renwable: 'Renewable',
  reneweble: 'Renewable',
  kintic: 'Kinetic',
  kinetick: 'Kinetic',
  aeolan: 'Aeolian',
  aeolen: 'Aeolian',
  enrgy: 'Energy',
  engery: 'Energy',
  systm: 'System',
  systms: 'Systems',
  alianse: 'Alliance',
  resiliant: 'Resilient',
  hydrolic: 'Hydraulic',
  battry: 'Battery',
  batery: 'Battery',
};

const AVATAR_OPTIONS = [
  { id: 'turbine', label: 'Wind Turbine', icon: Wind, desc: 'Aerodynamic lift & offshore arrays' },
  { id: 'solar', label: 'Solar Array', icon: Sun, desc: 'Photovoltaic irradiance harvesting' },
  { id: 'hydro', label: 'Hydro Current', icon: Waves, desc: 'Run-of-river & pumped storage' },
  { id: 'battery', label: 'Battery Hub', icon: BatteryCharging, desc: 'Megawatt-hour grid stabilization' },
  { id: 'pylon', label: 'HVDC Grid', icon: Share2, desc: 'Long-distance high-voltage transmission' },
  { id: 'car', label: 'Eco Fleet', icon: Car, desc: 'Vehicle-to-grid bidirectional power' },
  { id: 'geothermal', label: 'Geo Core', icon: Flame, desc: 'Deep earth subterranean baseload' },
  { id: 'drone', label: 'Airborne Blade', icon: Plane, desc: 'Tethered troposphere high-altitude wind' },
];

const BRAND_COLORS = [
  { hex: '#059669', name: 'Emerald Wind' },
  { hex: '#0284c7', name: 'Deep Ocean Blue' },
  { hex: '#d97706', name: 'Solar Amber' },
  { hex: '#7c3aed', name: 'Electric Violet' },
  { hex: '#0d9488', name: 'Teal Hydro' },
  { hex: '#e11d48', name: 'Kinetic Rose' },
];

export function CompanyCustomizerModal({
  player,
  onSave,
  onClose,
}: CompanyCustomizerModalProps) {
  const companyInputId = useId();
  const leaderInputId = useId();
  const [name, setName] = useState(player.name || 'Andrés Silva');
  const [companyName, setCompanyName] = useState(
    player.companyName || 'Andrés Kinetic Renewables'
  );
  const [companySlogan, setCompanySlogan] = useState(
    player.companySlogan || 'Pioneering clean megawatts for a resilient zero-carbon grid'
  );
  const [tokenType, setTokenType] = useState(player.tokenType || 'turbine');
  const [color, setColor] = useState(player.color || '#059669');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Real-time spelling evaluation
  const wordsInCompany = companyName.trim().split(/\s+/).filter(Boolean);
  const spellingFeedback = wordsInCompany.map((word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    const suggestion = SPELLING_DICTIONARY[cleanWord];
    return {
      original: word,
      clean: cleanWord,
      suggestion,
      isCorrect: !suggestion,
    };
  });

  const hasTypo = spellingFeedback.some((item) => item.suggestion);

  // Pronounce company name with speech synthesis
  const handleSpeakName = () => {
    setIsPlayingAudio(true);
    SoundManager.speak(
      `${companyName}. Headquartered by clean energy director ${name}. ${companySlogan}`,
      0.9,
      () => setIsPlayingAudio(false)
    );
  };

  const handleApplySuggestion = (targetWord: string, replacement: string) => {
    const updated = companyName.replace(new RegExp(`\\b${targetWord}\\b`, 'i'), replacement);
    setCompanyName(updated);
    SoundManager.playSuccessChime();
  };

  const handleAppendWord = (word: string) => {
    setCompanyName((prev) => (prev ? `${prev} ${word}` : word));
    SoundManager.playCardFlip();
  };

  const handleSaveProfile = () => {
    onSave({
      name,
      companyName,
      companySlogan,
      tokenType: tokenType as PlayerState['tokenType'],
      color,
      spellingScore: (player.spellingScore || 0) + (hasTypo ? 10 : 30),
    });
    setRegisteredSuccess(true);
    SoundManager.playSuccessChime();
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border-2 border-emerald-500/60 rounded-3xl max-w-2xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                Company & Avatar Customizer
              </h2>
              <p className="text-[11px] text-emerald-300 font-medium">
                English Spelling Practice & Clean Energy Corporate Identity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
          {/* Executive Name & Avatar Pick */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={leaderInputId} className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Executive Name (Learner Profile)
              </label>
              <input
                id={leaderInputId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Andrés Silva"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-white font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Corporate Color Accent
              </label>
              <div className="flex items-center gap-2 pt-1">
                {BRAND_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      color === c.hex
                        ? 'border-white scale-110 shadow-lg ring-2 ring-emerald-400'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Token Avatar Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Choose In-Game Token & Generation Specialty
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = tokenType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTokenType(opt.id as PlayerState['tokenType']);
                      SoundManager.playCardFlip();
                    }}
                    className={`flex flex-col items-center text-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-md text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-white"
                      style={{ backgroundColor: isSelected ? color : '#334155' }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Company Name & Interactive Spelling Practice */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor={companyInputId} className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Company Name (Type & Practice English Spelling)
              </label>
              <button
                type="button"
                onClick={handleSpeakName}
                disabled={isPlayingAudio || !companyName.trim()}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Listen</span>
              </button>
            </div>

            <input
              id={companyInputId}
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Andrés Kinetic Renewables"
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-white font-extrabold text-base outline-none tracking-wide"
            />

            {/* Spelling Assistant Live Feedback */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Spelling & Vocabulary Analysis:</span>
                {hasTypo ? (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold text-[11px]">
                    <AlertCircle className="w-3 h-3" /> Friendly spelling suggestion available
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Perfect English spelling! (+30 Credits)
                  </span>
                )}
              </div>

              {/* Word by word breakdown */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {spellingFeedback.map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
                      item.suggestion
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {item.original}
                    {item.suggestion && (
                      <button
                        type="button"
                        onClick={() => handleApplySuggestion(item.original, item.suggestion!)}
                        className="underline font-bold text-amber-200 hover:text-white ml-0.5"
                        title={`Replace with correct spelling: ${item.suggestion}`}
                      >
                        → {item.suggestion}
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Vocabulary Bank Suggestions */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tap to Add Advanced English Clean Energy Vocabulary:
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase w-12">Roots:</span>
                  {VOCAB_ROOTS.map((r) => (
                    <button
                      key={r.word}
                      type="button"
                      onClick={() => handleAppendWord(r.word)}
                      className="px-2 py-0.5 rounded-md text-xs bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
                      title={`${r.phonetic} • ${r.meaning}`}
                    >
                      + {r.word}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-amber-400 font-bold uppercase w-12">Traits:</span>
                  {VOCAB_ADJECTIVES.map((adj) => (
                    <button
                      key={adj}
                      type="button"
                      onClick={() => handleAppendWord(adj)}
                      className="px-2 py-0.5 rounded-md text-xs bg-slate-800 hover:bg-amber-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
                    >
                      + {adj}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-sky-400 font-bold uppercase w-12">Nouns:</span>
                  {VOCAB_NOUNS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleAppendWord(n)}
                      className="px-2 py-0.5 rounded-md text-xs bg-slate-800 hover:bg-sky-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
                    >
                      + {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Slogan & Collocation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Corporate Mission Slogan (English Collocation Practice)
            </label>
            <input
              type="text"
              value={companySlogan}
              onChange={(e) => setCompanySlogan(e.target.value)}
              placeholder="e.g. Pioneering clean megawatts for a resilient zero-carbon grid"
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-slate-200 text-xs outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{registeredSuccess ? 'Charter Registered!' : 'Save Company Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
