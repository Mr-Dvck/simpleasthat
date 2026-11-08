'use client';

import React, { useState } from 'react';
import { Wallet, X, Check, Copy, ShieldAlert } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number) => void;
}

export default function DepositModal({ isOpen, onClose, onDepositSuccess }: DepositModalProps) {
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100);

  if (!isOpen) return null;

  const treasuryAddress = "0x0190C582b0eF8a4D27aaDbf73FEFc1f389bd1f5C";

  const handleCopy = () => {
    navigator.clipboard.writeText(treasuryAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = () => {
    onDepositSuccess(depositAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-amber-500/30 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-5 sm:mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Deposit Crypto Funds</h3>
            <p className="text-[11px] sm:text-xs text-gray-400 font-mono">Instant Base L2 & Solana Liquidity</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 font-mono text-xs">
          <div className="bg-[#08080c] p-3.5 sm:p-4 rounded-2xl border border-white/10">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1 font-bold">
              Official Treasury Deposit Address (Base L2 / ERC-20)
            </span>
            <div className="flex items-center justify-between bg-black/50 p-2 sm:p-2.5 rounded-xl border border-white/5">
              <span className="text-amber-400 font-mono break-all text-[10px] sm:text-[11px] mr-2">
                {treasuryAddress}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 sm:p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-300 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-[#08080c] p-3.5 sm:p-4 rounded-2xl border border-white/10">
            <label className="text-gray-400 uppercase tracking-wider text-[10px] block mb-2 font-bold">
              Simulate Instant Balance Top-Up ($)
            </label>
            <div className="flex space-x-2">
              {[50, 100, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDepositAmount(amt)}
                  className={`flex-1 py-2 rounded-xl border font-bold text-xs transition-colors ${
                    depositAmount === amt
                      ? 'bg-amber-400 text-black border-amber-400 font-black shadow-md shadow-amber-400/20'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  +${amt}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] leading-relaxed flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Base L2 USDC transactions verify automatically via Basescan API within 12 seconds. Minimum deposit $10.00.
            </span>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex justify-end space-x-2 sm:space-x-3">
          <button
            onClick={onClose}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/5 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSimulateDeposit}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
          >
            Confirm (${depositAmount})
          </button>
        </div>
      </div>
    </div>
  );
}
