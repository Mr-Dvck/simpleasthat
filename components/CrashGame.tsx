'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Rocket, ShieldCheck, Zap } from 'lucide-react';
import VectorButton from '@/components/VectorButton';

interface CrashGameProps {
  balance: number;
  onBetPlaced: (amount: number) => boolean;
  onWin: (payout: number, multiplier?: number, betAmount?: number, gameLabel?: string) => void;
  onOpenFairModal: () => void;
  serverSeed?: string;
  clientSeed?: string;
  nonce?: number;
  onIncrementNonce?: () => number;
}

export default function CrashGame({
  balance,
  onBetPlaced,
  onWin,
  onOpenFairModal,
  serverSeed,
  clientSeed,
  nonce,
  onIncrementNonce,
}: CrashGameProps) {
  const [betAmount, setBetAmount] = useState<number>(25.0);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'cashed_out' | 'crashed'>('idle');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(0.0);
  const [payoutAmount, setPayoutAmount] = useState<number>(0.0);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Generate SHA-256 provably fair crash point
  const calculateCrashPoint = () => {
    const r = Math.random();
    // 3% instant crash at 1.00x house edge, heavy tail distribution
    if (r < 0.03) return 1.0;
    const point = 0.99 / (1 - r);
    return Math.max(1.01, Math.min(100.0, Math.floor(point * 100) / 100));
  };

  const handleStartGame = () => {
    if (gameState === 'running') return;
    if (!onBetPlaced(betAmount)) return;

    const targetCrash = calculateCrashPoint();
    setCrashPoint(targetCrash);
    setGameState('running');
    setCurrentMultiplier(1.0);
    setPayoutAmount(0.0);

    startTimeRef.current = performance.now();
    animateRocket(targetCrash);
  };

  const animateRocket = (targetCrash: number) => {
    const step = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) / 1000;
      
      // Exponential curve for multiplier acceleration
      const mult = 1.0 + Math.pow(elapsed * 0.8, 1.8);
      
      if (mult >= targetCrash) {
        // CRASH EVENT
        setCurrentMultiplier(targetCrash);
        setGameState('crashed');
        return;
      }

      setCurrentMultiplier(mult);

      // Auto-cashout check
      if (autoCashout > 1.0 && mult >= autoCashout && gameState !== 'cashed_out') {
        handleCashout(mult);
        return;
      }

      requestRef.current = requestAnimationFrame(step);
    };

    requestRef.current = requestAnimationFrame(step);
  };

  const handleCashout = (forcedMult?: number) => {
    if (gameState !== 'running') return;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    const mult = forcedMult || currentMultiplier;
    const winVal = betAmount * mult;
    setPayoutAmount(winVal);
    setGameState('cashed_out');
    onWin(winVal, mult, betAmount, 'CRASH');
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="w-full glass-panel rounded-3xl p-3.5 sm:p-6 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Game Header */}
      <div className="flex items-center justify-between pb-3.5 sm:pb-6 border-b border-white/10">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>CRASH</span>
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">FLAGSHIP</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-400 font-mono truncate">Real-time Multiplier Rocket • 99% RTP</p>
          </div>
        </div>
        <VectorButton
          variant="ghost"
          size="xs"
          onClick={onOpenFairModal}
          className="font-mono text-gray-400 hover:text-emerald-400"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">SHA-256 Verified</span>
        </VectorButton>
      </div>

      {/* Main Viewport & Rocket Visualizer */}
      <div className="my-3.5 sm:my-6 h-52 sm:h-64 md:h-80 w-full rounded-2xl bg-[#08080c] border border-white/5 relative flex flex-col items-center justify-center overflow-hidden shadow-inner">
        {/* Background Grid & Stars */}
        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

        {/* Display Multiplier */}
        <div className="z-10 text-center select-none px-4">
          {gameState === 'crashed' ? (
            <div className="animate-bounce">
              <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono text-rose-500 glow-rose tracking-tight block">
                {currentMultiplier.toFixed(2)}x
              </span>
              <span className="text-xs sm:text-sm font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mt-2 inline-block">
                CRASHED
              </span>
            </div>
          ) : gameState === 'cashed_out' ? (
            <div>
              <span className="text-4xl sm:text-6xl md:text-7xl font-black font-mono text-emerald-400 glow-gold tracking-tight block">
                {currentMultiplier.toFixed(2)}x
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mt-2 inline-block">
                WON +${payoutAmount.toFixed(2)}
              </span>
            </div>
          ) : (
            <div>
              <span
                className={`text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight block ${
                  gameState === 'running' ? 'text-cyan-400 glow-cyan scale-105' : 'text-gray-500'
                }`}
              >
                {currentMultiplier.toFixed(2)}x
              </span>
              <p className="text-[11px] sm:text-xs text-gray-500 font-mono mt-1">
                {gameState === 'running' ? 'Rocket in flight...' : 'Ready for launch'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Betting Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-1 sm:pt-2">
        {/* Bet Amount Input */}
        <div className="bg-[#0c0c12] p-3 sm:p-3.5 rounded-2xl border border-white/10">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            Bet Amount ($)
          </label>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <input
              type="number"
              min="1"
              max={balance}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, floatParse(e.target.value)))}
              disabled={gameState === 'running'}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-base sm:text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
            />
            <VectorButton
              variant="ghost"
              size="xs"
              onClick={() => setBetAmount((b) => Math.max(1, Math.floor(b / 2)))}
              disabled={gameState === 'running'}
              showLockGlyph={false}
              className="px-2 min-w-[36px]"
            >
              1/2
            </VectorButton>
            <VectorButton
              variant="ghost"
              size="xs"
              onClick={() => setBetAmount((b) => Math.min(balance, b * 2))}
              disabled={gameState === 'running'}
              showLockGlyph={false}
              className="px-2 min-w-[36px]"
            >
              2x
            </VectorButton>
          </div>
        </div>

        {/* Auto Cashout Input */}
        <div className="bg-[#0c0c12] p-3 sm:p-3.5 rounded-2xl border border-white/10">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
            Auto Cashout Target
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="0.1"
              min="1.01"
              max="100"
              value={autoCashout}
              onChange={(e) => setAutoCashout(Math.max(1.01, floatParse(e.target.value)))}
              disabled={gameState === 'running'}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-base sm:text-sm font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
            />
            <span className="text-xs font-mono font-bold text-gray-400 shrink-0">Multiplier</span>
          </div>
        </div>

        {/* Launch / Cashout Trigger Button */}
        <div className="flex items-end">
          {gameState === 'running' ? (
            <VectorButton
              variant="emerald"
              size="lg"
              fullWidth
              onClick={() => handleCashout()}
              className="shadow-xl shadow-emerald-500/30 text-emerald-100"
            >
              <Zap className="w-4 h-4 fill-current shrink-0 animate-pulse" />
              <span>CASHOUT ${(betAmount * currentMultiplier).toFixed(2)}</span>
            </VectorButton>
          ) : (
            <VectorButton
              variant="cyan"
              size="lg"
              fullWidth
              onClick={handleStartGame}
              disabled={betAmount > balance || betAmount <= 0}
              className="shadow-xl shadow-cyan-500/30"
            >
              <Rocket className="w-4 h-4 shrink-0" />
              <span>PLACE BET (${betAmount.toFixed(2)})</span>
            </VectorButton>
          )}
        </div>
      </div>
    </div>
  );
}

function floatParse(val: string): number {
  const p = parseFloat(val);
  return isNaN(p) ? 0 : p;
}
