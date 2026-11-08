'use client';

import React from 'react';
import { Activity } from 'lucide-react';

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
  return (
    <div className="w-full glass-panel rounded-3xl p-4 sm:p-5 border border-white/10 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Live Casino Feed</h3>
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0">
          SUB-10MS WEBSOCKET
        </span>
      </div>

      <div className="mt-3 overflow-x-auto -mx-1 px-1 touch-pan-x">
        <table className="w-full text-left border-collapse min-w-[380px] sm:min-w-full">
          <thead>
            <tr className="text-[10px] uppercase font-mono text-gray-500 border-b border-white/5">
              <th className="pb-2 pl-2">Game</th>
              <th className="pb-2">Player</th>
              <th className="pb-2 text-right">Wager</th>
              <th className="pb-2 text-right">Multiplier</th>
              <th className="pb-2 text-right pr-2">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-xs">
            {bets.slice(0, 8).map((b) => (
              <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2 sm:py-2.5 pl-2 font-bold text-gray-300 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span>{b.game}</span>
                </td>
                <td className="py-2 sm:py-2.5 text-gray-400 truncate max-w-[100px] sm:max-w-none">{b.player}</td>
                <td className="py-2 sm:py-2.5 text-right font-bold text-gray-300">${b.bet.toFixed(2)}</td>
                <td className="py-2 sm:py-2.5 text-right font-bold text-cyan-400">{b.multiplier.toFixed(2)}x</td>
                <td
                  className={`py-2 sm:py-2.5 text-right pr-2 font-black ${
                    b.isWin ? 'text-emerald-400 glow-gold' : 'text-gray-500'
                  }`}
                >
                  {b.isWin ? `+$${b.payout.toFixed(2)}` : '$0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
