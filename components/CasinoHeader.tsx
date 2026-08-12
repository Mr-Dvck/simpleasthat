'use client';

import React, { useState } from 'react';
import { ShieldCheck, Wallet, Sparkles, Trophy, Zap, CircleDollarSign } from 'lucide-react';

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
    <header className="w-full glass-panel sticky top-0 z-50 border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('games')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-purple-600 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#08080a] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight text-white glow-cyan">
                SIMPLE AS THAT
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded">
                CASINO
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider">
              simple-as-that.net
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 ml-4 bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: 'games', label: 'Game Suite', icon: Sparkles },
            { id: 'vip', label: 'VIP Club', icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Balance & Actions */}
      <div className="flex items-center space-x-3">
        {/* Provably Fair Badge */}
        <button
          onClick={onOpenFairModal}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-semibold"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Provably Fair</span>
        </button>

        {/* Balance Counter */}
        <div className="flex items-center space-x-2 bg-[#0a0a0e] border border-cyan-500/30 px-3.5 py-1.5 rounded-xl shadow-inner shadow-black/50">
          <CircleDollarSign className="w-4 h-4 text-amber-400" />
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold leading-none">
              Balance
            </span>
            <span className="text-sm font-black font-mono text-white glow-gold leading-tight">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={onOpenDeposit}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>Deposit</span>
        </button>
      </div>
    </header>
  );
}
