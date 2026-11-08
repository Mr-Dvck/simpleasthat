'use client';

import React from 'react';
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
  return (
    <header className="w-full glass-panel sticky top-0 z-50 border-b border-white/10 px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <div 
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer select-none shrink-0" 
          onClick={() => setActiveTab('games')}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-purple-600 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-[#08080a] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-black text-xs sm:text-xl tracking-tight text-white glow-cyan truncate">
                SIMPLE AS THAT
              </span>
              <span className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded shrink-0">
                CASINO
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-gray-400 font-mono tracking-wider truncate">
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

        {/* Balance Counter */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-[#0a0a0e] border border-cyan-500/30 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-xl shadow-inner shadow-black/50 shrink-0 min-h-[36px]">
          <CircleDollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <div className="text-right">
            <span className="hidden sm:block text-[10px] uppercase tracking-wider text-gray-400 font-semibold leading-none">
              Balance
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-white glow-gold leading-tight">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Deposit Button */}
        <VectorButton
          variant="amber"
          size="sm"
          onClick={onOpenDeposit}
          className="px-2 xs:px-3 sm:px-4"
        >
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden xs:inline">Deposit</span>
          <span className="xs:hidden">+</span>
        </VectorButton>
      </div>
    </header>
  );
}
