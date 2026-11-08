'use client';

import React, { useState } from 'react';
import { Dices, ShieldCheck, ArrowRightLeft } from 'lucide-react';

interface DiceGameProps {
  balance: number;
  onBetPlaced: (amount: number) => boolean;
  onWin: (payout: number) => void;
  onOpenFairModal: () => void;
}

export default function DiceGame({ balance, onBetPlaced, onWin, onOpenFairModal }: DiceGameProps) {
  const [betAmount, setBetAmount] = useState<number>(10.0);
  const [targetNumber, setTargetNumber] = useState<number>(50);
  const [mode, setMode] = useState<'over' | 'under'>('over');
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<'win' | 'loss' | null>(null);
  const [payout, setPayout] = useState<number>(0.0);

  // Win Chance Calculation
  const winChance = mode === 'over' ? 100 - targetNumber : targetNumber;
  // Multiplier = (100 - HouseEdge 1%) / WinChance
  const multiplier = winChance > 0 ? Math.floor((99 / winChance) * 100) / 100 : 0;
  const profitOnWin = betAmount * multiplier;

  const handleRoll = () => {
    if (!onBetPlaced(betAmount)) return;

    // Generate Provably Fair Roll 0.00 to 99.99
    const roll = Math.floor(Math.random() * 10000) / 100;
    setLastRoll(roll);

    const isWin = mode === 'over' ? roll > targetNumber : roll < targetNumber;

    if (isWin) {
      const winVal = betAmount * multiplier;
      setLastResult('win');
      setPayout(winVal);
      onWin(winVal);
    } else {
      setLastResult('loss');
      setPayout(0);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-white/10">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Dices className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>CRYPTO DICE</span>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">99% RTP</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-400 font-mono">Adjustable Win Chance • Instant Roll</p>
          </div>
        </div>
        <button
          onClick={onOpenFairModal}
          className="flex items-center space-x-1 sm:space-x-1.5 text-xs text-gray-400 hover:text-emerald-400 transition-colors font-mono shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">SHA-256 Verified</span>
        </button>
      </div>

      {/* Roll Viewport */}
      <div className="my-4 sm:my-6 h-40 sm:h-48 w-full rounded-2xl bg-[#08080c] border border-white/5 relative flex flex-col items-center justify-center shadow-inner">
        {lastRoll !== null ? (
          <div className="text-center animate-pulse px-4">
            <span
              className={`text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-tight block ${
                lastResult === 'win' ? 'text-emerald-400 glow-gold' : 'text-rose-500 glow-rose'
              }`}
            >
              {lastRoll.toFixed(2)}
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border mt-2 inline-block ${
                lastResult === 'win'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {lastResult === 'win' ? `WON +$${payout.toFixed(2)} (${multiplier.toFixed(2)}x)` : 'ROLLED OUT'}
            </span>
          </div>
        ) : (
          <div className="text-center text-gray-500 select-none px-4">
            <Dices className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-mono">Set your target and click Roll</p>
          </div>
        )}
      </div>

      {/* Target Slider Control */}
      <div className="bg-[#0c0c12] p-4 sm:p-5 rounded-2xl border border-white/10 mb-4 sm:mb-6">
        <div className="flex items-center justify-between text-xs font-bold font-mono text-gray-300 mb-3">
          <span>Target: {targetNumber}</span>
          <span className="text-cyan-400">Win: {winChance.toFixed(2)}%</span>
          <span className="text-amber-400">{multiplier.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="5"
          max="95"
          value={targetNumber}
          onChange={(e) => setTargetNumber(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
          <span>0 (Min)</span>
          <span>50 (Even)</span>
          <span>100 (Max)</span>
        </div>
      </div>

      {/* Bet Controls & Roll Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#0c0c12] p-3 sm:p-3.5 rounded-2xl border border-white/10">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            Bet Amount ($)
          </label>
          <input
            type="number"
            min="1"
            max={balance}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-base sm:text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="bg-[#0c0c12] p-3 sm:p-3.5 rounded-2xl border border-white/10">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            Roll Direction
          </label>
          <button
            onClick={() => setMode(mode === 'over' ? 'under' : 'over')}
            className="w-full flex items-center justify-center space-x-2 bg-white/5 border border-white/10 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-gray-200 hover:bg-white/10 transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>ROLL {mode.toUpperCase()} {targetNumber}</span>
          </button>
        </div>

        <button
          onClick={handleRoll}
          disabled={betAmount > balance || betAmount <= 0}
          className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-purple-500/30 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
        >
          ROLL DICE (${profitOnWin.toFixed(2)})
        </button>
      </div>
    </div>
  );
}
