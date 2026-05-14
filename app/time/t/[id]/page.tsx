import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import TimeGame from "@/app/time/time-game";
import { type TimeTarget } from "@/app/time/game-state";
import { getDb } from "@/db";
import { timeTeamGames } from "@/db/schema";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: dict.meta.teamTimeTitle,
    description: dict.meta.teamTimeDescription,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function TimeTeamGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const rows = await db
    .select({
      id: timeTeamGames.id,
      targetsJson: timeTeamGames.targetsJson,
    })
    .from(timeTeamGames)
    .where(eq(timeTeamGames.id, id))
    .limit(1);

  if (rows.length === 0) notFound();

  const targets = JSON.parse(rows[0].targetsJson) as TimeTarget[];

  return (
    <TimeGame mode="team-participant" gameId={id} initialTargets={targets} />
  );
}
