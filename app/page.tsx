'use client';
// Vercel Live Production Build v1.0.1 - Simple As That Casino

import React, { useState } from 'react';
import CasinoHeader from '@/components/CasinoHeader';
import CrashGame from '@/components/CrashGame';
import DiceGame from '@/components/DiceGame';
import LiveBetFeed, { BetItem } from '@/components/LiveBetFeed';
import ProvablyFairModal from '@/components/ProvablyFairModal';
import DepositModal from '@/components/DepositModal';
import { Rocket, Dices, ShieldCheck, Trophy, Sparkles, Zap, Flame, Crown, Lock } from 'lucide-react';

const INITIAL_BETS: BetItem[] = [
  { id: '1', player: '0x0190...1f5C', game: 'CRASH', bet: 100.0, multiplier: 3.45, payout: 345.0, isWin: true, time: '1s ago' },
  { id: '2', player: '0x8f22...e901', game: 'DICE', bet: 25.0, multiplier: 1.98, payout: 49.5, isWin: true, time: '4s ago' },
  { id: '3', player: '0x3c99...a12b', game: 'CRASH', bet: 50.0, multiplier: 1.12, payout: 0.0, isWin: false, time: '9s ago' },
  { id: '4', player: '0x97d3...ecff', game: 'DICE', bet: 200.0, multiplier: 4.50, payout: 900.0, isWin: true, time: '14s ago' },
  { id: '5', player: '0x12a4...887f', game: 'CRASH', bet: 15.0, multiplier: 12.80, payout: 192.0, isWin: true, time: '18s ago' },
];

export default function Home() {
  const [balance, setBalance] = useState<number>(3000.0);
  const [activeTab, setActiveTab] = useState<string>('games');
  const [activeGame, setActiveGame] = useState<'crash' | 'dice'>('crash');
  const [bets, setBets] = useState<BetItem[]>(INITIAL_BETS);
  const [isFairModalOpen, setIsFairModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  const handleBetPlaced = (amount: number): boolean => {
    if (amount > balance) return false;
    setBalance((prev) => prev - amount);
    return true;
  };

  const handleWin = (payout: number) => {
    setBalance((prev) => prev + payout);
    const newBet: BetItem = {
      id: Date.now().toString(),
      player: 'You (0x0190...1f5C)',
      game: activeGame.toUpperCase(),
      bet: 25.0,
      multiplier: payout / 25.0,
      payout,
      isWin: payout > 0,
      time: 'Just now',
    };
    setBets((prev) => [newBet, ...prev]);
  };

  const handleDepositSuccess = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#050505] text-white selection:bg-cyan-500 selection:text-black">
      {/* Header Bar */}
      <CasinoHeader
        balance={balance}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
        onOpenFairModal={() => setIsFairModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Game Navigation & Game Engine */}
        <div className="lg:col-span-3 space-y-6">
          {/* Game Selector Bar */}
          <div className="flex items-center justify-between glass-panel p-2 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveGame('crash')}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  activeGame === 'crash'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>CRASH ROCKET</span>
              </button>

              <button
                onClick={() => setActiveGame('dice')}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  activeGame === 'dice'
                    ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Dices className="w-4 h-4" />
                <span>CRYPTO DICE</span>
              </button>

              <div className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-xs font-mono">
                <Lock className="w-3.5 h-3.5 text-gray-500" />
                <span>PLINKO & ROULETTE (COMING NEXT)</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              <Flame className="w-3.5 h-3.5 fill-emerald-400" />
              <span>99% HOUSE RTP</span>
            </div>
          </div>

          {/* Active Game Viewport */}
          {activeGame === 'crash' ? (
            <CrashGame
              balance={balance}
              onBetPlaced={handleBetPlaced}
              onWin={handleWin}
              onOpenFairModal={() => setIsFairModalOpen(true)}
            />
          ) : (
            <DiceGame
              balance={balance}
              onBetPlaced={handleBetPlaced}
              onWin={handleWin}
              onOpenFairModal={() => setIsFairModalOpen(true)}
            />
          )}

          {/* Live Casino Feed */}
          <LiveBetFeed bets={bets} />
        </div>

        {/* Right Column: VIP Status & House Bankroll Info */}
        <div className="space-y-6">
          {/* VIP Status Card */}
          <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                <h3 className="font-black text-sm uppercase tracking-wider text-white">VIP Club</h3>
              </div>
              <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                GOLD TIER
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Progress to Diamond</span>
                <span className="text-amber-400 font-bold">68%</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 w-[68%]" />
              </div>
              <div className="pt-2 text-[11px] text-gray-400 flex justify-between border-t border-white/5">
                <span>Rakeback Rate:</span>
                <span className="text-emerald-400 font-bold">10% Instant</span>
              </div>
            </div>
          </div>

          {/* Treasury Vault & Bankroll Info */}
          <div className="glass-panel p-5 rounded-3xl border border-cyan-500/20 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="font-black text-sm uppercase tracking-wider text-white">House Treasury</h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="bg-[#08080c] p-3 rounded-2xl border border-white/5 flex justify-between">
                <span className="text-gray-400 text-[11px]">Treasury Wallet:</span>
                <span className="text-cyan-400 font-bold">0x0190...1f5C</span>
              </div>
              <div className="bg-[#08080c] p-3 rounded-2xl border border-white/5 flex justify-between">
                <span className="text-gray-400 text-[11px]">KKM Bankroll Bot:</span>
                <span className="text-emerald-400 font-bold">ACTIVE (task-499)</span>
              </div>
              <div className="bg-[#08080c] p-3 rounded-2xl border border-white/5 flex justify-between">
                <span className="text-gray-400 text-[11px]">Lunar Phase Scalar:</span>
                <span className="text-amber-400 font-bold">FULL MOON (+15%)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProvablyFairModal isOpen={isFairModalOpen} onClose={() => setIsFairModalOpen(false)} />
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDepositSuccess={handleDepositSuccess}
      />
    </div>
  );
}