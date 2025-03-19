-- CreateTable
CREATE TABLE `AnchorCommentTemplateGroup` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `org_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `AnchorCommentTemplateGroup_org_id_idx`(`org_id`),
    UNIQUE INDEX `AnchorCommentTemplateGroup_org_id_name_key`(`org_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnchorCommentTemplate` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `org_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `label` VARCHAR(30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `AnchorCommentTemplate_group_id_idx`(`group_id`),
    INDEX `AnchorCommentTemplate_org_id_idx`(`org_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnchorCommentTemplateGroup` ADD CONSTRAINT `AnchorCommentTemplateGroup_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorCommentTemplate` ADD CONSTRAINT `AnchorCommentTemplate_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `AnchorCommentTemplateGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorCommentTemplate` ADD CONSTRAINT `AnchorCommentTemplate_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
