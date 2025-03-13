-- CreateTable
CREATE TABLE `AnchorFrom87` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `account_id` BIGINT UNSIGNED NOT NULL,
    `account` VARCHAR(30) NOT NULL,
    `day_diamond_val` INTEGER NOT NULL DEFAULT 0,
    `last_day_diamond_val` INTEGER NOT NULL DEFAULT 0,
    `his_max_diamond_val` INTEGER NOT NULL DEFAULT 0,
    `available` TINYINT UNSIGNED NOT NULL,
    `available_reason` VARCHAR(191) NULL,
    `status` TINYINT UNSIGNED NOT NULL,
    `country` VARCHAR(10) NULL,
    `country_code` VARCHAR(2) NULL,
    `follower_count` INTEGER NOT NULL DEFAULT 0,
    `tag_title` VARCHAR(10) NULL,
    `canuse_invitation_type` TINYINT UNSIGNED NOT NULL,
    `pieces` VARCHAR(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AnchorFrom87_account_id_key`(`account_id`),
    UNIQUE INDEX `AnchorFrom87_account_key`(`account`),
    INDEX `AnchorFrom87_account_idx`(`account`),
    INDEX `AnchorFrom87_account_id_idx`(`account_id`),
    INDEX `AnchorFrom87_country_code_idx`(`country_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnchorFollowGroup` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnchorFollowGroupRelation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `anchor_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `AnchorFollowGroupRelation_anchor_id_idx`(`anchor_id`),
    INDEX `AnchorFollowGroupRelation_group_id_idx`(`group_id`),
    UNIQUE INDEX `AnchorFollowGroupRelation_group_id_anchor_id_key`(`group_id`, `anchor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnchorFollowGroupRelation` ADD CONSTRAINT `AnchorFollowGroupRelation_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `AnchorFollowGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorFollowGroupRelation` ADD CONSTRAINT `AnchorFollowGroupRelation_anchor_id_fkey` FOREIGN KEY (`anchor_id`) REFERENCES `AnchorFrom87`(`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;
