"use client";

import { useCallback, useEffect } from "react";

import {
  armAudioOnFirstGesture,
  getAudioContext,
  getMasterGain,
} from "@/lib/audio";

export type ChessSoundEvent =
  | "move-self"
  | "move-opponent"
  | "capture"
  | "castle"
  | "promote"
  | "check"
  | "game-win"
  | "game-loss"
  | "draw"
  | "invalid"
  | "start";

type ToneOptions = {
  delay?: number;
  duration?: number;
  startFreq: number;
  endFreq?: number;
  gain?: number;
  type?: OscillatorType;
};

type NoiseOptions = {
  delay?: number;
  duration?: number;
  gain?: number;
  filterHz?: number;
  filterQ?: number;
  filterType?: BiquadFilterType;
  decay?: number;
};

const FLOOR_GAIN = 0.0001;

function scheduleTone(
  ctx: AudioContext,
  master: GainNode,
  {
    delay = 0,
    duration = 0.1,
    startFreq,
    endFreq = startFreq,
    gain = 0.035,
    type = "sine",
  }: ToneOptions,
) {
  const startAt = ctx.currentTime + delay;
  const endAt = startAt + Math.max(0.025, duration);
  const attack = Math.min(0.008, duration / 4);
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(1, startFreq), startAt);
  if (endFreq !== startFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), endAt);
  }

  gainNode.gain.setValueAtTime(0, startAt);
  gainNode.gain.linearRampToValueAtTime(gain, startAt + attack);
  gainNode.gain.exponentialRampToValueAtTime(FLOOR_GAIN, endAt);

  osc.connect(gainNode).connect(master);
  osc.start(startAt);
  osc.stop(endAt + 0.04);

  window.setTimeout(
    () => {
      try {
        osc.disconnect();
        gainNode.disconnect();
      } catch {
        // ignore cleanup races
      }
    },
    (delay + duration + 0.08) * 1000,
  );
}

function scheduleNoise(
  ctx: AudioContext,
  master: GainNode,
  {
    delay = 0,
    duration = 0.06,
    gain = 0.035,
    filterHz = 1200,
    filterQ = 0.8,
    filterType = "bandpass",
    decay = 26,
  }: NoiseOptions,
) {
  const safeDuration = Math.max(0.018, duration);
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.ceil(safeDuration * sampleRate), sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    const t = i / sampleRate;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * decay);
  }

  const startAt = ctx.currentTime + delay;
  const endAt = startAt + safeDuration;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gainNode = ctx.createGain();

  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterHz, startAt);
  filter.Q.setValueAtTime(filterQ, startAt);

  gainNode.gain.setValueAtTime(0, startAt);
  gainNode.gain.linearRampToValueAtTime(gain, startAt + 0.003);
  gainNode.gain.exponentialRampToValueAtTime(FLOOR_GAIN, endAt);

  source.connect(filter).connect(gainNode).connect(master);
  source.start(startAt);
  source.stop(endAt + 0.02);

  window.setTimeout(
    () => {
      try {
        source.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch {
        // ignore cleanup races
      }
    },
    (delay + safeDuration + 0.07) * 1000,
  );
}

function scheduleWoodTap(
  ctx: AudioContext,
  master: GainNode,
  delay: number,
  toneHz: number,
  snapHz: number,
  gain = 1,
) {
  scheduleTone(ctx, master, {
    delay,
    startFreq: toneHz,
    endFreq: toneHz * 0.72,
    duration: 0.075,
    gain: 0.035 * gain,
    type: "triangle",
  });
  scheduleNoise(ctx, master, {
    delay,
    duration: 0.045,
    gain: 0.032 * gain,
    filterHz: snapHz,
    filterQ: 1.8,
    decay: 46,
  });
}

export function playChessSound(event: ChessSoundEvent): void {
  if (typeof window === "undefined") return;

  try {
    const ctx = getAudioContext();
    const master = getMasterGain();

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    switch (event) {
      case "move-self":
        scheduleWoodTap(ctx, master, 0, 235, 1450, 0.9);
        break;
      case "move-opponent":
        scheduleWoodTap(ctx, master, 0, 195, 1180, 0.85);
        break;
      case "capture":
        scheduleWoodTap(ctx, master, 0, 190, 1350, 1.05);
        scheduleWoodTap(ctx, master, 0.055, 130, 820, 0.72);
        break;
      case "castle":
        scheduleWoodTap(ctx, master, 0, 220, 1300, 0.86);
        scheduleWoodTap(ctx, master, 0.095, 245, 1500, 0.8);
        break;
      case "promote":
        scheduleWoodTap(ctx, master, 0, 230, 1400, 0.85);
        scheduleTone(ctx, master, {
          delay: 0.05,
          startFreq: 659.25,
          endFreq: 987.77,
          duration: 0.18,
          gain: 0.024,
          type: "sine",
        });
        break;
      case "check":
        scheduleWoodTap(ctx, master, 0, 205, 1150, 0.8);
        scheduleTone(ctx, master, {
          delay: 0.065,
          startFreq: 880,
          endFreq: 740,
          duration: 0.16,
          gain: 0.032,
          type: "triangle",
        });
        break;
      case "game-win":
        scheduleTone(ctx, master, { startFreq: 523.25, duration: 0.12, gain: 0.026, type: "triangle" });
        scheduleTone(ctx, master, { delay: 0.08, startFreq: 659.25, duration: 0.13, gain: 0.028, type: "triangle" });
        scheduleTone(ctx, master, { delay: 0.17, startFreq: 987.77, duration: 0.2, gain: 0.026, type: "sine" });
        break;
      case "game-loss":
        scheduleTone(ctx, master, { startFreq: 349.23, endFreq: 293.66, duration: 0.16, gain: 0.03, type: "triangle" });
        scheduleTone(ctx, master, { delay: 0.12, startFreq: 261.63, endFreq: 196, duration: 0.22, gain: 0.027, type: "sine" });
        break;
      case "draw":
        scheduleTone(ctx, master, { startFreq: 440, duration: 0.11, gain: 0.022, type: "triangle" });
        scheduleTone(ctx, master, { delay: 0.12, startFreq: 440, duration: 0.16, gain: 0.018, type: "sine" });
        break;
      case "invalid":
        scheduleNoise(ctx, master, {
          duration: 0.09,
          gain: 0.026,
          filterHz: 260,
          filterQ: 0.55,
          filterType: "lowpass",
          decay: 20,
        });
        scheduleTone(ctx, master, {
          startFreq: 120,
          endFreq: 82,
          duration: 0.1,
          gain: 0.026,
          type: "triangle",
        });
        break;
      case "start":
        scheduleWoodTap(ctx, master, 0, 220, 1200, 0.65);
        scheduleTone(ctx, master, {
          delay: 0.06,
          startFreq: 392,
          endFreq: 523.25,
          duration: 0.12,
          gain: 0.018,
          type: "sine",
        });
        break;
    }
  } catch {
    // Ignore missing/blocked Web Audio support.
  }
}

export function useChessSounds(): (event: ChessSoundEvent) => void {
  useEffect(() => {
    armAudioOnFirstGesture();
  }, []);

  return useCallback((event: ChessSoundEvent) => {
    playChessSound(event);
  }, []);
}
