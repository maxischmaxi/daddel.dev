import { type Color, hslCss } from "./game-state";

type Props = {
  index: number;
  target: Color;
  guess: Color;
  points: number;
};

export default function BreakdownItem({
  index,
  target,
  guess,
  points,
}: Props) {
  return (
    <li className="flex items-center justify-between border-b border-border px-1 py-[0.45rem] text-muted-foreground">
      <span>Runde {index + 1}</span>
      <span className="flex gap-1">
        <span
          className="size-4 rounded-[0.25rem] border border-border"
          style={{ background: hslCss(target.h, target.s, target.l) }}
        />
        <span
          className="size-4 rounded-[0.25rem] border border-border"
          style={{ background: hslCss(guess.h, guess.s, guess.l) }}
        />
      </span>
      <span className="min-w-[6.5ch] text-right font-semibold tabular-nums text-foreground">
        {points.toFixed(2)} / 10.00
      </span>
    </li>
  );
}
