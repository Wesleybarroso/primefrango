CREATE TABLE `email_delivery_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email_provider` enum('resend','smtp') NOT NULL,
	`senderName` varchar(120) NOT NULL,
	`senderEmail` varchar(320) NOT NULL,
	`replyToEmail` varchar(320),
	`secretCiphertext` text NOT NULL,
	`maskedSecret` varchar(32) NOT NULL,
	`smtpHost` varchar(320),
	`smtpPort` int,
	`smtpUsernameCiphertext` text,
	`smtpUsernameMasked` varchar(64),
	`notificationsJson` text NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_delivery_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_delivery_settings_email_provider_unique` UNIQUE(`email_provider`)
);
