type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

let muted: boolean | null = null;
const mutedListeners = new Set<() => void>();
const STORAGE_KEY = "browser-games:audio-muted";

function ensureMutedLoaded(): boolean {
  if (muted === null) {
    if (typeof window !== "undefined") {
      muted = window.localStorage.getItem(STORAGE_KEY) === "true";
    } else {
      muted = false;
    }
  }
  return muted;
}

export function isAudioMuted(): boolean {
  return ensureMutedLoaded();
}

export function setAudioMuted(value: boolean): void {
  ensureMutedLoaded();
  if (muted === value) return;
  muted = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  }
  if (masterGain !== null) {
    const c = masterGain.context;
    const now = c.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(value ? 0 : 1, now + 0.08);
  }
  for (const listener of mutedListeners) listener();
}

export function subscribeAudioMuted(listener: () => void): () => void {
  mutedListeners.add(listener);
  return () => {
    mutedListeners.delete(listener);
  };
}

function createAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is only available in the browser");
  }

  const AudioContextCtor =
    window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;
  if (!AudioContextCtor) {
    throw new Error("Web Audio API is not supported in this browser");
  }

  return new AudioContextCtor();
}

export function getAudioContext(): AudioContext {
  if (ctx === null || ctx.state === "closed") {
    ctx = createAudioContext();
    masterGain = null;
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

function playSilentUnlockSound(c: AudioContext): void {
  try {
    const buffer = c.createBuffer(1, 1, c.sampleRate);
    const source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(c.destination);
    source.start(0);
    window.setTimeout(() => {
      try {
        source.disconnect();
      } catch {
        /* ignore */
      }
    }, 0);
  } catch {
    /* ignore — the resume attempt above is still useful */
  }
}

export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  try {
    const c = getAudioContext();
    getMasterGain();
    if (c.state === "suspended") {
      void c.resume();
    }
    playSilentUnlockSound(c);
  } catch {
    /* no Web Audio support */
  }
}

let armed = false;

const AUDIO_UNLOCK_EVENTS = [
  "pointerdown",
  "pointerup",
  "mousedown",
  "touchend",
  "click",
  "keydown",
] as const;

export function armAudioOnFirstGesture(): void {
  if (armed || typeof window === "undefined") return;
  armed = true;

  let arm: () => void;
  const disarm = () => {
    for (const eventName of AUDIO_UNLOCK_EVENTS) {
      window.removeEventListener(eventName, arm);
    }
  };

  arm = () => {
    unlockAudio();
    const c = ctx;
    if (c?.state === "running") {
      disarm();
      return;
    }
    void c?.resume().finally(() => {
      if (c.state === "running") disarm();
    });
  };

  for (const eventName of AUDIO_UNLOCK_EVENTS) {
    window.addEventListener(eventName, arm);
  }
}

export function getMasterGain(): GainNode {
  const c = getAudioContext();
  if (masterGain === null) {
    masterGain = c.createGain();
    masterGain.gain.value = ensureMutedLoaded() ? 0 : 1;
    masterGain.connect(c.destination);
  }
  return masterGain;
}

export type ScheduledTick = {
  stop: () => void;
};

export function scheduleTickRoll(
  durationSec: number,
  options: {
    delaySec?: number;
    offsetSec?: number;
    startFreqHz?: number;
    endFreqHz?: number;
    tickWidthSec?: number;
    decay?: number;
    peakGain?: number;
    filterType?: BiquadFilterType;
    filterHz?: number;
    filterQ?: number;
  } = {},
): ScheduledTick | null {
  const ctx = getAudioContext();
  if (ctx.state !== "running") return null;
  const master = getMasterGain();

  const delay = Math.max(0, options.delaySec ?? 0);
  const offset = Math.max(0, options.offsetSec ?? 0);
  const startFreq = options.startFreqHz ?? 3;
  const endFreq = options.endFreqHz ?? 22;
  const tickWidth = options.tickWidthSec ?? 0.009;
  const decay = options.decay ?? 5;
  const peak = options.peakGain ?? 0.32;
  const filterType: BiquadFilterType = options.filterType ?? "bandpass";
  const filterHz = options.filterHz ?? 2500;
  const filterQ = options.filterQ ?? 1.2;

  const sampleRate = ctx.sampleRate;
  const bufferLen = Math.ceil((durationSec + 0.05) * sampleRate);
  const buffer = ctx.createBuffer(1, bufferLen, sampleRate);
  const data = buffer.getChannelData(0);
  const samplesPerTick = Math.max(1, Math.floor(tickWidth * sampleRate));
  const safeDur = Math.max(0.001, durationSec);
  const freqRatio = endFreq / startFreq;
  let phase = 0;
  let lastTick = -1;
  let tickStartSample = -1;
  for (let i = 0; i < data.length; i++) {
    const t = Math.min(i / sampleRate, safeDur);
    const freq = startFreq * Math.pow(freqRatio, t / safeDur);
    phase += freq / sampleRate;

    const currentTick = Math.floor(phase);
    if (currentTick > lastTick) {
      lastTick = currentTick;
      tickStartSample = i;
    }

    if (tickStartSample >= 0 && i - tickStartSample < samplesPerTick) {
      const u = (i - tickStartSample) / samplesPerTick;
      const env = Math.exp(-u * decay);
      const noise = Math.random() * 2 - 1;
      data[i] = noise * env;
    }
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterHz;
  filter.Q.value = filterQ;

  const gain = ctx.createGain();
  const startAt = ctx.currentTime + delay;
  const endAt = startAt + durationSec;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + 0.015);
  gain.gain.setValueAtTime(peak, Math.max(startAt + 0.015, endAt - 0.04));
  gain.gain.linearRampToValueAtTime(0, endAt);

  src.connect(filter).connect(gain).connect(master);
  src.start(startAt, offset);
  src.stop(endAt + 0.05);

  let stopped = false;
  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      const now = ctx.currentTime;
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.025);
      } catch {
        // ignore
      }
      try {
        src.stop(now + 0.05);
      } catch {
        // already stopped
      }
      window.setTimeout(() => {
        try {
          src.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch {
          // ignore
        }
      }, 100);
    },
  };
}

export function scheduleScoreCountPips(
  targetScore: number,
  options: {
    durationSec?: number;
    maxScore?: number;
    delaySec?: number;
    minPips?: number;
    maxPips?: number;
    startFreqHz?: number;
    endFreqHz?: number;
    pipLengthSec?: number;
    peakGain?: number;
    oscillatorType?: OscillatorType;
  } = {},
): ScheduledTick | null {
  const score = Math.max(0, Number.isFinite(targetScore) ? targetScore : 0);
  if (score <= 0.0001) return null;

  const ctx = getAudioContext();
  if (ctx.state !== "running") return null;

  const master = getMasterGain();
  const duration = Math.max(0.12, options.durationSec ?? 0.95);
  const delay = Math.max(0, options.delaySec ?? 0.01);
  const maxScore = Math.max(0.0001, options.maxScore ?? 10);
  const normalizedScore = Math.max(0, Math.min(1, score / maxScore));
  const minPips = Math.max(1, options.minPips ?? 3);
  const maxPips = Math.max(minPips, options.maxPips ?? 14);
  const pipCount = Math.max(
    1,
    Math.round(minPips + (maxPips - minPips) * Math.sqrt(normalizedScore)),
  );
  const pipLength = Math.max(0.025, options.pipLengthSec ?? 0.044);
  const peakGain = Math.max(0.0001, options.peakGain ?? 0.032);
  const startFreq = Math.max(20, options.startFreqHz ?? 420);
  const endFreq = Math.max(
    startFreq + 1,
    options.endFreqHz ?? 650 + 520 * normalizedScore,
  );
  const startAt = ctx.currentTime + delay;
  const lastPipAt = Math.max(0.01, duration - pipLength * 0.7);
  const nodes: Array<{ osc: OscillatorNode; gain: GainNode }> = [];

  for (let i = 0; i < pipCount; i++) {
    const progress = pipCount === 1 ? 1 : i / (pipCount - 1);
    const acceleratedTime = 1 - Math.pow(1 - progress, 1.65);
    const at = startAt + lastPipAt * acceleratedTime;
    const freq = startFreq * Math.pow(endFreq / startFreq, progress);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = options.oscillatorType ?? "sine";
    osc.frequency.setValueAtTime(freq, at);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.035, at + pipLength);

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peakGain, at + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + pipLength);

    osc.connect(gain).connect(master);
    osc.start(at);
    osc.stop(at + pipLength + 0.025);
    nodes.push({ osc, gain });
  }

  let stopped = false;
  let cleanupTimer: number | null = window.setTimeout(
    () => {
      cleanupTimer = null;
      for (const { osc, gain } of nodes) {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // ignore
        }
      }
    },
    (delay + duration + 0.15) * 1000,
  );

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      if (cleanupTimer !== null) {
        window.clearTimeout(cleanupTimer);
        cleanupTimer = null;
      }
      const now = ctx.currentTime;
      for (const { osc, gain } of nodes) {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.025);
        } catch {
          // ignore
        }
        try {
          osc.stop(now + 0.04);
        } catch {
          // already stopped
        }
      }
      window.setTimeout(() => {
        for (const { osc, gain } of nodes) {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {
            // ignore
          }
        }
      }, 90);
    },
  };
}

