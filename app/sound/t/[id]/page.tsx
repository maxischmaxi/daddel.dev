import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import SoundGame from "@/app/sound/sound-game";
import { type Sound } from "@/app/sound/game-state";
import { getDb } from "@/db";
import { soundTeamGames } from "@/db/schema";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: dict.meta.teamSoundTitle,
    description: dict.meta.teamSoundDescription,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function SoundTeamGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const rows = await db
    .select({
      id: soundTeamGames.id,
      targetsJson: soundTeamGames.targetsJson,
    })
    .from(soundTeamGames)
    .where(eq(soundTeamGames.id, id))
    .limit(1);

  if (rows.length === 0) notFound();

  const freqs = JSON.parse(rows[0].targetsJson) as number[];
  const targets: Sound[] = freqs.map((freq) => ({ freq }));

  return (
    <SoundGame mode="team-participant" gameId={id} initialTargets={targets} />
  );
}
