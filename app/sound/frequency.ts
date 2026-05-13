export const MIN_HZ = 110;
export const OCTAVES = 4;
export const MAX_HZ = MIN_HZ * 2 ** OCTAVES;

export const SLIDER_MAX = 1000;

export const CENTS_ZERO_POINT = 1200;

export const sliderToFreq = (slider: number): number => {
  const clamped = Math.max(0, Math.min(SLIDER_MAX, slider));
  return MIN_HZ * Math.pow(MAX_HZ / MIN_HZ, clamped / SLIDER_MAX);
};

export const freqToSlider = (freq: number): number => {
  if (freq <= 0) return 0;
  return Math.round(
    (SLIDER_MAX * Math.log(freq / MIN_HZ)) / Math.log(MAX_HZ / MIN_HZ),
  );
};

export const centsBetween = (targetHz: number, guessHz: number): number =>
  1200 * Math.log2(guessHz / targetHz);

export const randomTargetHz = (): number =>
  MIN_HZ * Math.pow(MAX_HZ / MIN_HZ, Math.random());

export const scoreFromFrequencies = (
  targetHz: number,
  guessHz: number,
): number => {
  const cents = Math.abs(centsBetween(targetHz, guessHz));
  return Math.max(0, 10 * (1 - cents / CENTS_ZERO_POINT));
};

export const formatHz = (hz: number): string =>
  hz >= 1000 ? `${(hz / 1000).toFixed(2)} kHz` : `${Math.round(hz)} Hz`;
