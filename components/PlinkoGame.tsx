'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Flame,
  Play,
  Square,
  Layers,
  Activity,
} from 'lucide-react';
import VectorButton from '@/components/VectorButton';
import {
  PlinkoRisk,
  PlinkoRows,
  PLINKO_MULTIPLIERS,
  computePlinkoOutcome,
  PlinkoFairOutcome,
} from '@/lib/provablyFair';
import { soundEngine, PitchTelemetry } from '@/lib/soundEngine';

export interface PlinkoGameProps {
  balance: number;
  onBetPlaced: (amount: number) => boolean;
  onWin: (payout: number, multiplier?: number, betAmount?: number, gameLabel?: string) => void;
  onOpenFairModal: () => void;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  onIncrementNonce: () => number;
  onRecordOutcome?: (outcome: PlinkoFairOutcome & { bet: number; payout: number; isDemo: boolean }) => void;
}

interface ActiveBall {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  currentRow: number;
  rows: PlinkoRows;
  risk: PlinkoRisk;
  directions: (0 | 1)[];
  bucketIndex: number;
  multiplier: number;
  betAmount: number;
  isDemo: boolean;
  trail: { x: number; y: number }[];
  color: string;
  done: boolean;
}

interface PegFlash {
  row: number;
  col: number;
  rows: PlinkoRows;
  alpha: number;
  radius: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

interface FloatingWin {
  id: string;
  text: string;
  subtext: string;
  xPct: number;
  color: string;
  isBig: boolean;
}

export default function PlinkoGame({
  balance,
  onBetPlaced,
  onWin,
  onOpenFairModal,
  serverSeed,
  clientSeed,
  nonce,
  onIncrementNonce,
  onRecordOutcome,
}: PlinkoGameProps) {
  // Game Configuration State
  const [playMode, setPlayMode] = useState<'real' | 'demo'>('real');
  const [betAmount, setBetAmount] = useState<number>(25.0);
  const [rows, setRows] = useState<PlinkoRows>(12);
  const [risk, setRisk] = useState<PlinkoRisk>('medium');
  const [isAutoDropping, setIsAutoDropping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Dopamine & Telemetry State
  const [winStreak, setWinStreak] = useState<number>(0);
  const [pitchInfo, setPitchInfo] = useState<PitchTelemetry>({
    frequencyHz: 262,
    noteLabel: 'C4',
    semitoneStep: 0,
    streakBoost: 0,
  });
  const [lastReactionMs, setLastReactionMs] = useState<number>(0.4);
  const [lastOutcome, setLastOutcome] = useState<PlinkoFairOutcome | null>(null);
  const [activeBucketHit, setActiveBucketHit] = useState<number | null>(null);
  const [shakeLevel, setShakeLevel] = useState<'none' | 'normal' | 'mega'>('none');
  const [floatingWins, setFloatingWins] = useState<FloatingWin[]>([]);
  const [recentMultipliers, setRecentMultipliers] = useState<
    { id: string; mult: number; payout: number; isDemo: boolean }[]
  >([]);
  const [activeBallCount, setActiveBallCount] = useState<number>(0);

  // Animated Credit Rollup State
  const [sessionProfitTarget, setSessionProfitTarget] = useState<number>(0);
  const [displayedSessionProfit, setDisplayedSessionProfit] = useState<number>(0);
  const [demoCredits, setDemoCredits] = useState<number>(10000.0);

  // Canvas & Physics Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<ActiveBall[]>([]);
  const pegFlashesRef = useRef<PegFlash[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const streakRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const autoDropIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    streakRef.current = winStreak;
  }, [winStreak]);

  // Smooth Credit Rollup Animation (60fps interpolation)
  useEffect(() => {
    let raf: number;
    const updateRollup = () => {
      setDisplayedSessionProfit((prev) => {
        const diff = sessionProfitTarget - prev;
        if (Math.abs(diff) < 0.05) return sessionProfitTarget;
        return prev + diff * 0.18;
      });
      raf = requestAnimationFrame(updateRollup);
    };
    raf = requestAnimationFrame(updateRollup);
    return () => cancelAnimationFrame(raf);
  }, [sessionProfitTarget]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  // Trigger particle burst on canvas at (x, y)
  const emitParticles = useCallback((x: number, y: number, multiplier: number) => {
    const count = multiplier >= 10 ? 42 : multiplier >= 2 ? 28 : 16;
    const palette =
      multiplier >= 10
        ? ['#fbbf24', '#f43f5e', '#22d3ee', '#ffffff']
        : multiplier >= 1.5
        ? ['#22d3ee', '#a855f7', '#fbbf24']
        : ['#06b6d4', '#10b981', '#94a3b8'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 1.6 + Math.random() * (multiplier >= 2 ? 4.8 : 2.8);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: palette[i % palette.length],
        size: multiplier >= 2 ? 2.8 + Math.random() * 2.2 : 2 + Math.random() * 1.5,
        alpha: 1,
        decay: 0.022 + Math.random() * 0.018,
      });
    }
  }, []);

  // Handle when a ball reaches the final multiplier bucket
  const handleBallLanded = useCallback(
    (ball: ActiveBall, canvasWidth: number, canvasHeight: number) => {
      const payout = Number((ball.betAmount * ball.multiplier).toFixed(2));
      const isProfitable = ball.multiplier >= 1.0;

      // 1. Update consecutive win streak & ascending pitch chord
      const nextStreak = isProfitable ? streakRef.current + 1 : 0;
      streakRef.current = nextStreak;
      setWinStreak(nextStreak);

      const landingPitch = soundEngine.playBucketLanding(ball.multiplier, nextStreak);
      setPitchInfo(landingPitch);

      // 2. Credit balance or demo balance + rollup animation
      if (ball.isDemo) {
        setDemoCredits((prev) => prev + payout);
      } else {
        onWin(payout, ball.multiplier, ball.betAmount, 'PLINKO');
      }
      setSessionProfitTarget((prev) => prev + payout);

      // 3. Bucket compression & screen micro-shake (mapped safely if rows changed mid-flight)
      const mappedBucketIndex =
        ball.rows === rows
          ? ball.bucketIndex
          : Math.min(rows, Math.round((ball.bucketIndex / ball.rows) * rows));
      setActiveBucketHit(mappedBucketIndex);
      setTimeout(
        () => setActiveBucketHit((curr) => (curr === mappedBucketIndex ? null : curr)),
        260
      );

      if (ball.multiplier >= 2.0) {
        setShakeLevel('mega');
        setTimeout(() => setShakeLevel('none'), 320);
      } else if (ball.multiplier >= 1.0) {
        setShakeLevel('normal');
        setTimeout(() => setShakeLevel('none'), 200);
      }

      // 4. Particle explosion at bucket position
      const bucketCount = ball.rows + 1;
      const padX = 28;
      const usableW = Math.max(100, canvasWidth - padX * 2);
      const bucketX = padX + ((ball.bucketIndex + 0.5) / bucketCount) * usableW;
      emitParticles(bucketX, canvasHeight - 18, ball.multiplier);

      // 5. Floating win badge
      const winId = `${ball.id}-win`;
      const xPct = Math.min(88, Math.max(12, ((ball.bucketIndex + 0.5) / bucketCount) * 100));
      const newFloating: FloatingWin = {
        id: winId,
        text: `+$${payout.toFixed(2)}`,
        subtext: `${ball.multiplier}x`,
        xPct,
        color:
          ball.multiplier >= 10
            ? 'text-amber-300 border-amber-400/60 bg-amber-500/20'
            : ball.multiplier >= 1.5
            ? 'text-cyan-300 border-cyan-400/60 bg-cyan-500/20'
            : 'text-emerald-300 border-emerald-400/50 bg-emerald-500/15',
        isBig: ball.multiplier >= 2.0,
      };

      setFloatingWins((prev) => [...prev.slice(-4), newFloating]);
      setTimeout(() => {
        setFloatingWins((prev) => prev.filter((f) => f.id !== winId));
      }, 950);

      setRecentMultipliers((prev) => [
        { id: ball.id, mult: ball.multiplier, payout, isDemo: ball.isDemo },
        ...prev.slice(0, 7),
      ]);
    },
    [emitParticles, onWin, rows]
  );

  // Core Sub-100ms Ball Drop Trigger (supports Real Balance & Instant Free Demo Play)
  const triggerDropBall = useCallback(
    (overrideDemo?: boolean, isInstantReRoll = false) => {
      const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const useDemo = overrideDemo !== undefined ? overrideDemo : playMode === 'demo';
      const effectiveBet = useDemo ? (betAmount > 0 ? betAmount : 25.0) : betAmount;

      if (!useDemo) {
        if (effectiveBet <= 0 || effectiveBet > balance) return false;
        const placed = onBetPlaced(effectiveBet);
        if (!placed) return false;
      } else {
        setDemoCredits((prev) => (prev < effectiveBet ? 10000 - effectiveBet : prev - effectiveBet));
      }

      soundEngine.playBetTrigger(isInstantReRoll);

      const usedNonce = onIncrementNonce();
      const outcome = computePlinkoOutcome(serverSeed, clientSeed, usedNonce, rows, risk);
      setLastOutcome(outcome);

      onRecordOutcome?.({
        ...outcome,
        bet: effectiveBet,
        payout: Number((effectiveBet * outcome.multiplier).toFixed(2)),
        isDemo: useDemo,
      });

      const canvas = canvasRef.current;
      const cw = canvas ? canvas.width : 600;
      const startX = cw / 2 + (Math.random() - 0.5) * 4;

      const ballColor =
        risk === 'high' ? '#f43f5e' : risk === 'medium' ? '#fbbf24' : '#22d3ee';

      const newBall: ActiveBall = {
        id: `ball-${usedNonce}-${Math.random().toString(36).slice(2, 7)}`,
        x: startX,
        y: 18,
        vx: 0,
        vy: 0,
        currentRow: 0,
        rows,
        risk,
        directions: outcome.directions,
        bucketIndex: outcome.bucketIndex,
        multiplier: outcome.multiplier,
        betAmount: effectiveBet,
        isDemo: useDemo,
        trail: [{ x: startX, y: 18 }],
        color: ballColor,
        done: false,
      };

      ballsRef.current.push(newBall);
      setActiveBallCount(ballsRef.current.length);

      const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsed = Math.max(0.2, Number((t1 - t0).toFixed(2)));
      setLastReactionMs(elapsed);
      return true;
    },
    [playMode, betAmount, balance, onBetPlaced, onIncrementNonce, serverSeed, clientSeed, rows, risk, onRecordOutcome]
  );

  // Burst 5 Balls in rapid cascade
  const handleBurstDrop = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        triggerDropBall(undefined, true);
      }, i * 55);
    }
  };

  // Auto-Drop Stream Loop
  useEffect(() => {
    if (isAutoDropping) {
      autoDropIntervalRef.current = setInterval(() => {
        const ok = triggerDropBall( undefined, true );
        if (!ok) {
          setIsAutoDropping(false);
        }
      }, 260);
    } else if (autoDropIntervalRef.current) {
      clearInterval(autoDropIntervalRef.current);
      autoDropIntervalRef.current = null;
    }
    return () => {
      if (autoDropIntervalRef.current) clearInterval(autoDropIntervalRef.current);
    };
  }, [isAutoDropping, triggerDropBall]);

  // Keyboard Spacebar shortcut for Instant Re-roll
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
        e.preventDefault();
        triggerDropBall(undefined, true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerDropBall]);

  // 60FPS Canvas Physics & Peg Pyramid Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const topMargin = 28;
      const bottomMargin = 26;
      const usableH = ch - topMargin - bottomMargin;
      const padX = 28;
      const usableW = cw - padX * 2;

      // Helper to get exact peg coordinates for any row count (supports mid-flight row switches cleanly)
      const getPegPos = (r: number, c: number, forRows: PlinkoRows = rows) => {
        const rSpacing = usableH / forRows;
        const cSpacing = usableW / forRows;
        const pegsInRow = r + 3;
        const rowWidth = (pegsInRow - 1) * cSpacing * 0.88;
        const startX = cw / 2 - rowWidth / 2;
        return {
          x: startX + c * cSpacing * 0.88,
          y: topMargin + (r + 0.5) * rSpacing,
          rSpacing,
          cSpacing,
        };
      };

      // 1. Draw subtle cyber pyramid guide lines
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.lineWidth = 1;
      const topLeft = getPegPos(0, 0);
      const topRight = getPegPos(0, 2);
      const botLeft = getPegPos(rows - 1, 0);
      const botRight = getPegPos(rows - 1, rows + 1);
      ctx.beginPath();
      ctx.moveTo(topLeft.x, topLeft.y);
      ctx.lineTo(botLeft.x, botLeft.y);
      ctx.moveTo(topRight.x, topRight.y);
      ctx.lineTo(botRight.x, botRight.y);
      ctx.stroke();
      ctx.restore();

      // 2. Draw Pegs
      const pegRadius = rows === 16 ? 3.2 : rows === 12 ? 4.0 : 4.8;
      for (let r = 0; r < rows; r++) {
        const pegsInRow = r + 3;
        for (let c = 0; c < pegsInRow; c++) {
          const pos = getPegPos(r, c);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pegRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(226, 232, 240, 0.75)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // 3. Draw & decay Peg Shockwave Flashes
      for (let i = pegFlashesRef.current.length - 1; i >= 0; i--) {
        const pf = pegFlashesRef.current[i];
        if (pf.rows !== rows || pf.row >= rows) {
          pegFlashesRef.current.splice(i, 1);
          continue;
        }
        const pos = getPegPos(pf.row, pf.col, pf.rows);
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pf.radius, 0, Math.PI * 2);
        ctx.strokeStyle = pf.color;
        ctx.globalAlpha = pf.alpha;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        pf.radius += 0.9;
        pf.alpha -= 0.06;
        if (pf.alpha <= 0) {
          pegFlashesRef.current.splice(i, 1);
        }
      }

      // 4. Update & Draw Active Balls along Deterministic HMAC-SHA256 Path
      const activeBalls = ballsRef.current;
      for (let i = activeBalls.length - 1; i >= 0; i--) {
        const b = activeBalls[i];
        const targetRow = b.currentRow;
        const bRowSpacing = usableH / b.rows;
        const bColSpacing = usableW / b.rows;

        // Calculate cumulative right-turns up to targetRow
        let rightCount = 0;
        for (let k = 0; k < targetRow; k++) {
          rightCount += b.directions[k];
        }

        // Target coordinate for current row step
        let targetX: number;
        let targetY: number;

        if (targetRow < b.rows) {
          // Ball is heading toward peg gap in row `targetRow`
          const pegCol = rightCount + 1;
          const pegPos = getPegPos(targetRow, pegCol, b.rows);
          const dirOffset = b.directions[targetRow] === 1 ? bColSpacing * 0.44 : -bColSpacing * 0.44;
          targetX = pegPos.x + dirOffset * 0.55;
          targetY = pegPos.y;
        } else {
          // Final drop into bucketIndex
          const bucketCount = b.rows + 1;
          targetX = padX + ((b.bucketIndex + 0.5) / bucketCount) * usableW;
          targetY = ch - 10;
        }

        const speedY = Math.max(4.2, bRowSpacing * 0.34);
        b.y += speedY;
        b.x += (targetX - b.x) * 0.38;

        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 7) b.trail.shift();

        // Check if ball crossed targetY for current row
        if (b.y >= targetY) {
          if (b.currentRow < b.rows) {
            const hitCol = rightCount + 1;
            if (b.rows === rows) {
              pegFlashesRef.current.push({
                row: b.currentRow,
                col: hitCol,
                rows: b.rows,
                alpha: 0.95,
                radius: pegRadius + 2,
                color: b.color,
              });
            }
            const telemetry = soundEngine.playPegBounce(b.currentRow, streakRef.current);
            setPitchInfo(telemetry);
            b.currentRow += 1;
          } else if (!b.done) {
            b.done = true;
            handleBallLanded(b, cw, ch);
            activeBalls.splice(i, 1);
            setActiveBallCount(activeBalls.length);
            continue;
          }
        }

        // Draw Ball Trail
        for (let t = 0; t < b.trail.length - 1; t++) {
          const pt = b.trail[t];
          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (t + 1) * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.globalAlpha = ((t + 1) / b.trail.length) * 0.35;
          ctx.fill();
          ctx.restore();
        }

        // Draw Glowing Ball
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, pegRadius + 3.2, 0, Math.PI * 2);
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = b.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x - 1.5, b.y - 1.5, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }

      // 5. Update & Draw Celebratory Particle Bursts
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [rows, risk, handleBallLanded]);

  const currentMultipliers = PLINKO_MULTIPLIERS[rows][risk];
  const isRealDisabled = playMode === 'real' && (betAmount > balance || betAmount <= 0);

  return (
    <div
      data-testid="plinko-game-container"
      className={[
        'w-full glass-panel rounded-3xl p-3 sm:p-6 border border-white/10 shadow-2xl relative overflow-hidden transition-transform duration-150',
        shakeLevel === 'mega'
          ? 'translate-y-[-3px] scale-[1.004] border-amber-400/50'
          : shakeLevel === 'normal'
          ? 'translate-y-[-1.5px] border-cyan-400/40'
          : '',
      ].join(' ')}
    >
      {/* Top Header Bar: Game Title + Mode Toggle (Instant Free Demo vs Real Balance) + Audio/Fairness */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 sm:pb-5 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/25 shrink-0">
            <div className="w-full h-full bg-[#050505] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white">
                INFINITE PLINKO
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono font-bold">
                FLAGSHIP
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono font-bold">
                MAX 1000x
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">
              HMAC-SHA256 Multi-Drop Pyramid • Sub-100ms Trigger
            </p>
          </div>
        </div>

        {/* Instant Free Demo Toggle + Audio Mute + Provably Fair */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <VectorButton
            size="xs"
            variant={playMode === 'demo' ? 'emerald' : 'ghost'}
            activeSelected={playMode === 'demo'}
            onClick={() => setPlayMode(playMode === 'demo' ? 'real' : 'demo')}
            data-testid="toggle-demo-mode"
          >
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{playMode === 'demo' ? 'FREE DEMO: ON' : 'FREE DEMO PLAY'}</span>
          </VectorButton>

          <VectorButton
            size="xs"
            variant="ghost"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            data-testid="toggle-audio-btn"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span>{isMuted ? 'MUTED' : 'SYNTH'}</span>
          </VectorButton>

          <VectorButton
            size="xs"
            variant="emerald"
            onClick={onOpenFairModal}
            data-testid="open-fair-modal-btn"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>FAIR SEED</span>
          </VectorButton>
        </div>
      </div>

      {/* Live Dopamine Telemetry Strip: Credit Rollup, Streak, Ascending Pitch & Reaction Speed */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
        <div className="bg-[#08080c] px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-400 block">
              {playMode === 'demo' ? 'Demo Rollup' : 'Session Won'}
            </span>
            <span
              data-testid="session-rollup-counter"
              className="text-xs sm:text-sm font-black font-mono text-emerald-400 glow-gold"
            >
              +${displayedSessionProfit.toFixed(2)}
            </span>
          </div>
          <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>

        <div className="bg-[#08080c] px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-400 block">Harmonic Pitch</span>
            <span
              data-testid="ascending-pitch-indicator"
              className="text-xs sm:text-sm font-black font-mono text-cyan-400"
            >
              {pitchInfo.frequencyHz}Hz ({pitchInfo.noteLabel})
            </span>
          </div>
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
        </div>

        <div className="bg-[#08080c] px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-400 block">Hit Streak</span>
            <span
              data-testid="streak-counter"
              className="text-xs sm:text-sm font-black font-mono text-amber-400"
            >
              {winStreak}x STREAK
            </span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        </div>

        <div className="bg-[#08080c] px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-gray-400 block">Trigger Latency</span>
            <span
              data-testid="reaction-latency-badge"
              className="text-xs sm:text-sm font-black font-mono text-purple-300"
            >
              {lastReactionMs}ms {'<100ms'}
            </span>
          </div>
          <Zap className="w-4 h-4 text-purple-400 shrink-0" />
        </div>
      </div>

      {/* Main Plinko Pyramid Viewport */}
      <div className="relative w-full rounded-2xl bg-[#050505] border border-white/10 overflow-hidden shadow-inner">
        <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-purple-950/10 to-transparent pointer-events-none" />

        {/* Recent Multiplier History Pills (Top Left Overlay) */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-1.5 px-3 pt-2.5">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase mr-1">Hits:</span>
            {recentMultipliers.length === 0 ? (
              <span className="text-[10px] font-mono text-gray-500">
                Tap DROP BALL or INSTANT RE-ROLL to launch
              </span>
            ) : (
              recentMultipliers.slice(0, 5).map((item) => (
                <span
                  key={item.id}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${
                    item.mult >= 10
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                      : item.mult >= 1.5
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                      : item.mult >= 1.0
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  {item.mult}x
                </span>
              ))
            )}
          </div>

          <div className="text-[10px] font-mono text-gray-400">
            {playMode === 'demo' ? (
              <span className="text-emerald-400 font-bold">
                DEMO CREDITS: ${demoCredits.toFixed(2)}
              </span>
            ) : (
              <span>ACTIVE BALLS: {activeBallCount}</span>
            )}
          </div>
        </div>

        {/* Floating Win Rollup Badges */}
        <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 h-20 overflow-hidden">
          {floatingWins.map((fw) => (
            <div
              key={fw.id}
              style={{ left: `${fw.xPct}%` }}
              className={`-translate-x-1/2 absolute bottom-2 px-2.5 py-1 rounded-xl border font-mono font-black text-xs shadow-lg animate-bounce ${fw.color}`}
            >
              <span>{fw.text}</span>
              <span className="ml-1 opacity-80 text-[10px]">({fw.subtext})</span>
            </div>
          ))}
        </div>

        {/* Plinko Physics Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={310}
          onClick={() => triggerDropBall(undefined, false)}
          className="w-full h-56 sm:h-72 md:h-80 block cursor-pointer select-none"
          data-testid="plinko-canvas"
        />

        {/* Responsive Multiplier Bucket Rack */}
        <div
          data-testid="plinko-bucket-rack"
          className="px-0.5 sm:px-4 pb-2.5 pt-1 grid gap-[1px] sm:gap-1"
          style={{
            gridTemplateColumns: `repeat(${currentMultipliers.length}, minmax(0, 1fr))`,
          }}
        >
          {currentMultipliers.map((mult, idx) => {
            const isHit = activeBucketHit === idx;
            const isHigh = mult >= 10;
            const isMid = mult >= 1.5 && mult < 10;
            const isEven = mult >= 1.0 && mult < 1.5;

            const mobileLabel =
              rows === 16
                ? mult >= 1000
                  ? '1K'
                  : mult >= 100
                  ? `${mult}`
                  : mult < 1
                  ? `.${Math.round(mult * 10)}`
                  : `${mult}`
                : `${mult}x`;

            return (
              <div
                key={`${rows}-${risk}-${idx}`}
                data-bucket-index={idx}
                data-multiplier={mult}
                className={[
                  'flex flex-col items-center justify-center rounded-md sm:rounded-lg border py-1 sm:py-1.5 px-0 font-mono font-black text-center select-none transition-all duration-150',
                  rows === 16
                    ? 'text-[5.5px] sm:text-[10px] tracking-tighter'
                    : rows === 12
                    ? 'text-[7px] sm:text-[11px] tracking-tight'
                    : 'text-[9px] sm:text-xs',
                  isHigh
                    ? 'bg-gradient-to-b from-amber-500/30 to-rose-600/30 border-amber-400/60 text-amber-200'
                    : isMid
                    ? 'bg-gradient-to-b from-cyan-500/25 to-purple-600/25 border-cyan-400/50 text-cyan-200'
                    : isEven
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-gray-400',
                  isHit ? 'scale-110 brightness-150 shadow-[0_0_16px_rgba(251,191,36,0.75)] translate-y-0.5' : '',
                ].join(' ')}
              >
                <span className="leading-none sm:hidden">{mobileLabel}</span>
                <span className="leading-none hidden sm:inline">{mult}x</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selectable Risk Level & Selectable Row Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 sm:mt-4">
        {/* Risk Selector */}
        <div className="bg-[#0a0a0f] p-3 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Risk Profile</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 uppercase">{risk} volatility</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {(['low', 'medium', 'high'] as PlinkoRisk[]).map((r) => (
              <VectorButton
                key={r}
                size="sm"
                fullWidth
                variant={r === 'high' ? 'rose' : r === 'medium' ? 'amber' : 'cyan'}
                activeSelected={risk === r}
                onClick={() => setRisk(r)}
                data-testid={`risk-btn-${r}`}
                className="px-1 sm:px-3"
              >
                <span>{r.toUpperCase()}</span>
              </VectorButton>
            ))}
          </div>
        </div>

        {/* Row Count Selector */}
        <div className="bg-[#0a0a0f] p-3 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Pyramid Rows</span>
            </span>
            <span className="text-[10px] font-mono text-amber-400">{rows} PEG ROWS</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {([8, 12, 16] as PlinkoRows[]).map((rowVal) => (
              <VectorButton
                key={rowVal}
                size="sm"
                fullWidth
                variant={rows === rowVal ? 'cyan' : 'ghost'}
                activeSelected={rows === rowVal}
                onClick={() => setRows(rowVal)}
                data-testid={`rows-btn-${rowVal}`}
                className="px-1 sm:px-3"
              >
                <span>{rowVal}R</span>
              </VectorButton>
            ))}
            {/* Explicit Disabled Vector Button with Lock Glyph for VIP 24R Tier */}
            <VectorButton
              size="sm"
              fullWidth
              variant="ghost"
              disabled={true}
              title="VIP Diamond Tier Required"
              data-testid="rows-btn-locked"
              className="px-1 sm:px-3 text-[10px] sm:text-xs"
            >
              <span>24R</span>
            </VectorButton>
          </div>
        </div>
      </div>

      {/* Betting Amount & Sub-100ms Quick-Tap / Instant Re-Roll Action Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-3">
        {/* Wager Input & Quick Chips */}
        <div className="lg:col-span-5 bg-[#0a0a0f] p-3 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor="plinko-bet-input"
              className="text-[11px] font-bold text-gray-300 uppercase tracking-wider"
            >
              {playMode === 'demo' ? 'Demo Wager ($)' : 'Bet Amount ($)'}
            </label>
            <VectorButton
              variant="ghost"
              size="xs"
              onClick={() => setPlayMode(playMode === 'demo' ? 'real' : 'demo')}
              className="text-[10px] font-mono text-cyan-400 min-h-[30px] px-2 py-1"
            >
              <span>{playMode === 'demo' ? 'Real Mode' : 'Try $0 Demo'}</span>
            </VectorButton>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              id="plinko-bet-input"
              type="number"
              min="0"
              max={playMode === 'demo' ? 10000 : balance}
              value={betAmount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setBetAmount(Number.isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="w-full min-w-0 bg-[#050505] border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-black text-white focus:outline-none focus:border-cyan-400"
            />
            <VectorButton
              size="xs"
              variant="ghost"
              onClick={() => setBetAmount((b) => Math.max(1, Math.floor(b / 2)))}
            >
              <span>1/2</span>
            </VectorButton>
            <VectorButton
              size="xs"
              variant="ghost"
              onClick={() =>
                setBetAmount((b) =>
                  Math.min(playMode === 'demo' ? 5000 : Math.max(1, balance), Math.max(1, b * 2))
                )
              }
            >
              <span>2X</span>
            </VectorButton>
            <VectorButton
              size="xs"
              variant="emerald"
              onClick={() => {
                setPlayMode('demo');
                triggerDropBall(true, true);
              }}
              data-testid="instant-free-drop-chip"
            >
              <span>FREE</span>
            </VectorButton>
          </div>
        </div>

        {/* Sub-100ms Action Triggers: DROP BALL, INSTANT RE-ROLL, BURST x5, AUTO */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2 items-stretch">
          <VectorButton
            size="lg"
            variant="cyan"
            fullWidth
            disabled={isRealDisabled}
            onClick={() => triggerDropBall(undefined, false)}
            data-testid="plinko-drop-btn"
            className="px-2 xs:px-3 sm:px-5 text-xs sm:text-sm whitespace-nowrap min-h-[46px] sm:min-h-[50px]"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>{playMode === 'demo' ? 'FREE DROP' : `DROP $${betAmount.toFixed(0)}`}</span>
          </VectorButton>

          <VectorButton
            size="lg"
            variant="amber"
            fullWidth
            disabled={isRealDisabled}
            onClick={() => triggerDropBall(undefined, true)}
            data-testid="plinko-instant-reroll-btn"
            className="px-2 xs:px-3 sm:px-5 text-xs sm:text-sm whitespace-nowrap min-h-[46px] sm:min-h-[50px]"
          >
            <RotateCcw className="w-4 h-4 text-amber-300 shrink-0" />
            <span>RE-ROLL</span>
          </VectorButton>

          <VectorButton
            size="lg"
            variant="purple"
            fullWidth
            disabled={isRealDisabled}
            onClick={handleBurstDrop}
            data-testid="plinko-burst-btn"
            className="px-2 xs:px-3 sm:px-5 text-xs sm:text-sm whitespace-nowrap min-h-[46px] sm:min-h-[50px]"
          >
            <Zap className="w-4 h-4 text-purple-300 shrink-0" />
            <span>BURST x5</span>
          </VectorButton>

          <VectorButton
            size="lg"
            variant={isAutoDropping ? 'rose' : 'emerald'}
            activeSelected={isAutoDropping}
            fullWidth
            disabled={isRealDisabled && !isAutoDropping}
            onClick={() => setIsAutoDropping((prev) => !prev)}
            data-testid="plinko-auto-btn"
            className="px-2 xs:px-3 sm:px-5 text-xs sm:text-sm whitespace-nowrap min-h-[46px] sm:min-h-[50px]"
          >
            {isAutoDropping ? (
              <Square className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <Play className="w-4 h-4 text-emerald-300 shrink-0" />
            )}
            <span>{isAutoDropping ? 'STOP' : 'AUTO'}</span>
          </VectorButton>
        </div>
      </div>

      {/* Live Provably Fair Cryptographic Audit Bar */}
      <div
        data-testid="provably-fair-audit-bar"
        className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-gray-400"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HMAC-SHA256</span>
          </span>
          <span>Seed: {clientSeed}</span>
          <span>Nonce: #{nonce}</span>
          {lastOutcome && (
            <span className="text-cyan-400">
              Digest: {lastOutcome.hmac.slice(0, 12)}... → Slot #{lastOutcome.bucketIndex} (
              {lastOutcome.multiplier}x)
            </span>
          )}
        </div>
        <VectorButton
          variant="ghost"
          size="xs"
          onClick={onOpenFairModal}
          className="text-emerald-400 font-mono text-[10px] min-h-[32px] px-2"
        >
          <span>Verify & Edit Seeds →</span>
        </VectorButton>
      </div>
    </div>
  );
}
