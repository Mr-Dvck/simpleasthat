'use client';

import React, { useState } from 'react';
import { Wallet, X, Check, Copy, ShieldAlert } from 'lucide-react';
import VectorButton from '@/components/VectorButton';

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
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(treasuryAddress);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = () => {
    onDepositSuccess(depositAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-4 sm:p-6 border border-amber-500/30 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        <VectorButton
          variant="ghost"
          size="xs"
          iconOnly
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </VectorButton>

        <div className="flex items-center space-x-3 mb-4 sm:mb-6 pr-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">Deposit Crypto Funds</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 font-mono">Instant Base L2 & Solana Liquidity</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 font-mono text-xs">
          <div className="bg-[#08080c] p-3 sm:p-4 rounded-2xl border border-white/10">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1 font-bold">
              Official Treasury Deposit Address (Base L2 / ERC-20)
            </span>
            <div className="flex items-center justify-between bg-black/50 p-2 sm:p-2.5 rounded-xl border border-white/5 gap-2">
              <span className="text-amber-400 font-mono break-all text-[10px] sm:text-[11px] select-all">
                {treasuryAddress}
              </span>
              <VectorButton
                variant="amber"
                size="xs"
                iconOnly
                onClick={handleCopy}
                aria-label="Copy treasury address"
                className="shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </VectorButton>
            </div>
          </div>

          <div className="bg-[#08080c] p-3 sm:p-4 rounded-2xl border border-white/10">
            <label className="text-gray-400 uppercase tracking-wider text-[10px] block mb-2 font-bold">
              Simulate Instant Balance Top-Up ($)
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[50, 100, 500, 1000].map((amt) => (
                <VectorButton
                  key={amt}
                  variant={depositAmount === amt ? 'amber' : 'ghost'}
                  activeSelected={depositAmount === amt}
                  size="sm"
                  onClick={() => setDepositAmount(amt)}
                  className="font-bold text-[11px] sm:text-xs px-1 sm:px-2.5 min-h-[38px] whitespace-nowrap"
                >
                  +${amt}
                </VectorButton>
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
          <VectorButton
            variant="ghost"
            size="md"
            onClick={onClose}
          >
            Cancel
          </VectorButton>
          <VectorButton
            variant="amber"
            size="md"
            onClick={handleSimulateDeposit}
            className="shadow-lg shadow-amber-500/20"
          >
            Confirm (${depositAmount})
          </VectorButton>
        </div>
      </div>
    </div>
  );
}
