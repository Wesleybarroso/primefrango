CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`badge` varchar(48),
	`startsAt` timestamp,
	`endsAt` timestamp,
	`promotion_status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`)
);
