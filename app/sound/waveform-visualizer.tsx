"use client";

import { useEffect, useRef, type RefObject } from "react";

type Props = {
  analyserRef: RefObject<AnalyserNode | null>;
  className?: string;
};

type Wave = {
  baseFreq: number;
  phaseSpeed: number;
  jitter: number;
  jitterSpeed: number;
  baseAmp: number;
  audioGain: number;
  color: string;
  blur: number;
  lineWidth: number;
  alpha: number;
};

const WAVES: ReadonlyArray<Wave> = [
  {
    baseFreq: 1.4,
    phaseSpeed: 0.32,
    jitter: 0.22,
    jitterSpeed: 0.21,
    baseAmp: 0.14,
    audioGain: 0.42,
    color: "#1d3bff",
    blur: 14,
    lineWidth: 2.4,
    alpha: 0.45,
  },
  {
    baseFreq: 2.3,
    phaseSpeed: 0.51,
    jitter: 0.28,
    jitterSpeed: 0.27,
    baseAmp: 0.11,
    audioGain: 0.36,
    color: "#2a82ff",
    blur: 9,
    lineWidth: 1.8,
    alpha: 0.55,
  },
  {
    baseFreq: 3.7,
    phaseSpeed: 0.74,
    jitter: 0.34,
    jitterSpeed: 0.34,
    baseAmp: 0.085,
    audioGain: 0.28,
    color: "#5fbcff",
    blur: 5,
    lineWidth: 1.4,
    alpha: 0.65,
  },
  {
    baseFreq: 5.6,
    phaseSpeed: 1.04,
    jitter: 0.4,
    jitterSpeed: 0.45,
    baseAmp: 0.06,
    audioGain: 0.22,
    color: "#c1efff",
    blur: 2,
    lineWidth: 0.9,
    alpha: 0.78,
  },
];

const SAMPLE_STEP_PX = 3;
const DECAY_ALPHA = 0.14;
const ENERGY_SMOOTH = 0.12;
const ENERGY_NORMALIZE = 0.5;
const PITCH_SMOOTH = 0.09;
const PITCH_THRESHOLD = 28;
const MIN_HZ_DETECT = 80;
const MAX_HZ_DETECT = 2400;
const PITCH_OCTAVE_REF = 110;
const PITCH_OCTAVES = 4;
const FREQ_MULT_MIN = 0.4;
const FREQ_MULT_MAX = 3.2;
const SPEED_MULT_MIN = 0.6;
const SPEED_MULT_MAX = 2.8;

function smoothEdges(t: number): number {
  const edge = 0.12;
  if (t < edge) return t / edge;
  if (t > 1 - edge) return (1 - t) / edge;
  return 1;
}

export function WaveformVisualizer({ analyserRef, className }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let logicalW = 0;
    let logicalH = 0;
    let lastFftSize = 0;
    let timeBuf: Uint8Array<ArrayBuffer> | null = null;
    let freqBuf: Uint8Array<ArrayBuffer> | null = null;
    let smoothedEnergy = 0;
    let smoothedPitch = 0.5;
    const phases = WAVES.map(() => Math.random() * Math.PI * 2);
    let lastDrawTime = performance.now();
    const t0 = performance.now();

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const nextW = Math.max(1, Math.floor(rect.width));
      const nextH = Math.max(1, Math.floor(rect.height));
      if (nextW === logicalW && nextH === logicalH) return;
      logicalW = nextW;
      logicalH = nextH;
      canvas.width = Math.floor(logicalW * dpr);
      canvas.height = Math.floor(logicalH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, logicalW, logicalH);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const w = logicalW;
      const h = logicalH;
      if (w === 0 || h === 0) return;
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastDrawTime) / 1000);
      lastDrawTime = now;
      const elapsed = (now - t0) / 1000;

      // Phosphor decay
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(0,0,0,${DECAY_ALPHA})`;
      ctx.fillRect(0, 0, w, h);

      const analyser = analyserRef.current;
      let rms = 0;
      let detectedPitch = smoothedPitch;

      if (analyser) {
        if (timeBuf === null || lastFftSize !== analyser.fftSize) {
          timeBuf = new Uint8Array(new ArrayBuffer(analyser.fftSize));
          freqBuf = new Uint8Array(
            new ArrayBuffer(analyser.frequencyBinCount),
          );
          lastFftSize = analyser.fftSize;
        }

        // RMS (Energie)
        analyser.getByteTimeDomainData(timeBuf);
        let sumSq = 0;
        for (let i = 0; i < timeBuf.length; i++) {
          const v = timeBuf[i] / 128 - 1;
          sumSq += v * v;
        }
        rms = Math.sqrt(sumSq / timeBuf.length);

        // Pitch via Peak-Bin im FFT-Spektrum
        if (freqBuf) {
          analyser.getByteFrequencyData(freqBuf);
          const sampleRate = analyser.context.sampleRate;
          const binWidth = sampleRate / analyser.fftSize;
          const minBin = Math.max(1, Math.floor(MIN_HZ_DETECT / binWidth));
          const maxBin = Math.min(
            freqBuf.length - 1,
            Math.ceil(MAX_HZ_DETECT / binWidth),
          );
          let peakBin = 0;
          let peakMag = 0;
          for (let i = minBin; i <= maxBin; i++) {
            if (freqBuf[i] > peakMag) {
              peakMag = freqBuf[i];
              peakBin = i;
            }
          }
          if (peakMag > PITCH_THRESHOLD) {
            // Quadratische Interpolation für sub-bin Genauigkeit
            const yMinus = freqBuf[Math.max(0, peakBin - 1)];
            const yZero = freqBuf[peakBin];
            const yPlus = freqBuf[Math.min(freqBuf.length - 1, peakBin + 1)];
            const denom = yMinus - 2 * yZero + yPlus;
            const offset =
              denom !== 0 ? (0.5 * (yMinus - yPlus)) / denom : 0;
            const refinedBin = peakBin + Math.max(-1, Math.min(1, offset));
            const peakHz = refinedBin * binWidth;
            detectedPitch = Math.max(
              0,
              Math.min(
                1,
                Math.log2(peakHz / PITCH_OCTAVE_REF) / PITCH_OCTAVES,
              ),
            );
          }
        }
      }

      const targetEnergy = Math.min(1, rms / ENERGY_NORMALIZE);
      smoothedEnergy += (targetEnergy - smoothedEnergy) * ENERGY_SMOOTH;
      smoothedPitch += (detectedPitch - smoothedPitch) * PITCH_SMOOTH;

      const energy = smoothedEnergy;
      const pitch = smoothedPitch;
      const freqMult =
        FREQ_MULT_MIN + pitch * (FREQ_MULT_MAX - FREQ_MULT_MIN);
      const speedMult =
        SPEED_MULT_MIN + pitch * (SPEED_MULT_MAX - SPEED_MULT_MIN);

      const cx = w / 2;
      const halfW = w / 2;
      const steps = Math.max(8, Math.ceil(h / SAMPLE_STEP_PX));

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let wi = 0; wi < WAVES.length; wi++) {
        const wave = WAVES[wi];
        const jitter = Math.sin(elapsed * wave.jitterSpeed) * wave.jitter;
        const driftFreq = (wave.baseFreq + jitter) * freqMult;
        phases[wi] += wave.phaseSpeed * speedMult * dt;
        const phase = phases[wi];
        const amp = (wave.baseAmp + energy * wave.audioGain) * halfW;

        ctx.shadowBlur = wave.blur;
        ctx.shadowColor = wave.color;
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = wave.alpha;
        ctx.lineWidth = wave.lineWidth;

        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const y = t * h;
          const env = smoothEdges(t);
          const x =
            cx + Math.sin(t * Math.PI * 2 * driftFreq + phase) * amp * env;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [analyserRef]);

  return (
    <div
      ref={wrapperRef}
      className={className ?? "relative h-full w-full"}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
