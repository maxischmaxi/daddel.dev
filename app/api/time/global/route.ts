import { desc, eq, gt, lt, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { timeGlobalScores } from "@/db/schema";
import {
  jsonError,
  parseClientId,
  parseDurationArray,
  parseName,
  parseScoresArray,
  parseTimeTargetArray,
  parseTotal,
  ValidationError,
} from "@/lib/api-validation";

import type {
  TimeGlobalRanking,
  TimeRankingEntry,
} from "@/lib/api-client";
import type { TimeTarget } from "@/app/time/game-state";

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

function safeTargetArray(raw: string | null): TimeTarget[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TimeTarget[]) : undefined;
  } catch {
    return undefined;
  }
}

async function buildRanking(
  clientId: string | null,
): Promise<TimeGlobalRanking> {
  const db = await getDb();

  const top = await db
    .select({
      name: timeGlobalScores.name,
      totalScore: timeGlobalScores.totalScore,
      clientId: timeGlobalScores.clientId,
      targetsJson: timeGlobalScores.targetsJson,
      scoresJson: timeGlobalScores.scoresJson,
      guessesJson: timeGlobalScores.guessesJson,
    })
    .from(timeGlobalScores)
    .orderBy(desc(timeGlobalScores.totalScore))
    .limit(10);

  const totalRow = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(timeGlobalScores);
  const total = Number(totalRow[0]?.count ?? 0);

  const topRanked: TimeRankingEntry[] = top.map((row, i) => ({
    name: row.name,
    totalScore: row.totalScore,
    clientId: row.clientId,
    rank: i + 1,
    scores: safeNumberArray(row.scoresJson),
    guesses: safeNumberArray(row.guessesJson),
    targets: safeTargetArray(row.targetsJson),
  }));

  let you: TimeGlobalRanking["you"] = null;
  const neighbors: TimeGlobalRanking["neighbors"] = {};

  if (clientId) {
    const mine = await db
      .select()
      .from(timeGlobalScores)
      .where(eq(timeGlobalScores.clientId, clientId))
      .limit(1);
    if (mine.length > 0) {
      const me = mine[0];
      const higher = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(timeGlobalScores)
        .where(gt(timeGlobalScores.totalScore, me.totalScore));
      const rank = Number(higher[0]?.count ?? 0) + 1;
      you = {
        rank,
        name: me.name,
        totalScore: me.totalScore,
        scores: safeNumberArray(me.scoresJson),
        guesses: safeNumberArray(me.guessesJson),
        targets: safeTargetArray(me.targetsJson),
      };

      const aboveRow = await db
        .select({
          name: timeGlobalScores.name,
          totalScore: timeGlobalScores.totalScore,
          clientId: timeGlobalScores.clientId,
          targetsJson: timeGlobalScores.targetsJson,
          scoresJson: timeGlobalScores.scoresJson,
          guessesJson: timeGlobalScores.guessesJson,
        })
        .from(timeGlobalScores)
        .where(gt(timeGlobalScores.totalScore, me.totalScore))
        .orderBy(timeGlobalScores.totalScore)
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
          targets: safeTargetArray(a.targetsJson),
        };
      }
      const belowRow = await db
        .select({
          name: timeGlobalScores.name,
          totalScore: timeGlobalScores.totalScore,
          clientId: timeGlobalScores.clientId,
          targetsJson: timeGlobalScores.targetsJson,
          scoresJson: timeGlobalScores.scoresJson,
          guessesJson: timeGlobalScores.guessesJson,
        })
        .from(timeGlobalScores)
        .where(lt(timeGlobalScores.totalScore, me.totalScore))
        .orderBy(desc(timeGlobalScores.totalScore))
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
          targets: safeTargetArray(b.targetsJson),
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
    console.error("GET /api/time/global failed", e);
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
  let targets: TimeTarget[];
  let scores: number[];
  let guesses: number[];
  try {
    const o = body as Record<string, unknown>;
    name = parseName(o.name);
    clientId = parseClientId(o.clientId);
    total = parseTotal(o.total);
    targets = parseTimeTargetArray(o.targets, 5);
    scores = parseScoresArray(o.scores, 5);
    guesses = parseDurationArray(o.guesses, 5);
  } catch (e) {
    if (e instanceof ValidationError) return jsonError(e.message, 400);
    return jsonError("invalid body", 400);
  }

  try {
    const db = await getDb();
    const now = Date.now();
    await db
      .insert(timeGlobalScores)
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
        target: timeGlobalScores.clientId,
        set: {
          name: sql`excluded.name`,
          totalScore: sql`MAX(${timeGlobalScores.totalScore}, excluded.total_score)`,
          targetsJson: sql`CASE WHEN excluded.total_score > ${timeGlobalScores.totalScore} THEN excluded.targets_json ELSE ${timeGlobalScores.targetsJson} END`,
          scoresJson: sql`CASE WHEN excluded.total_score > ${timeGlobalScores.totalScore} THEN excluded.scores_json ELSE ${timeGlobalScores.scoresJson} END`,
          guessesJson: sql`CASE WHEN excluded.total_score > ${timeGlobalScores.totalScore} THEN excluded.guesses_json ELSE ${timeGlobalScores.guessesJson} END`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    const ranking = await buildRanking(clientId);
    return Response.json(ranking);
  } catch (e) {
    console.error("POST /api/time/global failed", e);
    return jsonError("internal", 500);
  }
}
