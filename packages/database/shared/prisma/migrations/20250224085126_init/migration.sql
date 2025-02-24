-- CreateTable
CREATE TABLE `Anchor` (
    `user_id` BIGINT NOT NULL,
    `display_id` VARCHAR(40) NOT NULL,
    `region` CHAR(2) NOT NULL,
    `follower_count` INTEGER UNSIGNED NOT NULL,
    `audience_count` INTEGER UNSIGNED NULL,
    `current_diamond` INTEGER UNSIGNED NOT NULL,
    `last_diamond` INTEGER UNSIGNED NULL,
    `highest_diamond` INTEGER UNSIGNED NOT NULL,
    `rank_league` CHAR(2) NULL,
    `level` TINYINT UNSIGNED NULL,
    `has_commerce_goods` BOOLEAN NULL,
    `tag` VARCHAR(20) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `Anchor_display_id_key`(`display_id`),
    INDEX `Anchor_region_idx`(`region`),
    INDEX `Anchor_follower_count_idx`(`follower_count`),
    INDEX `Anchor_highest_diamond_idx`(`highest_diamond`),
    INDEX `Anchor_rank_league_idx`(`rank_league`),
    INDEX `Anchor_level_idx`(`level`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
