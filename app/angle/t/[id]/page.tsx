import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import AngleGame from "@/app/angle/angle-game";
import { type Angle } from "@/app/angle/game-state";
import { getDb } from "@/db";
import { angleTeamGames } from "@/db/schema";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: dict.meta.teamAngleTitle,
    description: dict.meta.teamAngleDescription,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function AngleTeamGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const rows = await db
    .select({
      id: angleTeamGames.id,
      targetsJson: angleTeamGames.targetsJson,
    })
    .from(angleTeamGames)
    .where(eq(angleTeamGames.id, id))
    .limit(1);

  if (rows.length === 0) notFound();

  const degs = JSON.parse(rows[0].targetsJson) as number[];
  const targets: Angle[] = degs.map((deg) => ({ deg }));

  return (
    <AngleGame mode="team-participant" gameId={id} initialTargets={targets} />
  );
}
