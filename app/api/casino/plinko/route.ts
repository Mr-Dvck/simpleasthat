import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { computePlinkoOutcome, PlinkoRisk, PlinkoRows } from '@/lib/provablyFair';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      betAmount = 0,
      rows = 12,
      risk = 'medium',
      clientSeed = 'simple-as-that-client-2026',
      nonce = 1,
      serverSeed: providedServerSeed,
    } = body;

    const validRows: PlinkoRows = [8, 12, 16].includes(Number(rows)) ? (Number(rows) as PlinkoRows) : 12;
    const validRisk: PlinkoRisk = ['low', 'medium', 'high'].includes(risk) ? (risk as PlinkoRisk) : 'medium';

    const serverSeed =
      typeof providedServerSeed === 'string' && providedServerSeed.length >= 8
        ? providedServerSeed
        : crypto.randomBytes(32).toString('hex');

    const outcome = computePlinkoOutcome(serverSeed, String(clientSeed), Number(nonce), validRows, validRisk);
    const safeBet = Math.max(0, Number(betAmount) || 0);
    const payout = Number((safeBet * outcome.multiplier).toFixed(2));

    return NextResponse.json({
      success: true,
      ...outcome,
      serverSeedRevealed: serverSeed,
      betAmount: safeBet,
      payout,
      isDemo: safeBet === 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
