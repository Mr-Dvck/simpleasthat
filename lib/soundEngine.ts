// Web Audio API Synthesizer for Sub-10ms Tactile & Ascending Pitch Dopamine Feedback
// Zero external network dependencies — pure procedural crystal FM/harmonic synthesis.

const PENTATONIC_SEMITONES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36];
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface PitchTelemetry {
  frequencyHz: number;
  noteLabel: string;
  semitoneStep: number;
  streakBoost: number;
}

class DopamineSoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Computes deterministic ascending pitch for a peg hit at `rowIndex` (0..rows-1)
   * compounded by consecutive win streak `streakCount`.
   */
  public computeAscendingPitch(rowIndex: number, streakCount: number = 0): PitchTelemetry {
    const baseMidi = 60; // C4 (261.63 Hz)
    const rowStep = PENTATONIC_SEMITONES[Math.min(rowIndex, PENTATONIC_SEMITONES.length - 1)] ?? rowIndex * 2;
    const streakBoost = Math.min(streakCount, 12); // Up to +1 octave boost on hot streak
    const midi = baseMidi + rowStep + streakBoost;
    const frequencyHz = Math.round(440 * Math.pow(2, (midi - 69) / 12));
    const noteName = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return {
      frequencyHz,
      noteLabel: `${noteName}${octave}`,
      semitoneStep: rowStep + streakBoost,
      streakBoost,
    };
  }

  public playBetTrigger(isInstantReRoll = false) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const startFreq = isInstantReRoll ? 520 : 420;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 1.45, now + 0.045);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Ignore audio context restrictions
    }
  }

  public playPegBounce(rowIndex: number, streakCount: number = 0): PitchTelemetry {
    const telemetry = this.computeAscendingPitch(rowIndex, streakCount);
    const ctx = this.getContext();
    if (!ctx) return telemetry;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(telemetry.frequencyHz, now);
      osc.frequency.exponentialRampToValueAtTime(telemetry.frequencyHz * 1.06, now + 0.04);

      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.065);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore audio context restrictions
    }
    return telemetry;
  }

  public playBucketLanding(multiplier: number, streakCount: number = 0): PitchTelemetry {
    const extraSteps = multiplier >= 10 ? 15 : multiplier >= 2 ? 12 : multiplier >= 1 ? 8 : 3;
    const telemetry = this.computeAscendingPitch(extraSteps, streakCount);
    const ctx = this.getContext();
    if (!ctx) return telemetry;

    try {
      const now = ctx.currentTime;
      const isBigWin = multiplier >= 2.0;
      const isWin = multiplier >= 1.0;

      const intervals = isBigWin ? [1, 1.25, 1.5, 2.0] : isWin ? [1, 1.25, 1.5] : [1, 0.89];

      intervals.forEach((ratio, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.045;
        const duration = isBigWin ? 0.24 : 0.14;

        osc.type = isBigWin ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(telemetry.frequencyHz * ratio, noteStart);

        gain.gain.setValueAtTime(isBigWin ? 0.09 : 0.06, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.0008, noteStart + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.01);
      });
    } catch {
      // Ignore audio context restrictions
    }
    return telemetry;
  }
}

export const soundEngine = new DopamineSoundEngine();
