"use client";

import type { ReactNode } from "react";

type Props = {
  label: string;
  totalScore: number;
  subInfo?: ReactNode;
  statusBlock?: ReactNode;
  children?: ReactNode;
  leftAction: ReactNode;
  rightAction: ReactNode;
};

export function FinalCard({
  label,
  totalScore,
  subInfo,
  statusBlock,
  children,
  leftAction,
  rightAction,
}: Props) {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 px-5">
      <div className="flex flex-col items-center gap-0.5">
        <h2 className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          {label}
        </h2>
        <div className="flex items-baseline gap-1.5">
          <span className="text-5xl font-bold leading-none tracking-tight tabular-nums text-white">
            {totalScore.toFixed(3)}
          </span>
          <span className="text-base font-medium tabular-nums text-white/60">
            / 50
          </span>
        </div>
        {subInfo}
      </div>

      {statusBlock}

      {children}

      <div className="mt-auto flex items-center justify-between pt-1">
        {leftAction}
        {rightAction}
      </div>
    </div>
  );
}
