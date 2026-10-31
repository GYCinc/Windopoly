'use client';

import React, { useState } from 'react';
import { VOCABULARY_DATABASE } from '@/lib/energy-data';
import { VocabWord } from '@/types/game';
import { VocabWordBadge } from './VocabWordBadge';
import {
  BookOpen,
  X,
  Search,
  Volume2,
  CheckCircle,
  Award,
  Sparkles,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface VocabularyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  masteredVocabIds: string[];
  onMarkMastered: (id: string) => void;
  onAwardBonus: (amount: number) => void;
}

export function VocabularyDrawer({
  isOpen,
  onClose,
  masteredVocabIds,
  onMarkMastered,
  onAwardBonus,
}: VocabularyDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [quizWord, setQuizWord] = useState<VocabWord | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  if (!isOpen) return null;

  const words = Object.values(VOCABULARY_DATABASE);

  const filteredWords = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.simpleDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.energyContext.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || w.cefrLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const startQuiz = (word: VocabWord) => {
    setQuizWord(word);
    setQuizAnswer(null);
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = (selected: string) => {
    if (quizSubmitted || !quizWord) return;
    setQuizAnswer(selected);
    setQuizSubmitted(true);

    if (selected === quizWord.simpleDefinition) {
      SoundManager.playSuccessChime();
      onMarkMastered(quizWord.id);
      onAwardBonus(15);
    }
  };

  // Generate 2 distractor definitions for flashcard quiz
  const getDistractors = (target: VocabWord) => {
    const others = words.filter((w) => w.id !== target.id);
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    const distractors = [shuffled[0].simpleDefinition, shuffled[1].simpleDefinition];
    return [target.simpleDefinition, ...distractors].sort(() => 0.5 - Math.random());
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex justify-end pointer-events-none">
      <div className="pointer-events-auto bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-300 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">English Energy Glossary</h2>
              <span className="text-xs text-emerald-200">
                {masteredVocabIds.length} of {words.length} Terms Practiced
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & CEFR Level Filter */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words, definitions, or contexts..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1 text-[11px]">
              <Filter className="w-3 h-3" /> CEFR Level:
            </span>
            {['ALL', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                  levelFilter === lvl
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Quick Quiz Card if active */}
          {quizWord && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wide text-emerald-900">
                    Quick Vocabulary Challenge
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuizWord(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>

              <div>
                <span className="text-base font-black text-slate-900">{quizWord.word}</span>
                <span className="text-xs font-mono text-slate-500 ml-2">{quizWord.phonetic}</span>
                <p className="text-xs font-medium text-slate-700 mt-1">
                  Which definition matches this energy term? (Win +$15M!)
                </p>
              </div>

              <div className="space-y-2">
                {getDistractors(quizWord).map((def, idx) => {
                  const isTarget = def === quizWord.simpleDefinition;
                  const isSelected = quizAnswer === def;
                  let btnColor = 'bg-white border-slate-200 text-slate-800 hover:bg-emerald-100/50';

                  if (quizSubmitted) {
                    if (isTarget) {
                      btnColor = 'bg-emerald-200 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isSelected) {
                      btnColor = 'bg-rose-100 border-rose-300 text-rose-950';
                    } else {
                      btnColor = 'bg-white/60 text-slate-400 border-slate-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={quizSubmitted}
                      onClick={() => handleQuizSubmit(def)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${btnColor}`}
                    >
                      {def}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <div className="pt-2 text-xs flex items-center justify-between font-semibold">
                  {quizAnswer === quizWord.simpleDefinition ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> Correct! +$15M awarded!
                    </span>
                  ) : (
                    <span className="text-rose-700">Review the definition above.</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setQuizWord(null)}
                    className="text-xs font-bold px-3 py-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                  >
                    Close Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {filteredWords.map((item) => {
            const isMastered = masteredVocabIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 transition-all hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.word}</span>
                      <span className="text-xs font-mono text-slate-500">{item.phonetic}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {item.cefrLevel}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.syllables} • {item.partOfSpeech}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => SoundManager.speak(`${item.word}. ${item.simpleDefinition}`, 0.85)}
                      className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => startQuiz(item)}
                      className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                      title="Practice this word"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {item.simpleDefinition}
                </p>

                <div className="p-2 bg-slate-100/80 rounded-lg text-[11px] text-slate-600 italic">
                  &quot;{item.exampleSentence}&quot;
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-amber-800 font-medium">
                    Tip: {item.businessTip}
                  </span>
                  {isMastered && (
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Mastered
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
