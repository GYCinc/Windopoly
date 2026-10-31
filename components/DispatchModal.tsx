'use client';

import React, { useState } from 'react';
import { DispatchNoticeCard } from '@/types/game';
import { VocabWordBadge } from './VocabWordBadge';
import { FileText, CheckCircle2, XCircle, Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface DispatchModalProps {
  card: DispatchNoticeCard;
  onComplete: (bonusEarned: number, masteredWordId?: string) => void;
}

export function DispatchModal({ card, onComplete }: DispatchModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSpeakScenario = () => {
    SoundManager.speak(`${card.title}. ${card.headline}. ${card.scenarioText}`, 0.88);
  };

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);

    const isCorrect = card.englishQuestion?.options[index]?.isCorrect;
    if (isCorrect) {
      SoundManager.playSuccessChime();
    }
  };

  const handleFinish = () => {
    let bonus = card.moneyEffect;
    let masteredWord: string | undefined = undefined;

    if (selectedOption !== null && card.englishQuestion) {
      const option = card.englishQuestion.options[selectedOption];
      if (option.isCorrect) {
        bonus += card.englishQuestion.reward;
        masteredWord = card.keyTerm;
      }
    }

    onComplete(bonus, masteredWord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-5 bg-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                Official Grid Dispatch Notice
              </span>
              <h2 className="text-lg font-black leading-tight text-white">
                {card.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSpeakScenario}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Listen to dispatch audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Headline & Scenario */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide block">
              Market Development
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {card.headline}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {card.scenarioText}
            </p>
          </div>

          {/* Key Term Highlight */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase">Target Word:</span>
            <VocabWordBadge vocabId={card.keyTerm} showDetails={false} />
          </div>

          {/* Interactive English Quiz Question */}
          {card.englishQuestion && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold uppercase text-emerald-900 tracking-wide">
                  English Language Challenge (+${card.englishQuestion.reward}M Bonus)
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-900">
                {card.englishQuestion.prompt}
              </p>

              <div className="space-y-2">
                {card.englishQuestion.options.map((opt, idx) => {
                  const isPicked = selectedOption === idx;
                  let btnStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';

                  if (showResult) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-semibold';
                    } else if (isPicked && !opt.isCorrect) {
                      btnStyle = 'bg-rose-100 border-rose-300 text-rose-950';
                    } else {
                      btnStyle = 'bg-white/50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      disabled={showResult}
                      className={`w-full p-3 text-left rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${btnStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className="flex-1">
                        <span>{opt.text}</span>
                        {showResult && isPicked && (
                          <p className={`mt-1.5 text-xs font-medium ${opt.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {opt.feedback}
                          </p>
                        )}
                      </div>
                      {showResult && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {showResult && isPicked && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Base effect: {card.moneyEffect >= 0 ? `+$${card.moneyEffect}M` : `-$${Math.abs(card.moneyEffect)}M`}
          </div>

          <button
            type="button"
            onClick={handleFinish}
            disabled={card.englishQuestion && !showResult}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 ${
              card.englishQuestion && !showResult
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-95'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Dispatch & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
