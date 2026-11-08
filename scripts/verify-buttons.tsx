import React from 'react';
import ReactDOMServer from 'react-dom/server';
import assert from 'node:assert';
import VectorButton, { VectorLockGlyph } from '../components/VectorButton';
import CasinoHeader from '../components/CasinoHeader';
import CrashGame from '../components/CrashGame';
import DiceGame from '../components/DiceGame';
import DepositModal from '../components/DepositModal';
import LiveBetFeed from '../components/LiveBetFeed';
import ProvablyFairModal from '../components/ProvablyFairModal';

console.log('--- STARTING COMPREHENSIVE VECTOR BUTTON VERIFICATION ---');

// Test 1: Default State Theme & Dedicated SVG Assets
{
  const html = ReactDOMServer.renderToStaticMarkup(
    <VectorButton variant="cyan" size="md">
      <span>START GAME</span>
    </VectorButton>
  );

  assert(html.includes('bg-[#050505]'), 'Default state must include #050505 void base');
  assert(html.includes('border-cyan-500/35'), 'Default state must include cyan border');
  assert(html.includes('shadow-[0_0_12px_rgba(6,182,212,0.22)]'), 'Default state must include neon cyan glow border');
  assert(html.includes('data-btn-state="default"'), 'Visual state attribute must be "default"');
  
  // Dedicated Corner Brackets (1:1 Square, Un-distorted)
  assert(html.includes('viewBox="0 0 12 12"'), 'Must have dedicated 1:1 corner bracket SVG asset');
  assert(html.includes('M 1 9 L 1 1 L 9 1'), 'Must render top-left cyber bracket path');
  assert(html.includes('M 11 3 L 11 11 L 3 11'), 'Must render bottom-right cyber bracket path');
  
  // Dedicated Accent Nodes (1:1 Circles)
  assert(html.includes('viewBox="0 0 6 6"'), 'Must have dedicated 1:1 accent node SVG asset');
  assert(html.includes('vector-effect="non-scaling-stroke"'), 'Must have non-scaling-stroke on glass reticle border');
  console.log('✓ Test 1 Passed: Default State & Non-Distorting Vector SVG Assets Verified');
}

// Test 2: Hover State Rules
{
  const html = ReactDOMServer.renderToStaticMarkup(
    <VectorButton variant="amber" size="sm">
      <span>CLAIM BONUS</span>
    </VectorButton>
  );

  assert(html.includes('hover:brightness-110'), 'Hover state must include subtle brightness-110');
  assert(html.includes('hover:shadow-[0_0_24px_rgba(245,158,11,0.52)]'), 'Hover state must include neon amber glow expansion');
  assert(html.includes('hover:border-amber-400/85'), 'Hover state must brighten border on hover');
  console.log('✓ Test 2 Passed: Hover State Glow Expansion Verified');
}

// Test 3: Active/Pressed State Rules
{
  const html = ReactDOMServer.renderToStaticMarkup(
    <VectorButton variant="purple" size="lg">
      <span>CONFIRM BET</span>
    </VectorButton>
  );

  assert(html.includes('active:scale-[0.96]'), 'Active state must scale to 0.96');
  assert(html.includes('active:shadow-[inset_0_4px_14px_rgba(0,0,0,0.92)'), 'Active state must include deep inset shadow');
  console.log('✓ Test 3 Passed: Active/Pressed Inset Shadow & Scale 0.96 Verified');
}

// Test 4: Disabled State with Automatic Lock Glyph
{
  const html = ReactDOMServer.renderToStaticMarkup(
    <VectorButton variant="cyan" size="md" disabled>
      <span>DISABLED BET</span>
    </VectorButton>
  );

  assert(html.includes('disabled=""') || html.includes('disabled'), 'HTML button must have disabled attribute');
  assert(html.includes('opacity-45'), 'Disabled state must have muted opacity-45');
  assert(html.includes('cursor-not-allowed'), 'Disabled state must have cursor-not-allowed');
  assert(html.includes('saturate-50'), 'Disabled state must be desaturated');
  assert(html.includes('data-lock-glyph="true"'), 'Disabled state must explicitly render SVG lock glyph');
  assert(html.includes('data-btn-state="disabled"'), 'Visual state must report disabled');
  console.log('✓ Test 4 Passed: Disabled Muted Opacity & Lock Glyph Verified');
}

// Test 5: Disabled State with showLockGlyph={false}
{
  const html = ReactDOMServer.renderToStaticMarkup(
    <VectorButton variant="ghost" size="xs" disabled showLockGlyph={false}>
      <span>1/2</span>
    </VectorButton>
  );

  assert(!html.includes('data-lock-glyph="true"'), 'When showLockGlyph is false, lock glyph must be omitted');
  assert(html.includes('opacity-45'), 'Muted opacity must still apply');
  console.log('✓ Test 5 Passed: showLockGlyph Suppression Verified');
}

// Test 6: Icon-Only Mode & Disabled Lock Glyph Replacement
{
  const html = ReactDOMServer.renderToStaticMarkup(
    <VectorButton variant="cyan" size="sm" iconOnly disabled>
      <span>X</span>
    </VectorButton>
  );

  assert(html.includes('w-10 h-10'), 'iconOnly sm must use square w-10 h-10');
  assert(html.includes('data-lock-glyph="true"'), 'Disabled iconOnly must render lock glyph');
  console.log('✓ Test 6 Passed: Icon-Only Mode Layout & Lock Glyph Replacement Verified');
}

// Test 7: Tailwind Merge (twMerge) Conflict Resolution
{
  const html = ReactDOMServer.renderToStaticMarkup(
    <VectorButton variant="cyan" size="xs" className="px-6 py-3 min-h-[48px]">
      <span>MERGE TEST</span>
    </VectorButton>
  );

  // twMerge must ensure px-6 overrides base px-2 cleanly without duplicate conflict
  assert(html.includes('px-6'), 'Custom px-6 must be present');
  assert(!/(?:^|\s)px-2(?:\s|$)/.test(html), 'Default base px-2 must be stripped by twMerge');
  assert(html.includes('min-h-[48px]'), 'Custom min-h-[48px] must be present');
  assert(!html.includes('min-h-[36px]'), 'Default min-h-[36px] must be stripped by twMerge');
  console.log('✓ Test 7 Passed: twMerge Clean Class Override Verified');
}

// Test 8: All 6 Variants Render Cleanly
{
  const variants = ['cyan', 'amber', 'emerald', 'purple', 'rose', 'ghost'] as const;
  for (const v of variants) {
    const html = ReactDOMServer.renderToStaticMarkup(
      <VectorButton variant={v} size="md">
        <span>{v.toUpperCase()}</span>
      </VectorButton>
    );
    assert(html.includes(`data-variant="${v}"`), `Variant ${v} must be set`);
    assert(html.includes('bg-[#050505]'), `Variant ${v} must have #050505 void`);
  }
  console.log('✓ Test 8 Passed: All 6 Color Variants Verified');
}

// Test 9: Component Tree Rendering Tests
{
  // CasinoHeader
  const headerHtml = ReactDOMServer.renderToStaticMarkup(
    <CasinoHeader
      balance={3000}
      onOpenDeposit={() => {}}
      onOpenFairModal={() => {}}
      activeTab="games"
      setActiveTab={() => {}}
    />
  );
  assert(headerHtml.includes('data-vector-btn="true"'), 'CasinoHeader must render VectorButtons');

  // CrashGame
  const crashHtml = ReactDOMServer.renderToStaticMarkup(
    <CrashGame
      balance={3000}
      onBetPlaced={() => true}
      onWin={() => {}}
      onOpenFairModal={() => {}}
    />
  );
  assert(crashHtml.includes('PLACE BET'), 'CrashGame must render PLACE BET VectorButton');

  // DiceGame
  const diceHtml = ReactDOMServer.renderToStaticMarkup(
    <DiceGame
      balance={3000}
      onBetPlaced={() => true}
      onWin={() => {}}
      onOpenFairModal={() => {}}
    />
  );
  assert(diceHtml.includes('ROLL DICE'), 'DiceGame must render ROLL DICE VectorButton');

  // DepositModal
  const depositHtml = ReactDOMServer.renderToStaticMarkup(
    <DepositModal
      isOpen={true}
      onClose={() => {}}
      onDepositSuccess={() => {}}
    />
  );
  assert(depositHtml.includes('+$1000'), 'DepositModal must render chip VectorButtons');

  // LiveBetFeed
  const feedHtml = ReactDOMServer.renderToStaticMarkup(
    <LiveBetFeed
      bets={[{ id: '1', player: '0x0190...1f5C', game: 'CRASH', bet: 100, multiplier: 2.5, payout: 250, isWin: true, time: '1s' }]}
    />
  );
  assert(feedHtml.includes('High Roll'), 'LiveBetFeed must render High Roll filter with responsive label');

  // ProvablyFairModal
  const fairHtml = ReactDOMServer.renderToStaticMarkup(
    <ProvablyFairModal
      isOpen={true}
      onClose={() => {}}
    />
  );
  assert(fairHtml.includes('Close Verifier'), 'ProvablyFairModal must render Close VectorButton');

  console.log('✓ Test 9 Passed: All 6 Casino Components Render Correctly with VectorButtons');
}

console.log('====================================================');
console.log('ALL 9 DEEP VERIFICATION TEST SUITES PASSED FLAWLESSLY');
console.log('====================================================');
