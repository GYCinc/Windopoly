'use client';

import React, { useState } from 'react';
import { PropertyDeed } from '@/lib/monopoly-board-data';
import { SoundManager } from '@/lib/audio';
import {
  Volume2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  X,
  ArrowRight,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface LandingLessonModalProps {
  deed: PropertyDeed;
  playerName: string;
  onContinue: () => void;
  onAwardBonus?: (amount: number) => void;
}

// Generate contextual comprehension checks based on the target vocabulary
function getComprehensionQuestion(deed: PropertyDeed) {
  const word = deed.vocabWord.toLowerCase();

  if (word.includes('turbine') || word.includes('generator')) {
    return {
      prompt: `In clean energy engineering, what is the core role of a "${deed.vocabWord}"?`,
      options: [
        { text: 'Converts kinetic mechanical energy into electricity', correct: true },
        { text: 'Stores chemical fuel in tanks', correct: false },
        { text: 'Burns gas to produce high pressure steam', correct: false },
      ],
      explanation: 'Turbines harness aerodynamic lift or fluid movement to spin generator coils, producing clean alternating current.',
    };
  }

  if (word.includes('curtail') || word.includes('congestion')) {
    return {
      prompt: `Why would a grid operator order "${deed.vocabWord}" on a wind farm?`,
      options: [
        { text: 'Transmission lines are overloaded, requiring generation throttling', correct: true },
        { text: 'Blades need to spin twice as fast', correct: false },
        { text: 'Electricity prices have surged to record highs', correct: false },
      ],
      explanation: 'Curtailment occurs when generation exceeds local wire capacity or market demand, forcing turbines to idle.',
    };
  }

  if (word.includes('photovoltaic') || word.includes('solar') || word.includes('irradiance')) {
    return {
      prompt: `What physical effect allows "${deed.vocabWord}" to generate power?`,
      options: [
        { text: 'Direct excitation of silicon electrons by sunlight photons', correct: true },
        { text: 'Combustion of solar hydrogen gas', correct: false },
        { text: 'Mechanical friction on glass panels', correct: false },
      ],
      explanation: 'Photovoltaic cells release electric charge directly when photon packets dislodge electrons within semiconductor wafers.',
    };
  }

  return {
    prompt: `In professional energy trade, how is "${deed.vocabWord}" best defined?`,
    options: [
      { text: deed.definition, correct: true },
      { text: 'A fossil-fuel combustion method', correct: false },
      { text: 'An emergency battery disconnection switch', correct: false },
    ],
    explanation: deed.energyExplanation,
  };
}

export function LandingLessonModal({
  deed,
  playerName,
  onContinue,
  onAwardBonus,
}: LandingLessonModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<0.85 | 1.0>(0.85);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResolved, setQuizResolved] = useState(false);

  const question = getComprehensionQuestion(deed);

  const handleSpeak = (textToSpeak: string) => {
    setIsPlayingAudio(true);
    SoundManager.speak(textToSpeak, speechRate, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleAnswer = (index: number) => {
    if (quizResolved) return;
    setSelectedOption(index);
    setQuizResolved(true);

    const isCorrect = question.options[index]?.correct;
    if (isCorrect) {
      SoundManager.playSuccessChime();
      if (onAwardBonus) onAwardBonus(20);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1329] border-2 border-emerald-500/70 rounded-3xl max-w-xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Sleek Top Banner */}
        <div
          className="px-5 py-3 border-b flex items-center justify-between"
          style={{
            backgroundColor: `${deed.colorHex}25`,
            borderColor: `${deed.colorHex}60`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: deed.colorHex }}
            />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
              {deed.name} • Space #{deed.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              CEFR {deed.cefrLevel}
            </span>
            <button
              onClick={onContinue}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-sm">
          {/* Situation Briefing */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
              Field Scenario • {playerName} Grounded On Site
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {deed.energyExplanation}
            </p>
          </div>

          {/* Spotlight Vocabulary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-[#101b33] to-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-lg space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Spotlight Renewable Vocabulary
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                  {deed.vocabWord}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                  <span>{deed.phonetic}</span>
                  <span>•</span>
                  <span>{deed.syllables}</span>
                  <span>•</span>
                  <span className="italic">{deed.partOfSpeech}</span>
                </div>
              </div>

              {/* Audio Pronunciation Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSpeechRate((r) => (r === 0.85 ? 1.0 : 0.85))}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-700"
                  title="Toggle playback speed"
                >
                  {speechRate === 0.85 ? '0.85x (Learner)' : '1.0x (Native)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSpeak(`${deed.vocabWord}. ${deed.definition}`)}
                  disabled={isPlayingAudio}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold text-xs transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? 'Speaking…' : 'Listen'}</span>
                </button>
              </div>
            </div>

            {/* Plain English Definition */}
            <p className="text-xs sm:text-sm text-slate-100 font-semibold bg-black/40 p-2.5 rounded-xl border border-slate-800">
              💡 {deed.definition}
            </p>

            {/* Sample Business Sentence */}
            <div className="text-xs text-slate-300 italic pl-3 border-l-2 border-amber-400/80">
              &quot;{deed.sampleSentence}&quot;
            </div>
          </div>

          {/* Quick Knowledge Check Mini-Quiz */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                Quick Literacy Check (+20M Bonus Credits)
              </span>
              {quizResolved && (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Answered
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium">{question.prompt}</p>

            <div className="space-y-1.5 pt-1">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800';

                if (quizResolved) {
                  if (opt.correct) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizResolved}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                  >
                    <span>{opt.text}</span>
                    {quizResolved && opt.correct && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Action Button */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Learn through play • Renewable Language Acquisition
          </span>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            <span>Proceed to Parcel Action</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
