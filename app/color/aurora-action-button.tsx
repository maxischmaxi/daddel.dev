"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AURORA_GRADIENT, CUBE_ACTION_BASE } from "./shared-styles";
import { useBingClick } from "./use-click-tone";
import { useHoverTone, type ToneSpec } from "./use-hover-tone";

type Props = {
  ariaLabel: string;
  tone: readonly ToneSpec[];
  onClick: () => void;
  disabled?: boolean;
  rings?: ReactNode;
  children: ReactNode;
};

export function AuroraActionButton({
  ariaLabel,
  tone,
  onClick,
  disabled,
  rings,
  children,
}: Props) {
  const hover = useHoverTone(tone);
  const handleClick = useBingClick<HTMLButtonElement>(onClick);
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        CUBE_ACTION_BASE,
        "group relative size-14 sm:size-16",
        disabled && "disabled:opacity-40 disabled:cursor-not-allowed",
      )}
      {...hover}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-[14px] transition-opacity duration-300 group-hover:opacity-70 motion-safe:group-hover:animate-aurora-spin"
        style={{ background: AURORA_GRADIENT }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-safe:group-hover:animate-aurora-spin"
        style={{ background: AURORA_GRADIENT }}
      />
      {rings}
      <span className="relative z-10 inline-flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {children}
      </span>
    </Button>
  );
}
