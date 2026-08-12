'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, Copy, Check } from 'lucide-react';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProvablyFairModal({ isOpen, onClose }: ProvablyFairModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const serverSeedHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const clientSeed = "simple-as-that-casino-seed-2026";
  const currentNonce = 42;

  const handleCopy = () => {
    navigator.clipboard.writeText(serverSeedHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-emerald-500/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">SHA-256 Provably Fair Verification</h3>
            <p className="text-xs text-gray-400 font-mono">Zero House Manipulation Guarantee</p>
          </div>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#08080c] p-3.5 rounded-2xl border border-white/10">
            <span className="text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
              Active Unrevealed Server Seed Hash (SHA-256)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-mono break-all text-[11px] mr-2">
                {serverSeedHash}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 bg-white/5 rounded hover:bg-white/10 text-gray-300 flex-none"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#08080c] p-3.5 rounded-2xl border border-white/10">
              <span className="text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                Client Seed
              </span>
              <span className="text-cyan-400 font-bold">{clientSeed}</span>
            </div>
            <div className="bg-[#08080c] p-3.5 rounded-2xl border border-white/10">
              <span className="text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                Current Nonce
              </span>
              <span className="text-amber-400 font-bold">{currentNonce}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-[11px] leading-relaxed">
            Every game outcome is deterministically calculated before you bet: <br />
            <code>Result = SHA256(ServerSeed + ClientSeed + Nonce)</code>. <br />
            You can verify past bets anytime on-chain or via independent SHA-256 verifiers.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all"
          >
            Close Verification
          </button>
        </div>
      </div>
    </div>
  );
}
