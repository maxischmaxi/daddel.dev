"use client";

import { ChevronRight } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sanitizeName } from "@/lib/player";

import { CUBE_ACTION_BASE } from "./shared-styles";

export type NameEntryProps = {
  onConfirm: (name: string) => void;
  initial?: string;
  title?: string;
  hint?: string;
};

export function NameEntry({
  onConfirm,
  initial = "",
  title = "Wie heißt du?",
  hint = "Der Name wird gespeichert und in der Rangliste angezeigt.",
}: NameEntryProps) {
  const [value, setValue] = useState(initial);
  const clean = sanitizeName(value);
  const canSubmit = clean.length > 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(clean);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col px-6 pb-2"
      autoComplete="off"
    >
      <div className="flex flex-1 min-h-0 flex-col items-start justify-center gap-3">
        <h2 className="m-0 text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
        <p className="m-0 text-sm text-white/85">{hint}</p>
        <input
          autoFocus
          type="text"
          inputMode="text"
          maxLength={32}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Dein Name"
          aria-label="Dein Name"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-form-type="other"
          className="mt-6 w-full border-0 bg-transparent px-0 py-2 text-4xl font-bold tracking-tight text-white caret-white placeholder:font-bold placeholder:text-white/25 focus:outline-none focus:ring-0 selection:bg-white/20"
        />
      </div>
      <div className="mt-auto flex items-center justify-end pt-3">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Bestätigen"
          disabled={!canSubmit}
          className={cn(
            CUBE_ACTION_BASE,
            "size-13 disabled:opacity-40 disabled:cursor-not-allowed",
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
