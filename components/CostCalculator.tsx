'use client';

import { useState } from 'react';

type Tier = 'starter' | 'creator' | 'pro' | 'business';

const tierData: Record<Tier, {
  label: string;
  monthlyCost: number;
  credits: number;
  failureRate: number;
  effectiveMultiplier: number;
}> = {
  starter: {
    label: 'Starter',
    monthlyCost: 5,
    credits: 30000,
    failureRate: 0.58,
    effectiveMultiplier: 2.4,
  },
  creator: {
    label: 'Creator',
    monthlyCost: 11,
    credits: 100000,
    failureRate: 0.55,
    effectiveMultiplier: 2.2,
  },
  pro: {
    label: 'Pro',
    monthlyCost: 99,
    credits: 500000,
    failureRate: 0.52,
    effectiveMultiplier: 2.0,
  },
  business: {
    label: 'Business',
    monthlyCost: 1320,
    credits: 20000000,
    failureRate: 0.49,
    effectiveMultiplier: 1.8,
  },
};

export default function CostCalculator() {
  const [selectedTier, setSelectedTier] = useState<Tier>('creator');
  const [monthlyUsage, setMonthlyUsage] = useState<number>(50000);
  
  const tier = tierData[selectedTier];
  const effectiveCost = tier.monthlyCost * tier.effectiveMultiplier;
  const wastedCredits = monthlyUsage * tier.failureRate;
  const usableCredits = monthlyUsage * (1 - tier.failureRate);
  const costPerUsableCredit = effectiveCost / (usableCredits || 1);
  
  const handleTierChange = (tier: Tier) => {
    setSelectedTier(tier);
  };
  
  const handleUsageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setMonthlyUsage(Math.max(1000, Math.min(1000000, value)));
    }
  };
  
  return (
    <div className="space-y-6 font-sans text-zinc-900">
      <div>
        <p className="text-zinc-500 text-sm font-medium leading-relaxed">
          The "failure tax" and hidden multipliers mean you pay 2‑3× the advertised price.
          Calculations based on forensic extraction metrics.
        </p>
      </div>
      
      {/* Tier selection */}
      <div>
        <label className="block text-sm font-semibold text-zinc-900 mb-3 border-b border-zinc-200 pb-2">Select Target Vector</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(tierData).map(([key, data]) => (
            <button
              key={key}
              onClick={() => handleTierChange(key as Tier)}
              className={`p-4 rounded-2xl border text-left transition-all shadow-sm ${
                selectedTier === key
                  ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
              }`}
            >
              <div className="font-bold text-sm">{data.label}</div>
              <div className="text-xs mt-1 font-medium">${data.monthlyCost}/mo</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Usage slider */}
      <div className="p-5 border border-zinc-200 bg-white rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-semibold text-zinc-900">Volumetric Load</label>
          <span className="text-sm font-bold text-blue-600">{monthlyUsage.toLocaleString()} credits</span>
        </div>
        <input
          type="range"
          min="1000"
          max="1000000"
          step="1000"
          value={monthlyUsage}
          onChange={handleUsageChange}
          className="w-full h-2 bg-zinc-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-sm"
        />
        <div className="flex justify-between text-xs font-medium text-zinc-400 mt-3">
          <span>1K</span>
          <span>100K</span>
          <span>500K</span>
          <span>1M</span>
        </div>
      </div>
      
      {/* Results */}
      <div className="border border-zinc-200 bg-zinc-50 rounded-3xl p-6 space-y-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-zinc-200 p-4 bg-white rounded-2xl shadow-sm">
            <div className="text-xs font-semibold text-zinc-500 mb-1 uppercase tracking-wide">Advertised</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900">${tier.monthlyCost}</div>
            <div className="text-xs text-zinc-400 font-medium">/ month</div>
          </div>
          <div className="border border-blue-200 p-4 bg-blue-50 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Extracted</div>
            <div className="text-2xl font-bold tracking-tight text-blue-600">${effectiveCost.toFixed(2)}</div>
            <div className="text-xs text-blue-500 font-medium">{tier.effectiveMultiplier.toFixed(1)}× multiplier</div>
          </div>
        </div>
        
        <div className="space-y-3 text-sm font-medium">
          <div className="flex justify-between items-center border-b border-zinc-200 py-2">
            <span className="text-zinc-600">Engineered Failure</span>
            <span className="font-bold text-blue-600">{(tier.failureRate * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-200 py-2">
            <span className="text-zinc-600">Burned Units</span>
            <span className="font-bold text-blue-600">{wastedCredits.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center border-b border-zinc-200 py-2">
            <span className="text-zinc-600">Yield Units</span>
            <span className="font-bold text-zinc-900">{usableCredits.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-zinc-600">True Unit Cost</span>
            <span className="font-bold text-zinc-900">${costPerUsableCredit.toFixed(6)}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-zinc-200">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Psychological Profiling Match</div>
          <p className="text-sm text-zinc-600 font-medium leading-relaxed">
            Mechanism reflects a {selectedTier === 'business' ? 'Darwinian' : 'Machiavellian'} architecture. The {(tier.failureRate * 100).toFixed(0)}% failure rate is an intentional feature of moral disengagement.
          </p>
        </div>
      </div>
      
      <div className="text-xs font-medium text-zinc-400 text-center tracking-wide">
        DATA.SOURCE: "ElevenLabs Credit Extraction Analysis" / VNR
      </div>
    </div>
  );
}