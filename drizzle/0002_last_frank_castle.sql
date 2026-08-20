ALTER TABLE `promotions` ADD `originalPriceCents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `promotions` ADD `salePriceCents` int;--> statement-breakpoint
ALTER TABLE `promotions` ADD `image1Url` varchar(2048);--> statement-breakpoint
ALTER TABLE `promotions` ADD `image2Url` varchar(2048);--> statement-breakpoint
ALTER TABLE `promotions` ADD `image3Url` varchar(2048);