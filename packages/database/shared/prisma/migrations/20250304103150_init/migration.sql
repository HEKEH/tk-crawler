-- CreateTable
CREATE TABLE `Anchor` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `display_id` VARCHAR(24) NOT NULL,
    `room_id` BIGINT UNSIGNED NOT NULL,
    `region` CHAR(2) NOT NULL,
    `follower_count` INTEGER UNSIGNED NOT NULL,
    `audience_count` INTEGER UNSIGNED NULL,
    `current_diamonds` INTEGER UNSIGNED NOT NULL,
    `last_diamonds` INTEGER UNSIGNED NULL,
    `highest_diamonds` INTEGER UNSIGNED NOT NULL,
    `rank_league` CHAR(2) NULL,
    `level` TINYINT UNSIGNED NULL,
    `has_commerce_goods` BOOLEAN NULL,
    `tag` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Anchor_display_id_key`(`display_id`),
    INDEX `Anchor_region_idx`(`region`),
    INDEX `Anchor_follower_count_idx`(`follower_count`),
    INDEX `Anchor_highest_diamonds_idx`(`highest_diamonds`),
    INDEX `Anchor_rank_league_idx`(`rank_league`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LiveAdminUser` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(24) NOT NULL,
    `password` VARCHAR(128) NOT NULL,
    `org_id` BIGINT UNSIGNED NOT NULL,
    `status` TINYINT UNSIGNED NOT NULL,
    `max_query_per_hour` INTEGER UNSIGNED NULL DEFAULT 50,
    `max_query_per_day` INTEGER UNSIGNED NULL DEFAULT 280,
    `cookie` TEXT NULL,
    `is_cookie_valid` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LiveAdminUser_username_key`(`username`),
    INDEX `LiveAdminUser_org_id_idx`(`org_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LiveAdminUserRegionRelation` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `region` VARCHAR(2) NOT NULL,

    INDEX `LiveAdminUserRegionRelation_user_id_idx`(`user_id`),
    INDEX `LiveAdminUserRegionRelation_region_idx`(`region`),
    UNIQUE INDEX `LiveAdminUserRegionRelation_user_id_region_key`(`user_id`, `region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnchorInviteCheck` (
    `id` BIGINT UNSIGNED NOT NULL DEFAULT (uuid_short()),
    `org_id` BIGINT UNSIGNED NOT NULL,
    `anchor_id` BIGINT UNSIGNED NOT NULL,
    `checked_at` DATETIME(3) NOT NULL,
    `checked_by` BIGINT UNSIGNED NOT NULL,
    `checked_result` TINYINT UNSIGNED NOT NULL,
    `invite_type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `region` VARCHAR(2) NOT NULL,

    INDEX `AnchorInviteCheck_org_id_idx`(`org_id`),
    INDEX `AnchorInviteCheck_checked_result_idx`(`checked_result`),
    INDEX `AnchorInviteCheck_region_idx`(`region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` BIGINT UNSIGNED NOT NULL DEFAULT (uuid_short()),
    `name` VARCHAR(100) NOT NULL,
    `membership_start_at` DATETIME(3) NULL,
    `membership_expire_at` DATETIME(3) NULL,
    `status` TINYINT UNSIGNED NOT NULL,
    `remark` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrgUser` (
    `id` BIGINT UNSIGNED NOT NULL DEFAULT (uuid_short()),
    `org_id` BIGINT UNSIGNED NOT NULL,
    `username` VARCHAR(24) NOT NULL,
    `display_name` VARCHAR(24) NOT NULL,
    `password` VARCHAR(128) NOT NULL,
    `email` VARCHAR(50) NULL,
    `mobile` VARCHAR(20) NULL,
    `role_id` INTEGER UNSIGNED NOT NULL,
    `status` TINYINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrgUser_username_key`(`username`),
    UNIQUE INDEX `OrgUser_email_key`(`email`),
    UNIQUE INDEX `OrgUser_mobile_key`(`mobile`),
    INDEX `OrgUser_org_id_idx`(`org_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrgRegionRelation` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `org_id` BIGINT UNSIGNED NOT NULL,
    `region` VARCHAR(2) NOT NULL,

    INDEX `OrgRegionRelation_org_id_idx`(`org_id`),
    INDEX `OrgRegionRelation_region_idx`(`region`),
    UNIQUE INDEX `OrgRegionRelation_org_id_region_key`(`org_id`, `region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskAssign` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `org_id` BIGINT UNSIGNED NOT NULL,
    `anchor_id` BIGINT UNSIGNED NOT NULL,
    `org_user_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `TaskAssign_org_id_idx`(`org_id`),
    INDEX `TaskAssign_org_user_id_idx`(`org_user_id`),
    UNIQUE INDEX `TaskAssign_org_id_anchor_id_key`(`org_id`, `anchor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnchorConnect` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `org_id` BIGINT UNSIGNED NOT NULL,
    `anchor_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `AnchorConnect_org_id_idx`(`org_id`),
    INDEX `AnchorConnect_anchor_id_idx`(`anchor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LiveAdminUser` ADD CONSTRAINT `LiveAdminUser_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LiveAdminUserRegionRelation` ADD CONSTRAINT `LiveAdminUserRegionRelation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `LiveAdminUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_anchor_id_fkey` FOREIGN KEY (`anchor_id`) REFERENCES `Anchor`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_checked_by_fkey` FOREIGN KEY (`checked_by`) REFERENCES `LiveAdminUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrgUser` ADD CONSTRAINT `OrgUser_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrgRegionRelation` ADD CONSTRAINT `OrgRegionRelation_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskAssign` ADD CONSTRAINT `TaskAssign_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskAssign` ADD CONSTRAINT `TaskAssign_anchor_id_fkey` FOREIGN KEY (`anchor_id`) REFERENCES `Anchor`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskAssign` ADD CONSTRAINT `TaskAssign_org_user_id_fkey` FOREIGN KEY (`org_user_id`) REFERENCES `OrgUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorConnect` ADD CONSTRAINT `AnchorConnect_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorConnect` ADD CONSTRAINT `AnchorConnect_anchor_id_fkey` FOREIGN KEY (`anchor_id`) REFERENCES `Anchor`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
