"use client";

import { useEffect, useState } from "react";

import {
  armAudioOnFirstGesture,
  scheduleScoreCountPips,
  type ScheduledTick,
} from "@/lib/audio";
import { cn } from "@/lib/utils";

export type AnimatedScoreProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  maxValue?: number;
  playSound?: boolean;
  className?: string;
  ariaLabel?: string;
};

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function AnimatedScore({
  value,
  decimals = 3,
  prefix = "",
  suffix = "",
  durationMs = 950,
  maxValue = 10,
  playSound = true,
  className,
  ariaLabel,
}: AnimatedScoreProps) {
  const targetValue = safeNumber(value);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    armAudioOnFirstGesture();

    if (durationMs <= 0 || targetValue <= 0) {
      setDisplayValue(targetValue);
      return;
    }

    let frame = 0;
    let scorePips: ScheduledTick | null = null;
    const start = performance.now();

    setDisplayValue(0);

    const update = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplayValue(targetValue * easeInOutCubic(progress));

      if (progress < 1) {
        frame = requestAnimationFrame(update);
      } else {
        setDisplayValue(targetValue);
      }
    };

    frame = requestAnimationFrame(update);

    if (playSound) {
      try {
        scorePips = scheduleScoreCountPips(targetValue, {
          durationSec: durationMs / 1000,
          maxScore: maxValue,
        });
      } catch {
        scorePips = null;
      }
    }

    return () => {
      cancelAnimationFrame(frame);
      scorePips?.stop();
    };
  }, [durationMs, maxValue, playSound, targetValue]);

  const formatted = `${prefix}${displayValue.toFixed(decimals)}${suffix}`;
  const finalLabel =
    ariaLabel ?? `${prefix}${targetValue.toFixed(decimals)}${suffix}`;

  return (
    <span
      className={cn("inline-block tabular-nums", className)}
      aria-label={finalLabel}
    >
      {formatted}
    </span>
  );
}
