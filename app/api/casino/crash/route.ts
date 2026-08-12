import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientSeed = 'simple-as-that-seed', nonce = Date.now() } = body;

    // 1. Generate random server seed
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');

    // 2. Compute HMAC-SHA256 hash
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}`);
    const hash = hmac.digest('hex');

    // 3. Crash multiplier math (1% house edge)
    const rawVal = parseInt(hash.substring(0, 13), 16);
    const maxVal = Math.pow(2, 52);
    
    // 3% instant crash at 1.00x
    let multiplier = 1.0;
    if (rawVal % 33 !== 0) {
      const e = Math.pow(2, 52);
      multiplier = Math.max(1.0, Math.floor((100 * e - rawVal) / (e - rawVal)) / 100);
      multiplier = Math.min(100.0, multiplier);
    }

    return NextResponse.json({
      success: true,
      crashMultiplier: multiplier,
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
