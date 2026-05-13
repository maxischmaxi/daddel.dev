CREATE TABLE `global_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`total_score` real NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `global_scores_client_id_unique` ON `global_scores` (`client_id`);--> statement-breakpoint
CREATE INDEX `global_scores_total_idx` ON `global_scores` ("total_score" DESC);--> statement-breakpoint
CREATE TABLE `team_games` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`creator_name` text NOT NULL,
	`creator_client_id` text NOT NULL,
	`targets_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `team_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`client_id` text NOT NULL,
	`name` text NOT NULL,
	`total_score` real NOT NULL,
	`scores_json` text NOT NULL,
	`guesses_json` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `team_games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_scores_game_client_unique` ON `team_scores` (`game_id`,`client_id`);--> statement-breakpoint
CREATE INDEX `team_scores_game_total_idx` ON `team_scores` (`game_id`,"total_score" DESC);