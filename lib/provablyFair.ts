// Pure TypeScript synchronous SHA-256 & HMAC-SHA256 implementation (FIPS 180-4 / RFC 2104)
// Engineered for sub-1ms synchronous execution in browser & Node.js with 100% cryptographic accuracy.

export type PlinkoRisk = 'low' | 'medium' | 'high';
export type PlinkoRows = 8 | 12 | 16;

export const PLINKO_MULTIPLIERS: Record<PlinkoRows, Record<PlinkoRisk, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  12: {
    low: [10, 3, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3, 10],
    medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
  },
  16: {
    low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    medium: [110, 41, 10, 5, 3, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 3, 5, 10, 41, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
};

const K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n));
}

function utf8ToBytes(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return new Uint8Array(bytes);
}

export function sha256Bytes(data: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLen = data.length * 8;
  const padLen = ((data.length + 9 + 63) & ~63);
  const padded = new Uint8Array(padLen);
  padded.set(data);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(padLen - 4, bitLen >>> 0, false);

  const w = new Int32Array(64);

  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getInt32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0 >>> 0, false);
  outView.setUint32(4, h1 >>> 0, false);
  outView.setUint32(8, h2 >>> 0, false);
  outView.setUint32(12, h3 >>> 0, false);
  outView.setUint32(16, h4 >>> 0, false);
  outView.setUint32(20, h5 >>> 0, false);
  outView.setUint32(24, h6 >>> 0, false);
  outView.setUint32(28, h7 >>> 0, false);
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function sha256Hex(message: string): string {
  return bytesToHex(sha256Bytes(utf8ToBytes(message)));
}

export function hmacSha256Bytes(key: string, message: string): Uint8Array {
  const blockSize = 64;
  let keyBytes = utf8ToBytes(key);
  if (keyBytes.length > blockSize) {
    keyBytes = sha256Bytes(keyBytes);
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    const k = i < keyBytes.length ? keyBytes[i] : 0;
    oKeyPad[i] = k ^ 0x5c;
    iKeyPad[i] = k ^ 0x36;
  }

  const msgBytes = utf8ToBytes(message);
  const innerInput = new Uint8Array(blockSize + msgBytes.length);
  innerInput.set(iKeyPad, 0);
  innerInput.set(msgBytes, blockSize);
  const innerHash = sha256Bytes(innerInput);

  const outerInput = new Uint8Array(blockSize + innerHash.length);
  outerInput.set(oKeyPad, 0);
  outerInput.set(innerHash, blockSize);
  return sha256Bytes(outerInput);
}

export function hmacSha256Hex(key: string, message: string): string {
  return bytesToHex(hmacSha256Bytes(key, message));
}

export function generateSeedHex(byteCount = 16): string {
  const bytes = new Uint8Array(byteCount);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteCount; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

export interface PlinkoFairOutcome {
  hmac: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  rows: PlinkoRows;
  risk: PlinkoRisk;
  directions: (0 | 1)[]; // 0 = left, 1 = right at each peg row
  bucketIndex: number;
  multiplier: number;
}

export function computePlinkoOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  rows: PlinkoRows,
  risk: PlinkoRisk
): PlinkoFairOutcome {
  const cleanServer = serverSeed || 'default-server-seed';
  const cleanClient = clientSeed || 'simple-as-that-client';
  const safeNonce = Number.isFinite(nonce) ? Math.max(0, Math.floor(nonce)) : 0;
  const hmac = hmacSha256Hex(cleanServer, `${cleanClient}:${safeNonce}`);
  const serverSeedHash = sha256Hex(cleanServer);

  const directions: (0 | 1)[] = [];
  let bucketIndex = 0;

  // Each row consumes 4 hex characters (16 bits = 0..65535) from the 64-char HMAC digest
  for (let i = 0; i < rows; i++) {
    const slice = hmac.slice(i * 4, i * 4 + 4);
    const val = parseInt(slice, 16);
    const dir: 0 | 1 = val >= 32768 ? 1 : 0;
    directions.push(dir);
    bucketIndex += dir;
  }

  const rowTable = PLINKO_MULTIPLIERS[rows] || PLINKO_MULTIPLIERS[12];
  const multipliers = rowTable[risk] || rowTable.medium;
  const multiplier = multipliers[bucketIndex] ?? 1.0;

  return {
    hmac,
    serverSeedHash,
    clientSeed: cleanClient,
    nonce: safeNonce,
    rows,
    risk,
    directions,
    bucketIndex,
    multiplier,
  };
}

export function computeCrashOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): { hmac: string; serverSeedHash: string; crashPoint: number } {
  const hmac = hmacSha256Hex(serverSeed || 'default-server-seed', `${clientSeed || 'client'}:${nonce}`);
  const serverSeedHash = sha256Hex(serverSeed || 'default-server-seed');
  const rawVal = parseInt(hmac.substring(0, 13), 16);
  const e = Math.pow(2, 52);

  let crashPoint = 1.0;
  if (rawVal % 33 !== 0) {
    crashPoint = Math.max(1.01, Math.floor((100 * e - rawVal) / (e - rawVal)) / 100);
    crashPoint = Math.min(100.0, crashPoint);
  }
  return { hmac, serverSeedHash, crashPoint };
}

export function computeDiceOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): { hmac: string; serverSeedHash: string; roll: number } {
  const hmac = hmacSha256Hex(serverSeed || 'default-server-seed', `${clientSeed || 'client'}:${nonce}`);
  const serverSeedHash = sha256Hex(serverSeed || 'default-server-seed');
  const rollInt = parseInt(hmac.substring(0, 8), 16);
  const roll = Math.floor(rollInt % 10000) / 100;
  return { hmac, serverSeedHash, roll };
}
