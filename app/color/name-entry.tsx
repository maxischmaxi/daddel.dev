"use client";

import { ChevronRight } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { useDict } from "@/lib/i18n/use-t";
import { cn } from "@/lib/utils";
import { sanitizeName } from "@/lib/player";

import { CUBE_ACTION_BASE } from "./shared-styles";
import { useClickTone } from "./use-click-tone";

export type NameEntryProps = {
  onConfirm: (name: string) => void;
  initial?: string;
  title?: string;
  hint?: string;
};

export function NameEntry({
  onConfirm,
  initial = "",
  title,
  hint,
}: NameEntryProps) {
  const dict = useDict();
  const resolvedTitle = title ?? dict.nameEntry.soloTitle;
  const resolvedHint = hint ?? dict.nameEntry.soloHint;
  const [value, setValue] = useState(initial);
  const playClickTone = useClickTone();
  const clean = sanitizeName(value);
  const canSubmit = clean.length > 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    playClickTone();
    onConfirm(clean);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col px-4 pb-1 sm:px-6 sm:pb-2"
      autoComplete="off"
    >
      <div className="flex flex-1 min-h-0 flex-col items-start justify-center gap-2 sm:gap-3">
        <h2 className="m-0 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {resolvedTitle}
        </h2>
        <p className="m-0 text-sm leading-snug text-white/85">{resolvedHint}</p>
        <input
          autoFocus
          type="text"
          inputMode="text"
          maxLength={32}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={dict.nameEntry.placeholder}
          aria-label={dict.common.yourName}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          className="mt-4 w-full border-0 bg-transparent px-0 py-2 text-3xl font-bold tracking-tight text-white caret-white placeholder:font-bold placeholder:text-white/25 focus:outline-none focus:ring-0 selection:bg-white/20 sm:mt-6 sm:text-4xl"
        />
      </div>
      <div className="mt-auto flex items-center justify-end pt-3">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label={dict.common.confirm}
          disabled={!canSubmit}
          className={cn(
            CUBE_ACTION_BASE,
            "size-12 disabled:opacity-40 disabled:cursor-not-allowed sm:size-13",
          )}
        >
          <ChevronRight
            aria-hidden="true"
            strokeWidth={2.5}
            style={{ width: 22, height: 22 }}
          />
        </Button>
      </div>
    </form>
  );
}
