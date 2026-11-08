'use client';
// Vercel Live Production Build v2.0.0 - Simple As That Casino (Flagship Infinite Plinko Edition)

import React, { useState, useRef } from 'react';
import CasinoHeader from '@/components/CasinoHeader';
import PlinkoGame from '@/components/PlinkoGame';
import CrashGame from '@/components/CrashGame';
import DiceGame from '@/components/DiceGame';
import LiveBetFeed, { BetItem } from '@/components/LiveBetFeed';
import ProvablyFairModal from '@/components/ProvablyFairModal';
import DepositModal from '@/components/DepositModal';
import VectorButton from '@/components/VectorButton';
import { generateSeedHex } from '@/lib/provablyFair';
import { Rocket, Dices, Flame, Crown, Zap, Sparkles } from 'lucide-react';

const INITIAL_BETS: BetItem[] = [
  { id: '1', player: '0x0190..1f5C', game: 'PLINKO', bet: 50.0, multiplier: 11.0, payout: 550.0, isWin: true, time: '1s ago' },
  { id: '2', player: '0x8f22..e901', game: 'PLINKO', bet: 25.0, multiplier: 4.0, payout: 100.0, isWin: true, time: '3s ago' },
  { id: '3', player: '0x3c99..a12b', game: 'CRASH', bet: 100.0, multiplier: 3.45, payout: 345.0, isWin: true, time: '7s ago' },
  { id: '4', player: '0x97d3..ecff', game: 'DICE', bet: 200.0, multiplier: 1.98, payout: 396.0, isWin: true, time: '12s ago' },
  { id: '5', player: '0x12a4..887f', game: 'PLINKO', bet: 15.0, multiplier: 29.0, payout: 435.0, isWin: true, time: '16s ago' },
];

export default function Home() {
  const [balance, setBalance] = useState<number>(3000.0);
  const [activeTab, setActiveTab] = useState<string>('games');
  const [activeGame, setActiveGame] = useState<'plinko' | 'crash' | 'dice'>('plinko');
  const [bets, setBets] = useState<BetItem[]>(INITIAL_BETS);
  const [isFairModalOpen, setIsFairModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  // Provably Fair Cryptographic State (HMAC-SHA256 Seed + Nonce)
  const [serverSeed, setServerSeed] = useState<string>(
    'a9f4e2c81b703d56f182e4a09c3b7d128f6e0a4c2d8b1937e5c0a2f4d6b8e103'
  );
  const [clientSeed, setClientSeed] = useState<string>('simple-as-that-seed-2026');
  const [nonce, setNonce] = useState<number>(1);
  const nonceRef = useRef<number>(1);

  const handleIncrementNonce = (): number => {
    const current = nonceRef.current;
    nonceRef.current = current + 1;
    setNonce(nonceRef.current);
    return current;
  };

  const handleRotateServerSeed = () => {
    setServerSeed(generateSeedHex(32));
    nonceRef.current = 1;
    setNonce(1);
  };

  const handleBetPlaced = (amount: number): boolean => {
    if (amount > balance) return false;
    setBalance((prev) => Number((prev - amount).toFixed(2)));
    return true;
  };

  const handleWin = (
    payout: number,
    multiplier?: number,
    betAmount: number = 25.0,
    gameLabel?: string
  ) => {
    setBalance((prev) => Number((prev + payout).toFixed(2)));
    const computedMult = multiplier !== undefined ? multiplier : betAmount > 0 ? payout / betAmount : 1.0;
    const newBet: BetItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      player: 'You (0x0190..1f5C)',
      game: gameLabel || activeGame.toUpperCase(),
      bet: betAmount,
      multiplier: computedMult,
      payout,
      isWin: payout >= betAmount,
      time: 'Just now',
    };
    setBets((prev) => [newBet, ...prev]);
  };

  const handleDepositSuccess = (amount: number) => {
    setBalance((prev) => Number((prev + amount).toFixed(2)));
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#050505] text-white selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Header Bar */}
      <CasinoHeader
        balance={balance}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
        onOpenFairModal={() => setIsFairModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Column: Game Navigation & Flagship Game Engine */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0">
          {/* Game Selector Bar (Responsive 3-Column Grid on Mobile, Flex on Desktop) */}
          <div className="flex flex-wrap items-center justify-between glass-panel p-2 rounded-2xl border border-white/10 gap-2">
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <VectorButton
                size="sm"
                variant={activeGame === 'plinko' ? 'cyan' : 'ghost'}
                activeSelected={activeGame === 'plinko'}
                onClick={() => setActiveGame('plinko')}
                data-testid="select-game-plinko"
                className="px-1.5 xs:px-2.5 sm:px-3 text-[11px] sm:text-xs whitespace-nowrap min-h-[38px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>PLINKO</span>
              </VectorButton>

              <VectorButton
                size="sm"
                variant={activeGame === 'crash' ? 'amber' : 'ghost'}
                activeSelected={activeGame === 'crash'}
                onClick={() => setActiveGame('crash')}
                data-testid="select-game-crash"
                className="px-1.5 xs:px-2.5 sm:px-3 text-[11px] sm:text-xs whitespace-nowrap min-h-[38px]"
              >
                <Rocket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>CRASH</span>
              </VectorButton>

              <VectorButton
                size="sm"
                variant={activeGame === 'dice' ? 'purple' : 'ghost'}
                activeSelected={activeGame === 'dice'}
                onClick={() => setActiveGame('dice')}
                data-testid="select-game-dice"
                className="px-1.5 xs:px-2.5 sm:px-3 text-[11px] sm:text-xs whitespace-nowrap min-h-[38px]"
              >
                <Dices className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>DICE</span>
              </VectorButton>
            </div>

            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              <Flame className="w-3.5 h-3.5 fill-emerald-400 shrink-0" />
              <span>99% HOUSE RTP • INSTANT PLAY</span>
            </div>
          </div>

          {/* Active Game Viewport */}
          {activeGame === 'plinko' ? (
            <PlinkoGame
              balance={balance}
              onBetPlaced={handleBetPlaced}
              onWin={handleWin}
              onOpenFairModal={() => setIsFairModalOpen(true)}
              serverSeed={serverSeed}
              clientSeed={clientSeed}
              nonce={nonce}
              onIncrementNonce={handleIncrementNonce}
            />
          ) : activeGame === 'crash' ? (
            <CrashGame
              balance={balance}
              onBetPlaced={handleBetPlaced}
              onWin={handleWin}
              onOpenFairModal={() => setIsFairModalOpen(true)}
              serverSeed={serverSeed}
              clientSeed={clientSeed}
              nonce={nonce}
              onIncrementNonce={handleIncrementNonce}
            />
          ) : (
            <DiceGame
              balance={balance}
              onBetPlaced={handleBetPlaced}
              onWin={handleWin}
              onOpenFairModal={() => setIsFairModalOpen(true)}
              serverSeed={serverSeed}
              clientSeed={clientSeed}
              nonce={nonce}
              onIncrementNonce={handleIncrementNonce}
            />
          )}

          {/* Live Casino Feed */}
          <LiveBetFeed bets={bets} />
        </div>

        {/* Right Column: VIP Status & House Bankroll Info */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* VIP Status Card */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-amber-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20 shrink-0" />
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
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-cyan-500/20 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
              <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
              <h3 className="font-black text-sm uppercase tracking-wider text-white">
                House Treasury
              </h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="bg-[#08080c] p-3 rounded-2xl border border-white/5 flex justify-between items-center gap-2">
                <span className="text-gray-400 text-[11px]">Treasury Wallet:</span>
                <span className="text-cyan-400 font-bold">0x0190...1f5C</span>
              </div>
              <div className="bg-[#08080c] p-3 rounded-2xl border border-white/5 flex justify-between items-center gap-2">
                <span className="text-gray-400 text-[11px]">KKM Bankroll Bot:</span>
                <span className="text-emerald-400 font-bold">ACTIVE (task-499)</span>
              </div>
              <div className="bg-[#08080c] p-3 rounded-2xl border border-white/5 flex justify-between items-center gap-2">
                <span className="text-gray-400 text-[11px]">Lunar Phase Scalar:</span>
                <span className="text-amber-400 font-bold">FULL MOON (+15%)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProvablyFairModal
        isOpen={isFairModalOpen}
        onClose={() => setIsFairModalOpen(false)}
        serverSeed={serverSeed}
        clientSeed={clientSeed}
        nonce={nonce}
        onUpdateClientSeed={(newSeed) => setClientSeed(newSeed)}
        onRotateServerSeed={handleRotateServerSeed}
      />
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDepositSuccess={handleDepositSuccess}
      />
    </div>
  );
}
