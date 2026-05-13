import { desc, eq, gt, lt, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { globalScores } from "@/db/schema";
import {
  jsonError,
  parseClientId,
  parseColorArray,
  parseName,
  ValidationError,
} from "@/lib/api-validation";

import { scoreRound, type Color } from "@/app/color/game-state";
import type { GlobalRanking, RankingEntry } from "@/lib/api-client";

function computeScores(
  targets: Color[],
  guesses: Color[],
): { scores: number[]; total: number } {
  const scores = targets.map((t, i) => scoreRound(t, guesses[i]));
  const total = scores.reduce((a, b) => a + b, 0);
  return { scores, total };
}

export const dynamic = "force-dynamic";

function safeColorArray(raw: string | null): Color[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Color[]) : undefined;
  } catch {
    return undefined;
  }
}

function safeNumberArray(raw: string | null): number[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as number[]) : undefined;
  } catch {
    return undefined;
  }
}

async function buildRanking(clientId: string | null): Promise<GlobalRanking> {
  const db = await getDb();

  const top = await db
    .select({
      name: globalScores.name,
      totalScore: globalScores.totalScore,
      clientId: globalScores.clientId,
      targetsJson: globalScores.targetsJson,
      scoresJson: globalScores.scoresJson,
      guessesJson: globalScores.guessesJson,
    })
    .from(globalScores)
    .orderBy(desc(globalScores.totalScore))
    .limit(10);

  const totalRow = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(globalScores);
  const total = Number(totalRow[0]?.count ?? 0);

  const topRanked: RankingEntry[] = top.map((row, i) => ({
    name: row.name,
    totalScore: row.totalScore,
    clientId: row.clientId,
    rank: i + 1,
    scores: safeNumberArray(row.scoresJson),
    guesses: safeColorArray(row.guessesJson),
    targets: safeColorArray(row.targetsJson),
  }));

  let you: GlobalRanking["you"] = null;
  const neighbors: GlobalRanking["neighbors"] = {};

  if (clientId) {
    const mine = await db
      .select()
      .from(globalScores)
      .where(eq(globalScores.clientId, clientId))
      .limit(1);
    if (mine.length > 0) {
      const me = mine[0];
      const higher = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(globalScores)
        .where(gt(globalScores.totalScore, me.totalScore));
      const rank = Number(higher[0]?.count ?? 0) + 1;
      you = {
        rank,
        name: me.name,
        totalScore: me.totalScore,
        scores: safeNumberArray(me.scoresJson),
        guesses: safeColorArray(me.guessesJson),
        targets: safeColorArray(me.targetsJson),
      };

      const aboveRow = await db
        .select({
          name: globalScores.name,
          totalScore: globalScores.totalScore,
          clientId: globalScores.clientId,
          targetsJson: globalScores.targetsJson,
          scoresJson: globalScores.scoresJson,
          guessesJson: globalScores.guessesJson,
        })
        .from(globalScores)
        .where(gt(globalScores.totalScore, me.totalScore))
        .orderBy(globalScores.totalScore)
        .limit(1);
      if (aboveRow.length > 0) {
        const a = aboveRow[0];
        neighbors.above = {
          name: a.name,
          totalScore: a.totalScore,
          clientId: a.clientId,
          rank: rank - 1,
          scores: safeNumberArray(a.scoresJson),
          guesses: safeColorArray(a.guessesJson),
          targets: safeColorArray(a.targetsJson),
        };
      }
      const belowRow = await db
        .select({
          name: globalScores.name,
          totalScore: globalScores.totalScore,
          clientId: globalScores.clientId,
          targetsJson: globalScores.targetsJson,
          scoresJson: globalScores.scoresJson,
          guessesJson: globalScores.guessesJson,
        })
        .from(globalScores)
        .where(lt(globalScores.totalScore, me.totalScore))
        .orderBy(desc(globalScores.totalScore))
        .limit(1);
      if (belowRow.length > 0) {
        const b = belowRow[0];
        neighbors.below = {
          name: b.name,
          totalScore: b.totalScore,
          clientId: b.clientId,
          rank: rank + 1,
          scores: safeNumberArray(b.scoresJson),
          guesses: safeColorArray(b.guessesJson),
          targets: safeColorArray(b.targetsJson),
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
    console.error("GET /api/global failed", e);
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
  let targets: Color[];
  let guesses: Color[];
  try {
    const o = body as Record<string, unknown>;
    name = parseName(o.name);
    clientId = parseClientId(o.clientId);
    targets = parseColorArray(o.targets, 5);
    guesses = parseColorArray(o.guesses, 5);
  } catch (e) {
    if (e instanceof ValidationError) return jsonError(e.message, 400);
    return jsonError("invalid body", 400);
  }

  const { scores, total } = computeScores(targets, guesses);

  try {
    const db = await getDb();
    const now = Date.now();
    await db
      .insert(globalScores)
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
        target: globalScores.clientId,
        set: {
          name: sql`excluded.name`,
          totalScore: sql`MAX(${globalScores.totalScore}, excluded.total_score)`,
          targetsJson: sql`CASE WHEN excluded.total_score > ${globalScores.totalScore} THEN excluded.targets_json ELSE ${globalScores.targetsJson} END`,
          scoresJson: sql`CASE WHEN excluded.total_score > ${globalScores.totalScore} THEN excluded.scores_json ELSE ${globalScores.scoresJson} END`,
          guessesJson: sql`CASE WHEN excluded.total_score > ${globalScores.totalScore} THEN excluded.guesses_json ELSE ${globalScores.guessesJson} END`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    const ranking = await buildRanking(clientId);
    return Response.json(ranking);
  } catch (e) {
    console.error("POST /api/global failed", e);
    return jsonError("internal", 500);
  }
}
