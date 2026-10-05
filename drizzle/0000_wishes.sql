CREATE TABLE `wishes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `request_id` text NOT NULL,
  `content` text NOT NULL,
  `day` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishes_request_id_unique` ON `wishes` (`request_id`);
