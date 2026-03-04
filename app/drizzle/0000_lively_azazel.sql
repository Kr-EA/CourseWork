CREATE TABLE `Product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`units_bought_amount` integer NOT NULL,
	`units_amount` integer NOT NULL,
	`unit_capacity` text NOT NULL,
	`unit_bought_price` real GENERATED ALWAYS AS (bought_price * 1.0 / units_bought_amount) VIRTUAL,
	`bought_price` integer NOT NULL,
	`bought_date` integer NOT NULL,
	`expiration_date` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Sell` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sell_date` integer NOT NULL,
	`sell_price` integer GENERATED ALWAYS AS (sell_unit_price * amount) VIRTUAL,
	`sell_unit_price` real NOT NULL,
	`amount` integer NOT NULL,
	`product` integer,
	FOREIGN KEY (`product`) REFERENCES `Product`(`id`) ON UPDATE cascade ON DELETE cascade
);
