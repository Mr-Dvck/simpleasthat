import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash } = body;

    const treasuryAddress = "0x0190C582b0eF8a4D27aaDbf73FEFc1f389bd1f5C";

    if (!txHash) {
      return NextResponse.json({
        success: false,
        message: 'No txHash provided. Supply a valid Base L2 / ERC-20 transaction hash.',
        treasuryAddress,
      });
    }

    // Query Base Mainnet RPC for tx receipt
    const rpcUrl = "https://mainnet.base.org";
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    const data = await res.json();
    const receipt = data.result;

    if (!receipt) {
      return NextResponse.json({
        success: false,
        status: 'pending_or_not_found',
        message: 'Transaction not yet mined on Base L2.',
        treasuryAddress,
      });
    }

    const isSuccess = receipt.status === '0x1';

    return NextResponse.json({
      success: isSuccess,
      blockNumber: parseInt(receipt.blockNumber, 16),
      from: receipt.from,
      to: receipt.to,
      treasuryAddress,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'RPC lookup failed' }, { status: 500 });
  }
}
