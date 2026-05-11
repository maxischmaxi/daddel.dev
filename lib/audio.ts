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
