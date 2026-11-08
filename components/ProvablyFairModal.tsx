'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, Copy, Check, RefreshCw, Sparkles } from 'lucide-react';
import VectorButton from '@/components/VectorButton';
import {
  sha256Hex,
  hmacSha256Hex,
  computePlinkoOutcome,
  PlinkoRisk,
  PlinkoRows,
} from '@/lib/provablyFair';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverSeed?: string;
  clientSeed?: string;
  nonce?: number;
  onUpdateClientSeed?: (newSeed: string) => void;
  onRotateServerSeed?: () => void;
}

export default function ProvablyFairModal({
  isOpen,
  onClose,
  serverSeed = 'a9f4e2c81b703d56f182e4a09c3b7d128f6e0a4c2d8b1937e5c0a2f4d6b8e103',
  clientSeed = 'simple-as-that-casino-seed-2026',
  nonce = 1,
  onUpdateClientSeed,
  onRotateServerSeed,
}: ProvablyFairModalProps) {
  const [copied, setCopied] = useState(false);
  const [draftClientSeed, setDraftClientSeed] = useState(clientSeed);
  const [verifyNonce, setVerifyNonce] = useState<number>(nonce);
  const [verifyRows, setVerifyRows] = useState<PlinkoRows>(12);
  const [verifyRisk, setVerifyRisk] = useState<PlinkoRisk>('medium');

  if (!isOpen) return null;

  const serverSeedHash = sha256Hex(serverSeed);
  const activeClientSeed = draftClientSeed || clientSeed;
  const hmacPreview = hmacSha256Hex(serverSeed, `${activeClientSeed}:${verifyNonce}`);
  const plinkoPreview = computePlinkoOutcome(
    serverSeed,
    activeClientSeed,
    verifyNonce,
    verifyRows,
    verifyRisk
  );

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(serverSeedHash);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSeed = () => {
    if (draftClientSeed.trim()) {
      onUpdateClientSeed?.(draftClientSeed.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div
        data-testid="provably-fair-modal"
        className="glass-panel w-full max-w-lg rounded-3xl p-4 sm:p-6 border border-emerald-500/30 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto"
      >
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

        <div className="flex items-center space-x-3 mb-4 sm:mb-5 pr-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-black text-white">
              HMAC-SHA256 Provably Fair Engine
            </h3>
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono">
              Deterministic Client/Server Seed + Nonce Verification
            </p>
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {/* Server Seed SHA-256 Commitment */}
          <div className="bg-[#08080c] p-3 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-1 gap-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">
                Active Server Seed Hash (SHA-256)
              </span>
              {onRotateServerSeed && (
                <VectorButton
                  variant="cyan"
                  size="xs"
                  onClick={onRotateServerSeed}
                  className="text-[10px] px-2 py-1"
                >
                  <RefreshCw className="w-3 h-3 shrink-0" />
                  <span>Rotate Seed</span>
                </VectorButton>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
              <span
                data-testid="modal-server-seed-hash"
                className="text-emerald-400 font-mono break-all text-[10px] sm:text-[11px] select-all"
              >
                {serverSeedHash}
              </span>
              <VectorButton
                variant="emerald"
                size="xs"
                iconOnly
                onClick={handleCopy}
                aria-label="Copy Server Seed Hash"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </VectorButton>
            </div>
          </div>

          {/* Client Seed & Nonce Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2 bg-[#08080c] p-3 rounded-2xl border border-white/10">
              <label
                htmlFor="fair-client-seed-input"
                className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1"
              >
                Client Seed (Editable)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="fair-client-seed-input"
                  type="text"
                  value={draftClientSeed}
                  onChange={(e) => setDraftClientSeed(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-cyan-400 font-bold text-xs focus:outline-none focus:border-cyan-400"
                />
                {onUpdateClientSeed && (
                  <VectorButton size="xs" variant="cyan" onClick={handleSaveSeed} className="shrink-0">
                    <span>Apply</span>
                  </VectorButton>
                )}
              </div>
            </div>

            <div className="bg-[#08080c] p-3 rounded-2xl border border-white/10">
              <label
                htmlFor="fair-nonce-input"
                className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1"
              >
                Verify Nonce
              </label>
              <input
                id="fair-nonce-input"
                type="number"
                min={0}
                value={verifyNonce}
                onChange={(e) => setVerifyNonce(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Live HMAC-SHA256 Calculation Preview */}
          <div className="bg-[#08080c] p-3 rounded-2xl border border-cyan-500/20 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-[10px] uppercase text-cyan-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>HMAC_SHA256 Verification</span>
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {([8, 12, 16] as PlinkoRows[]).map((r) => (
                  <VectorButton
                    key={r}
                    size="xs"
                    variant={verifyRows === r ? 'cyan' : 'ghost'}
                    activeSelected={verifyRows === r}
                    onClick={() => setVerifyRows(r)}
                    className="px-2 py-1 text-[10px] min-h-[34px] min-w-[34px]"
                  >
                    {r}R
                  </VectorButton>
                ))}
                {(['low', 'medium', 'high'] as PlinkoRisk[]).map((rk) => (
                  <VectorButton
                    key={rk}
                    size="xs"
                    variant={verifyRisk === rk ? 'amber' : 'ghost'}
                    activeSelected={verifyRisk === rk}
                    onClick={() => setVerifyRisk(rk)}
                    className="px-2 py-1 text-[10px] uppercase min-h-[34px] min-w-[34px]"
                  >
                    {rk[0]}
                  </VectorButton>
                ))}
              </div>
            </div>

            <div
              data-testid="modal-hmac-digest"
              className="text-[10px] text-gray-300 break-all bg-black/50 p-2 rounded-lg border border-white/5 font-mono select-all"
            >
              {hmacPreview}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <span className="text-gray-400">
                Path:{' '}
                <strong className="text-white">
                  {plinkoPreview.directions.map((d) => (d === 1 ? 'R' : 'L')).join('')}
                </strong>
              </span>
              <span className="text-amber-400 font-bold">
                Bucket #{plinkoPreview.bucketIndex} → {plinkoPreview.multiplier}x
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-[11px] leading-relaxed">
            Every outcome is deterministically derived via RFC 2104{' '}
            <code>HMAC-SHA256(serverSeed, clientSeed:nonce)</code> before any animation begins.
          </div>
        </div>

        <div className="mt-4 sm:mt-5 flex justify-end">
          <VectorButton variant="emerald" size="md" onClick={onClose}>
            <span>Close Verifier</span>
          </VectorButton>
        </div>
      </div>
    </div>
  );
}
