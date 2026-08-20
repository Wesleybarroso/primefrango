CREATE TABLE `integration_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`integration_provider` enum('stripe','mercado_pago','google_maps','whatsapp','email','assistant_ia') NOT NULL,
	`label` varchar(80) NOT NULL,
	`maskedSecret` varchar(32) NOT NULL,
	`secretCiphertext` text NOT NULL,
	`webhookUrl` varchar(2048),
	`webhookCiphertext` text,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integration_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `integration_settings_integration_provider_unique` UNIQUE(`integration_provider`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
