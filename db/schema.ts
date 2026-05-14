import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const teamGames = sqliteTable("team_games", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  creatorName: text("creator_name").notNull(),
  creatorClientId: text("creator_client_id").notNull(),
  targetsJson: text("targets_json").notNull(),
});

export const teamScores = sqliteTable(
  "team_scores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: text("game_id")
      .notNull()
      .references(() => teamGames.id),
    clientId: text("client_id").notNull(),
    name: text("name").notNull(),
    totalScore: real("total_score").notNull(),
    scoresJson: text("scores_json").notNull(),
    guessesJson: text("guesses_json").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    gameClientUnique: uniqueIndex("team_scores_game_client_unique").on(
      table.gameId,
      table.clientId,
    ),
    gameTotalIdx: index("team_scores_game_total_idx").on(
      table.gameId,
      sql`${table.totalScore} DESC`,
    ),
  }),
);

export const globalScores = sqliteTable(
  "global_scores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: text("client_id").notNull().unique(),
    name: text("name").notNull(),
    totalScore: real("total_score").notNull(),
    targetsJson: text("targets_json"),
    scoresJson: text("scores_json"),
    guessesJson: text("guesses_json"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    totalIdx: index("global_scores_total_idx").on(
      sql`${table.totalScore} DESC`,
    ),
  }),
);

export const soundTeamGames = sqliteTable("sound_team_games", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  creatorName: text("creator_name").notNull(),
  creatorClientId: text("creator_client_id").notNull(),
  targetsJson: text("targets_json").notNull(),
});

export const soundTeamScores = sqliteTable(
  "sound_team_scores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: text("game_id")
      .notNull()
      .references(() => soundTeamGames.id),
    clientId: text("client_id").notNull(),
    name: text("name").notNull(),
    totalScore: real("total_score").notNull(),
    scoresJson: text("scores_json").notNull(),
    guessesJson: text("guesses_json").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    gameClientUnique: uniqueIndex("sound_team_scores_game_client_unique").on(
      table.gameId,
      table.clientId,
    ),
    gameTotalIdx: index("sound_team_scores_game_total_idx").on(
      table.gameId,
      sql`${table.totalScore} DESC`,
    ),
  }),
);

export const soundGlobalScores = sqliteTable(
  "sound_global_scores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: text("client_id").notNull().unique(),
    name: text("name").notNull(),
    totalScore: real("total_score").notNull(),
    targetsJson: text("targets_json"),
    scoresJson: text("scores_json"),
    guessesJson: text("guesses_json"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    totalIdx: index("sound_global_scores_total_idx").on(
      sql`${table.totalScore} DESC`,
    ),
  }),
);

export const timeTeamGames = sqliteTable("time_team_games", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at").notNull(),
  creatorName: text("creator_name").notNull(),
  creatorClientId: text("creator_client_id").notNull(),
  targetsJson: text("targets_json").notNull(),
});

export const timeTeamScores = sqliteTable(
  "time_team_scores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: text("game_id")
      .notNull()
      .references(() => timeTeamGames.id),
    clientId: text("client_id").notNull(),
    name: text("name").notNull(),
    totalScore: real("total_score").notNull(),
    scoresJson: text("scores_json").notNull(),
    guessesJson: text("guesses_json").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    gameClientUnique: uniqueIndex("time_team_scores_game_client_unique").on(
      table.gameId,
      table.clientId,
    ),
    gameTotalIdx: index("time_team_scores_game_total_idx").on(
      table.gameId,
      sql`${table.totalScore} DESC`,
    ),
  }),
);

export const timeGlobalScores = sqliteTable(
  "time_global_scores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clientId: text("client_id").notNull().unique(),
    name: text("name").notNull(),
    totalScore: real("total_score").notNull(),
    targetsJson: text("targets_json"),
    scoresJson: text("scores_json"),
    guessesJson: text("guesses_json"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    totalIdx: index("time_global_scores_total_idx").on(
      sql`${table.totalScore} DESC`,
    ),
  }),
);
