import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { betAmount, targetNumber, mode, clientSeed = 'default_client_seed', nonce = 1 } = body;

    if (!betAmount || betAmount <= 0 || !targetNumber) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // 1. Generate unrevealed server seed
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');

    // 2. Compute HMAC-SHA256 Roll (0.00 to 99.99)
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}`);
    const hash = hmac.digest('hex');

    // Convert first 8 hex characters to integer and map to 0.00 - 99.99
    const rollInt = parseInt(hash.substring(0, 8), 16);
    const roll = Math.floor((rollInt % 10000)) / 100;

    // 3. Evaluate Win/Loss & Multiplier
    const isWin = mode === 'over' ? roll > targetNumber : roll < targetNumber;
    const winChance = mode === 'over' ? 100 - targetNumber : targetNumber;
    const multiplier = winChance > 0 ? Math.floor((99 / winChance) * 100) / 100 : 0;
    const payout = isWin ? betAmount * multiplier : 0;

    return NextResponse.json({
      success: true,
      roll,
      isWin,
      multiplier,
      payout,
      serverSeedHash,
      serverSeedRevealed: serverSeed,
      clientSeed,
      nonce,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
