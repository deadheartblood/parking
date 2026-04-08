CREATE TABLE IF NOT EXISTS `parking_vehicles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner` VARCHAR(60) NOT NULL,
  `plate` VARCHAR(12) NOT NULL,
  `vehicle` LONGTEXT NOT NULL,
  `lot_id` VARCHAR(64) NOT NULL,
  `park_x` DOUBLE NOT NULL,
  `park_y` DOUBLE NOT NULL,
  `park_z` DOUBLE NOT NULL,
  `park_heading` FLOAT NOT NULL,
  `parked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner` (`owner`),
  KEY `lot_id` (`lot_id`),
  KEY `plate` (`plate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
