'use client';

import React, { useState } from 'react';
import { Activity, Flame, Trophy } from 'lucide-react';
import VectorButton from '@/components/VectorButton';

export interface BetItem {
  id: string;
  player: string;
  game: string;
  bet: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
  time: string;
}

interface LiveBetFeedProps {
  bets: BetItem[];
}

export default function LiveBetFeed({ bets }: LiveBetFeedProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'wins'>('all');

  const filteredBets = bets.filter((b) => {
    if (filter === 'high') return b.bet >= 50;
    if (filter === 'wins') return b.isWin && b.multiplier >= 2.0;
    return true;
  });

  return (
    <div className="w-full glass-panel rounded-3xl p-3.5 sm:p-5 border border-white/10 shadow-xl overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 sm:pb-4 border-b border-white/10 gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Live Casino Feed</h3>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          <VectorButton
            variant={filter === 'all' ? 'cyan' : 'ghost'}
            activeSelected={filter === 'all'}
            size="xs"
            onClick={() => setFilter('all')}
            className="px-2 sm:px-2.5 text-[10px] sm:text-[11px]"
          >
            <span className="hidden xs:inline">All Bets</span>
            <span className="xs:hidden">All</span>
          </VectorButton>
          <VectorButton
            variant={filter === 'high' ? 'amber' : 'ghost'}
            activeSelected={filter === 'high'}
            size="xs"
            onClick={() => setFilter('high')}
            className="px-2 sm:px-2.5 text-[10px] sm:text-[11px]"
          >
            <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="hidden xs:inline">High Roll</span>
            <span className="xs:hidden">High</span>
          </VectorButton>
          <VectorButton
            variant={filter === 'wins' ? 'emerald' : 'ghost'}
            activeSelected={filter === 'wins'}
            size="xs"
            onClick={() => setFilter('wins')}
            className="px-2 sm:px-2.5 text-[10px] sm:text-[11px]"
          >
            <Flame className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="hidden xs:inline">Big Wins</span>
            <span className="xs:hidden">Wins</span>
          </VectorButton>
        </div>
      </div>

      {/* Feed Table */}
      <div className="mt-3 overflow-x-auto -mx-1 px-1 touch-pan-x">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] sm:text-[10px] uppercase font-mono text-gray-500 border-b border-white/5">
              <th className="pb-2 pl-1 sm:pl-2">Game</th>
              <th className="pb-2">Player</th>
              <th className="pb-2 text-right">Wager</th>
              <th className="pb-2 text-right">Mult</th>
              <th className="pb-2 text-right pr-1 sm:pr-2">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[10px] sm:text-xs">
            {filteredBets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500 text-xs font-mono">
                  No bets matching filter
                </td>
              </tr>
            ) : (
              filteredBets.slice(0, 8).map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 sm:py-2.5 pl-1 sm:pl-2 font-bold text-gray-300 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span>{b.game}</span>
                    </span>
                  </td>
                  <td className="py-2 sm:py-2.5 text-gray-400 whitespace-nowrap">{b.player}</td>
                  <td className="py-2 sm:py-2.5 text-right font-bold text-gray-300 whitespace-nowrap">${b.bet.toFixed(2)}</td>
                  <td className="py-2 sm:py-2.5 text-right font-bold text-cyan-400 whitespace-nowrap">{b.multiplier.toFixed(2)}x</td>
                  <td
                    className={`py-2 sm:py-2.5 text-right pr-1 sm:pr-2 font-black whitespace-nowrap ${
                      b.isWin ? 'text-emerald-400 glow-gold' : 'text-gray-500'
                    }`}
                  >
                    {b.isWin ? `+$${b.payout.toFixed(2)}` : '$0.00'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
