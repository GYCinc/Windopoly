'use client';

import React, { useState } from 'react';
import { ChanceCard } from '@/lib/monopoly-board-data';
import { SoundManager } from '@/lib/audio';
import {
  FileText,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChanceCardModalProps {
  card: ChanceCard;
  onApply: (moneyDelta: number, bonusReward: number, moveToSpaceId?: number) => void;
  onClose: () => void;
}

export function ChanceCardModal({ card, onApply, onClose }: ChanceCardModalProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isDispatch = card.deck === 'dispatch';
  const hasFinishedSentences = currentSentenceIndex >= card.sentenceScaffolds.length - 1;

  const playSentenceAudio = () => {
    setIsPlayingAudio(true);
    const textToRead = `${card.title}. ${card.headline}. ${card.sentenceScaffolds.join(' ')}`;
    SoundManager.speak(textToRead, 0.88, () => setIsPlayingAudio(false));
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < card.sentenceScaffolds.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1);
      SoundManager.playDiceClick();
    }
  };

  const handleSelectQuiz = (idx: number) => {
    if (showQuizResult) return;
    setSelectedOption(idx);
    setShowQuizResult(true);

    const isCorrect = card.englishQuiz.options[idx].correct;
    if (isCorrect) {
      SoundManager.playSuccessChime();
    }
  };

  const handleFinalSubmit = () => {
    let bonus = 0;
    if (selectedOption !== null && card.englishQuiz.options[selectedOption].correct) {
      bonus = card.englishQuiz.rewardBonus;
    }
    onApply(card.moneyDelta, bonus, card.moveToSpaceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.85, rotate: -3, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full border-4 shadow-2xl overflow-hidden text-slate-900"
        style={{
          borderColor: isDispatch ? '#d97706' : '#2563eb',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Header Ribbon */}
        <div
          className="p-5 text-white flex items-center justify-between"
          style={{ backgroundColor: isDispatch ? '#b45309' : '#1d4ed8' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-serif text-2xl font-black">
              {isDispatch ? '?' : '⚡'}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80 block">
                OFFICIAL MARKET CARD
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-white font-serif">
                {card.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={playSentenceAudio}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Read aloud"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Headline */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
            <h3 className="text-base font-black text-slate-900 leading-snug">
              {card.headline}
            </h3>
          </div>

          {/* Staggered Sentence-by-Sentence Reading Scaffold */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              Market Report (Sentence {currentSentenceIndex + 1} of {card.sentenceScaffolds.length})
            </span>

            <div className="space-y-2">
              {card.sentenceScaffolds.map((sentence, idx) => {
                if (idx > currentSentenceIndex) return null;

                return (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-sm font-semibold text-slate-800 leading-relaxed"
                  >
                    {sentence}
                  </motion.p>
                );
              })}
            </div>

            {!hasFinishedSentences && (
              <button
                type="button"
                onClick={handleNextSentence}
                className="w-full py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Read Next Sentence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Summary Outcome */}
          {hasFinishedSentences && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-400 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                  Grid Action Outcome
                </span>
                <span className="text-sm font-black text-emerald-950">
                  {card.actionSummary}
                </span>
              </div>
              <span className="text-lg font-black font-mono text-emerald-700">
                {card.moneyDelta >= 0 ? `+$${card.moneyDelta}M` : `-$${Math.abs(card.moneyDelta)}M`}
              </span>
            </div>
          )}

          {/* English Vocabulary Challenge Question */}
          {hasFinishedSentences && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-purple-900 tracking-wider">
                <HelpCircle className="w-4 h-4 text-purple-700" />
                <span>English Challenge (+${card.englishQuiz.rewardBonus}M Bonus)</span>
              </div>

              <p className="text-xs font-bold text-slate-800">
                {card.englishQuiz.question}
              </p>

              <div className="space-y-2">
                {card.englishQuiz.options.map((opt, idx) => {
                  let btnColor = 'bg-white border-slate-300 text-slate-800 hover:bg-purple-100/60';
                  if (showQuizResult) {
                    if (opt.correct) {
                      btnColor = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                    } else if (selectedOption === idx) {
                      btnColor = 'bg-rose-100 border-rose-300 text-rose-950';
                    } else {
                      btnColor = 'bg-white/50 border-slate-200 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={showQuizResult}
                      onClick={() => handleSelectQuiz(idx)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs leading-relaxed transition-all cursor-pointer ${btnColor}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold">{String.fromCharCode(65 + idx)}.</span>
                        <div className="flex-1">
                          <span>{opt.text}</span>
                          {showQuizResult && selectedOption === idx && (
                            <p className={`mt-1 font-semibold ${opt.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
                              {opt.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-300 flex items-center justify-end">
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={!hasFinishedSentences || !showQuizResult}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 ${
              hasFinishedSentences && showQuizResult
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-95'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Card & Continue Match</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
