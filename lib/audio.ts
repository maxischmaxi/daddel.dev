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

export function getAudioContext(): AudioContext {
  if (ctx === null) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

let armed = false;

export function armAudioOnFirstGesture(): void {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const arm = () => {
    getAudioContext();
    getMasterGain();
    window.removeEventListener("pointerdown", arm);
    window.removeEventListener("keydown", arm);
    window.removeEventListener("touchstart", arm);
  };
  window.addEventListener("pointerdown", arm);
  window.addEventListener("keydown", arm);
  window.addEventListener("touchstart", arm);
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

