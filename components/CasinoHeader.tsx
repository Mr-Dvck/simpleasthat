'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Wallet, Sparkles, Trophy, Zap, CircleDollarSign } from 'lucide-react';
import VectorButton from '@/components/VectorButton';

interface CasinoHeaderProps {
  balance: number;
  onOpenDeposit: () => void;
  onOpenFairModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function CasinoHeader({
  balance,
  onOpenDeposit,
  onOpenFairModal,
  activeTab,
  setActiveTab,
}: CasinoHeaderProps) {
  const [displayedBalance, setDisplayedBalance] = useState<number>(balance);
  const [deltaFlash, setDeltaFlash] = useState<'up' | 'down' | null>(null);
  const prevBalanceRef = useRef<number>(balance);

  useEffect(() => {
    if (balance !== prevBalanceRef.current) {
      setDeltaFlash(balance > prevBalanceRef.current ? 'up' : 'down');
      prevBalanceRef.current = balance;
      const timer = setTimeout(() => setDeltaFlash(null), 420);
      return () => clearTimeout(timer);
    }
  }, [balance]);

  useEffect(() => {
    let raf: number;
    const step = () => {
      setDisplayedBalance((prev) => {
        const diff = balance - prev;
        if (Math.abs(diff) < 0.05) return balance;
        return prev + diff * 0.22;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [balance]);

  return (
    <header className="w-full glass-panel sticky top-0 z-50 border-b border-white/10 px-2 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-2">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-1.5 sm:space-x-4 min-w-0">
        <div
          className="flex items-center space-x-1.5 sm:space-x-3 cursor-pointer select-none shrink-0"
          onClick={() => setActiveTab('games')}
        >
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-purple-600 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-[#08080a] rounded-[10px] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="font-black text-[11px] xs:text-xs sm:text-xl tracking-tight text-white glow-cyan whitespace-nowrap">
                SIMPLE AS THAT
              </span>
              <span className="hidden xs:inline-block px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded shrink-0">
                CASINO
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-gray-400 font-mono tracking-wider whitespace-nowrap">
              simple-as-that.net
            </p>
          </div>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 ml-4 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
          {[
            { id: 'games', label: 'Game Suite', icon: Sparkles },
            { id: 'vip', label: 'VIP Club', icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <VectorButton
                key={item.id}
                size="sm"
                variant={isActive ? 'cyan' : 'ghost'}
                activeSelected={isActive}
                onClick={() => setActiveTab(item.id)}
                className="gap-1.5"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </VectorButton>
            );
          })}
        </nav>
      </div>

      {/* User Balance & Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* Provably Fair Badge */}
        <VectorButton
          variant="emerald"
          size="sm"
          onClick={onOpenFairModal}
          className="hidden sm:inline-flex"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Provably Fair</span>
        </VectorButton>

        {/* Animated Balance Counter */}
        <div
          data-testid="header-balance-box"
          className={[
            'flex items-center space-x-1 sm:space-x-2 bg-[#0a0a0e] border px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl shadow-inner shadow-black/50 shrink-0 min-h-[36px] transition-all duration-150',
            deltaFlash === 'up'
              ? 'border-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.35)] scale-[1.03]'
              : deltaFlash === 'down'
              ? 'border-amber-400/60'
              : 'border-cyan-500/30',
          ].join(' ')}
        >
          <CircleDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <div className="text-right">
            <span className="hidden sm:block text-[10px] uppercase tracking-wider text-gray-400 font-semibold leading-none">
              Balance
            </span>
            <span
              data-testid="header-balance-amount"
              className={[
                'text-[11px] xs:text-xs sm:text-sm font-black font-mono leading-tight whitespace-nowrap',
                deltaFlash === 'up' ? 'text-emerald-300 glow-gold' : 'text-white glow-gold',
              ].join(' ')}
            >
              ${displayedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Deposit Button */}
        <VectorButton
          variant="amber"
          size="xs"
          onClick={onOpenDeposit}
          data-testid="header-deposit-btn"
          className="px-2 sm:px-3.5 min-h-[36px] sm:min-h-[40px] text-[10px] sm:text-xs"
        >
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Deposit</span>
        </VectorButton>
      </div>
    </header>
  );
}
