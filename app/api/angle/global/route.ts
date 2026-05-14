import { desc, eq, gt, lt, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { angleGlobalScores } from "@/db/schema";
import {
  jsonError,
  parseAngleArray,
  parseClientId,
  parseName,
  parseScoresArray,
  parseTotal,
  ValidationError,
} from "@/lib/api-validation";

import type {
  AngleGlobalRanking,
  AngleRankingEntry,
} from "@/lib/api-client";

export const dynamic = "force-dynamic";

function safeNumberArray(raw: string | null): number[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as number[]) : undefined;
  } catch {
    return undefined;
  }
}

async function buildRanking(
  clientId: string | null,
): Promise<AngleGlobalRanking> {
  const db = await getDb();

  const top = await db
    .select({
      name: angleGlobalScores.name,
      totalScore: angleGlobalScores.totalScore,
      clientId: angleGlobalScores.clientId,
      targetsJson: angleGlobalScores.targetsJson,
      scoresJson: angleGlobalScores.scoresJson,
      guessesJson: angleGlobalScores.guessesJson,
    })
    .from(angleGlobalScores)
    .orderBy(desc(angleGlobalScores.totalScore))
    .limit(10);

  const totalRow = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(angleGlobalScores);
  const total = Number(totalRow[0]?.count ?? 0);

  const topRanked: AngleRankingEntry[] = top.map((row, i) => ({
    name: row.name,
    totalScore: row.totalScore,
    clientId: row.clientId,
    rank: i + 1,
    scores: safeNumberArray(row.scoresJson),
    guesses: safeNumberArray(row.guessesJson),
    targets: safeNumberArray(row.targetsJson),
  }));

  let you: AngleGlobalRanking["you"] = null;
  const neighbors: AngleGlobalRanking["neighbors"] = {};

  if (clientId) {
    const mine = await db
      .select()
      .from(angleGlobalScores)
      .where(eq(angleGlobalScores.clientId, clientId))
      .limit(1);
    if (mine.length > 0) {
      const me = mine[0];
      const higher = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(angleGlobalScores)
        .where(gt(angleGlobalScores.totalScore, me.totalScore));
      const rank = Number(higher[0]?.count ?? 0) + 1;
      you = {
        rank,
        name: me.name,
        totalScore: me.totalScore,
        scores: safeNumberArray(me.scoresJson),
        guesses: safeNumberArray(me.guessesJson),
        targets: safeNumberArray(me.targetsJson),
      };

      const aboveRow = await db
        .select({
          name: angleGlobalScores.name,
          totalScore: angleGlobalScores.totalScore,
          clientId: angleGlobalScores.clientId,
          targetsJson: angleGlobalScores.targetsJson,
          scoresJson: angleGlobalScores.scoresJson,
          guessesJson: angleGlobalScores.guessesJson,
        })
        .from(angleGlobalScores)
        .where(gt(angleGlobalScores.totalScore, me.totalScore))
        .orderBy(angleGlobalScores.totalScore)
        .limit(1);
      if (aboveRow.length > 0) {
        const a = aboveRow[0];
        neighbors.above = {
          name: a.name,
          totalScore: a.totalScore,
          clientId: a.clientId,
          rank: rank - 1,
          scores: safeNumberArray(a.scoresJson),
          guesses: safeNumberArray(a.guessesJson),
          targets: safeNumberArray(a.targetsJson),
        };
      }
      const belowRow = await db
        .select({
          name: angleGlobalScores.name,
          totalScore: angleGlobalScores.totalScore,
          clientId: angleGlobalScores.clientId,
          targetsJson: angleGlobalScores.targetsJson,
          scoresJson: angleGlobalScores.scoresJson,
          guessesJson: angleGlobalScores.guessesJson,
        })
        .from(angleGlobalScores)
        .where(lt(angleGlobalScores.totalScore, me.totalScore))
        .orderBy(desc(angleGlobalScores.totalScore))
        .limit(1);
      if (belowRow.length > 0) {
        const b = belowRow[0];
        neighbors.below = {
          name: b.name,
          totalScore: b.totalScore,
          clientId: b.clientId,
          rank: rank + 1,
          scores: safeNumberArray(b.scoresJson),
          guesses: safeNumberArray(b.guessesJson),
          targets: safeNumberArray(b.targetsJson),
        };
      }
    }
  }

  return { top: topRanked, you, neighbors, total };
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");
  try {
    const ranking = await buildRanking(
      clientId && clientId.length > 0 ? clientId : null,
    );
    return Response.json(ranking);
  } catch (e) {
    console.error("GET /api/angle/global failed", e);
    return jsonError("internal", 500);
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("invalid json", 400);
  }

  let name: string;
  let clientId: string;
  let total: number;
  let targets: number[];
  let scores: number[];
  let guesses: number[];
  try {
    const o = body as Record<string, unknown>;
    name = parseName(o.name);
    clientId = parseClientId(o.clientId);
    total = parseTotal(o.total);
    targets = parseAngleArray(o.targets, 5);
    scores = parseScoresArray(o.scores, 5);
    guesses = parseAngleArray(o.guesses, 5);
  } catch (e) {
    if (e instanceof ValidationError) return jsonError(e.message, 400);
    return jsonError("invalid body", 400);
  }

  try {
    const db = await getDb();
    const now = Date.now();
    await db
      .insert(angleGlobalScores)
      .values({
        clientId,
        name,
        totalScore: total,
        targetsJson: JSON.stringify(targets),
        scoresJson: JSON.stringify(scores),
        guessesJson: JSON.stringify(guesses),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: angleGlobalScores.clientId,
        set: {
          name: sql`excluded.name`,
          totalScore: sql`MAX(${angleGlobalScores.totalScore}, excluded.total_score)`,
          targetsJson: sql`CASE WHEN excluded.total_score > ${angleGlobalScores.totalScore} THEN excluded.targets_json ELSE ${angleGlobalScores.targetsJson} END`,
          scoresJson: sql`CASE WHEN excluded.total_score > ${angleGlobalScores.totalScore} THEN excluded.scores_json ELSE ${angleGlobalScores.scoresJson} END`,
          guessesJson: sql`CASE WHEN excluded.total_score > ${angleGlobalScores.totalScore} THEN excluded.guesses_json ELSE ${angleGlobalScores.guessesJson} END`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    const ranking = await buildRanking(clientId);
    return Response.json(ranking);
  } catch (e) {
    console.error("POST /api/angle/global failed", e);
    return jsonError("internal", 500);
  }
}
