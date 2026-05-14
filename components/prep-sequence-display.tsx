"use client";

import { useEffect } from "react";

import { usePrepSequenceTone } from "@/lib/click-tone";
import { cn } from "@/lib/utils";

type Props = {
  step: number | null;
  text: string;
  playTone?: boolean;
  className?: string;
};

const DEFAULT_CLASS =
  "pointer-events-none absolute inset-0 z-2 flex select-none items-center justify-center text-[clamp(3rem,16vw,4rem)] font-bold tracking-tight text-white animate-prep-slide-up";

export function PrepSequenceDisplay({
  step,
  text,
  playTone = true,
  className,
}: Props) {
  const playPrepTone = usePrepSequenceTone();

  useEffect(() => {
    if (!playTone || step === null) return;
    playPrepTone(step);
  }, [playPrepTone, playTone, step]);

  if (step === null) return null;

  return (
    <span key={`prep-${step}`} className={cn(DEFAULT_CLASS, className)}>
      {text}
    </span>
  );
}
