'use client';

import React, { useState } from 'react';
import { PlayerState } from './MonopolyBoard';
import { PropertyDeed, MONOPOLY_SPACES } from '@/lib/monopoly-board-data';
import { SoundManager } from '@/lib/audio';
import {
  Handshake,
  X,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Send,
} from 'lucide-react';

interface TradeNegotiationModalProps {
  currentPlayer: PlayerState;
  otherPlayer: PlayerState;
  onExecuteTrade: (
    giveSpaceId: number | null,
    giveCash: number,
    getSpaceId: number | null,
    getCash: number,
    negotiationText: string
  ) => void;
  onClose: () => void;
}

export function TradeNegotiationModal({
  currentPlayer,
  otherPlayer,
  onExecuteTrade,
  onClose,
}: TradeNegotiationModalProps) {
  const [selectedGiveSpace, setSelectedGiveSpace] = useState<number | null>(null);
  const [giveCash, setGiveCash] = useState<number>(0);
  const [selectedGetSpace, setSelectedGetSpace] = useState<number | null>(null);
  const [getCash, setGetCash] = useState<number>(0);
  const [message, setMessage] = useState('');

  // Grammar checking state (Kind feedback: green = correct, amber = almost, NEVER red-shaming)
  const [grammarStatus, setGrammarStatus] = useState<'clean' | 'good' | 'amber'>('clean');
  const [feedbackNote, setFeedbackNote] = useState<string>('');

  // Quick one-tap phrasing suggestions
  const suggestions = [
    `I would like to trade my parcel for your renewable site plus $50M.`,
    `Would you consider an exchange of offshore concessions to balance grid capacity?`,
    `I propose transferring this transmission link to complete your regional corridor.`,
  ];

  const handleMessageChange = (val: string) => {
    setMessage(val);
    if (!val.trim()) {
      setGrammarStatus('clean');
      setFeedbackNote('');
      return;
    }

    const lower = val.toLowerCase();
    // Kind constructive grammar checks
    if (lower.startsWith('i want') || lower.startsWith('gimme')) {
      setGrammarStatus('amber');
      setFeedbackNote(
        'Tip: In professional English trade negotiations, "I would like to propose..." or "Would you consider..." sounds much more diplomatic!'
      );
    } else if (
      lower.includes('trade') ||
      lower.includes('propose') ||
      lower.includes('offer') ||
      lower.includes('consider')
    ) {
      setGrammarStatus('good');
      setFeedbackNote('Great professional phrasing! Clear, polite, and persuasive tone.');
    } else {
      setGrammarStatus('clean');
      setFeedbackNote('');
    }
  };

  const handleApplySuggestion = (text: string) => {
    setMessage(text);
    setGrammarStatus('good');
    setFeedbackNote('Excellent! Formal executive English negotiation template applied.');
    SoundManager.playDiceClick();
  };

  const myProperties = MONOPOLY_SPACES.filter((s) => currentPlayer.propertiesOwned.includes(s.id));
  const theirProperties = MONOPOLY_SPACES.filter((s) => otherPlayer.propertiesOwned.includes(s.id));

  const handleConfirmTrade = () => {
    SoundManager.playSuccessChime();
    onExecuteTrade(selectedGiveSpace, giveCash, selectedGetSpace, getCash, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border-4 border-amber-600 shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center">
              <Handshake className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 block">
                EXECUTIVE B2B COMMERCE
              </span>
              <h2 className="text-xl font-black text-white font-serif">
                Trade Negotiation Table
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Two Columns: Offer vs Request */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Your Offer */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                  You Offer ({currentPlayer.name})
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  Avail: ${currentPlayer.money}M
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Select Parcel to Transfer:
                </label>
                <select
                  value={selectedGiveSpace ?? ''}
                  onChange={(e) => setSelectedGiveSpace(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                >
                  <option value="">(None - Cash Only)</option>
                  {myProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price}M)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Cash Sweetener ($M):
                </label>
                <input
                  type="number"
                  min="0"
                  max={currentPlayer.money}
                  value={giveCash}
                  onChange={(e) => setGiveCash(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Right: In Return Request */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                  You Receive ({otherPlayer.name})
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  Avail: ${otherPlayer.money}M
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Requested Parcel:
                </label>
                <select
                  value={selectedGetSpace ?? ''}
                  onChange={(e) => setSelectedGetSpace(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                >
                  <option value="">(None - Cash Only)</option>
                  {theirProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price}M)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Requested Cash ($M):
                </label>
                <input
                  type="number"
                  min="0"
                  max={otherPlayer.money}
                  value={getCash}
                  onChange={(e) => setGetCash(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Real-time English Discourse Field with Kind Grammar Feedback */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Negotiation Letter / Proposal Message:
              </span>
              <span className="text-[10px] text-slate-400">English Discourse Practice</span>
            </div>

            <textarea
              rows={2}
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="e.g. I would like to propose trading Zephyr Valley for your Northern HVDC line..."
              className="w-full p-3 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />

            {/* Quick 1-Tap Phrasing Suggestions */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Suggested Executive Phrases (Tap to apply):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplySuggestion(sug)}
                    className="px-2.5 py-1 rounded-lg bg-slate-200/80 hover:bg-amber-100 text-[11px] font-medium text-slate-800 transition-colors cursor-pointer text-left"
                  >
                    &quot;{sug.slice(0, 48)}...&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Kind Grammar Feedback Banner */}
            {feedbackNote && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 animate-in fade-in ${
                  grammarStatus === 'good'
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-amber-100 text-amber-950 border border-amber-300'
                }`}
              >
                {grammarStatus === 'good' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedbackNote}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-300 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase cursor-pointer hover:bg-slate-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmTrade}
            disabled={!selectedGiveSpace && giveCash === 0 && !selectedGetSpace && getCash === 0}
            className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Formal Trade Proposal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
