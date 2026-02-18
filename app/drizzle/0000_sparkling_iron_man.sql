CREATE TABLE `Product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`units_amount` integer NOT NULL,
	`unit_capacity` integer NOT NULL,
	`bought_price` integer NOT NULL,
	`bought_date` integer NOT NULL,
	`expiration_date` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Sell` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sell_date` integer NOT NULL,
	`sell_price` integer NOT NULL,
	`product` integer,
	FOREIGN KEY (`product`) REFERENCES `Product`(`id`) ON UPDATE cascade ON DELETE cascade
);
