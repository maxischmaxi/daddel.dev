import {
  centsBetween,
  formatHz,
  freqToSlider,
  SLIDER_MAX,
} from "./frequency";
import { type Sound } from "./game-state";

type Props = {
  index: number;
  target: Sound;
  guess: Sound;
  points: number;
};

const TRACK_BG =
  "linear-gradient(to top, hsl(220,90%,30%), hsl(190,90%,45%), hsl(50,90%,60%), hsl(0,85%,55%))";

export default function BreakdownItem({
  index,
  target,
  guess,
  points,
}: Props) {
  const targetRatio = freqToSlider(target.freq) / SLIDER_MAX;
  const guessRatio = freqToSlider(guess.freq) / SLIDER_MAX;
  const cents = centsBetween(target.freq, guess.freq);

  return (
    <li
      className="flex items-center gap-2 py-1 sm:gap-3 sm:py-1.5"
      aria-label={`Runde ${index + 1}: ${points.toFixed(3)} Punkte`}
    >
      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:w-6">
        {index + 1}.
      </span>
      <span className="w-11 shrink-0 text-xs font-semibold leading-none tabular-nums text-foreground sm:w-12 sm:text-sm">
        {points.toFixed(3)}
      </span>
      <div
        aria-hidden="true"
        className="relative h-8 w-2.5 shrink-0 overflow-hidden rounded-full sm:h-9"
        style={{ background: TRACK_BG }}
      >
        <span
          className="absolute left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.4)]"
          style={{ bottom: `${targetRatio * 100}%` }}
        />
        <span
          className="absolute left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_0_1.5px_rgba(0,0,0,0.4)]"
          style={{ bottom: `${guessRatio * 100}%` }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col text-[0.7rem] leading-tight text-muted-foreground sm:text-xs">
        <span className="tabular-nums">
          <span className="text-foreground">Ziel</span> {formatHz(target.freq)}
        </span>
        <span className="tabular-nums">
          <span className="text-foreground">Du</span> {formatHz(guess.freq)}
          <span className="text-muted-foreground/70">
            {" "}
            · {cents >= 0 ? "+" : ""}
            {Math.round(cents)} ct
          </span>
        </span>
      </div>
    </li>
  );
}
