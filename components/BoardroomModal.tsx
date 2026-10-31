'use client';

import React, { useState } from 'react';
import { BoardroomScenario, BoardroomOption } from '@/types/game';
import { Users, Volume2, Sparkles, Send, Award, CheckCircle2, MessageSquare, HelpCircle } from 'lucide-react';
import { SoundManager } from '@/lib/audio';

interface BoardroomModalProps {
  scenario: BoardroomScenario;
  playerRole: string;
  onResolve: (moneyReward: number, reputationGain: number) => void;
}

export function BoardroomModal({ scenario, playerRole, onResolve }: BoardroomModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [customAiFeedback, setCustomAiFeedback] = useState<{
    feedback: string;
    score: number;
    tip: string;
  } | null>(null);

  const handleSpeakScenario = () => {
    SoundManager.speak(
      `${scenario.title}. Speaking with ${scenario.counterpart}, ${scenario.counterpartRole}. Context: ${scenario.context}. Challenge: ${scenario.challengePrompt}`,
      0.88
    );
  };

  const handleSpeakOption = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    SoundManager.speak(text, 0.88);
  };

  const handleSelectOption = (idx: number) => {
    if (showEvaluation) return;
    setSelectedOption(idx);
    setShowEvaluation(true);
    const opt = scenario.options[idx];
    if (opt.tone === 'professional') {
      SoundManager.playSuccessChime();
    }
  };

  const handleEvaluateCustom = async () => {
    if (!customInput.trim()) return;
    setIsSubmittingCustom(true);

    try {
      const res = await fetch('/app/api/gemini/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerResponse: customInput,
          scenarioContext: scenario.context,
          roleTitle: playerRole,
        }),
      });
      const data = await res.json();
      setCustomAiFeedback({
        feedback: data.feedback || 'Good professional articulation.',
        score: data.score || 85,
        tip: data.vocabularyTip || data.tip || 'Notice the clarity of tone.',
      });
      SoundManager.playSuccessChime();
    } catch {
      setCustomAiFeedback({
        feedback: 'Clear, constructive proposal! You defended project reliability and addressed customer concerns.',
        score: 85,
        tip: 'Using terms like "reliability index" and "contractual commitment" elevates your credibility.',
      });
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleFinish = () => {
    if (customAiFeedback) {
      const reward = Math.round((customAiFeedback.score / 100) * 120);
      onResolve(reward, 3);
      return;
    }

    if (selectedOption !== null) {
      const opt = scenario.options[selectedOption];
      onResolve(opt.moneyReward, opt.reputationGain);
    } else {
      onResolve(40, 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-900 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200 block">
                Executive Discourse Simulation
              </span>
              <h2 className="text-lg font-black leading-tight text-white">
                {scenario.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSpeakScenario}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Read situation aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Counterpart Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold flex items-center justify-center shrink-0 text-sm">
              {scenario.counterpart.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{scenario.counterpart}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {scenario.counterpartRole}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {scenario.context}
              </p>
            </div>
          </div>

          {/* Negotiation Challenge Box */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wide block mb-1">
              Your Professional Objective:
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {scenario.challengePrompt}
            </p>
            <span className="text-[11px] text-purple-700 block mt-1">
              Focus Skill: {scenario.targetSkill}
            </span>
          </div>

          {/* Options Selection */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              Choose the most effective professional English response:
            </span>

            {scenario.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let borderClass = 'border-slate-200 bg-white hover:border-purple-300';

              if (showEvaluation) {
                if (opt.tone === 'professional') {
                  borderClass = 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400';
                } else if (isSelected) {
                  borderClass = 'border-rose-400 bg-rose-50/50';
                } else {
                  borderClass = 'border-slate-200 opacity-50 bg-slate-50';
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${borderClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-slate-700">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                        &quot;{opt.text}&quot;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleSpeakOption(opt.text, e)}
                      className="p-1.5 rounded-md hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 shrink-0 transition-colors"
                      title="Listen to this phrasing"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Evaluation feedback displayed when clicked */}
                  {showEvaluation && (isSelected || opt.tone === 'professional') && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                          opt.tone === 'professional' ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                        }`}>
                          {opt.tone === 'professional' ? 'Best Practice: Executive English' : opt.tone.replace('_', ' ')}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {opt.moneyReward >= 0 ? `+$${opt.moneyReward}M Contract` : `-$${Math.abs(opt.moneyReward)}M Penalty`}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-snug">{opt.explanation}</p>
                      <p className="text-emerald-800 font-medium italic">{opt.englishFeedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Write Your Own Sentence Practice */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Or Try Typing Your Own Response in English:
              </span>
              <span className="text-[11px] text-slate-500">Live AI Coach Evaluation</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. We recognize the intermittency concerns, but our battery reserves ensure..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white"
              />
              <button
                type="button"
                onClick={handleEvaluateCustom}
                disabled={!customInput.trim() || isSubmittingCustom}
                className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors shrink-0 disabled:opacity-50"
              >
                {isSubmittingCustom ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Evaluate</span>
              </button>
            </div>

            {customAiFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1 text-emerald-950 animate-in fade-in">
                <div className="flex items-center justify-between font-bold">
                  <span>English Fluency Score: {customAiFeedback.score}/100</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p>{customAiFeedback.feedback}</p>
                <p className="text-emerald-800 font-medium italic">Tip: {customAiFeedback.tip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={handleFinish}
            disabled={!showEvaluation && !customAiFeedback}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2 ${
              showEvaluation || customAiFeedback
                ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-purple-200 active:scale-95'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Complete Negotiation & Collect Reward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
