-- AlterTable
ALTER TABLE `LiveAdminUser` ADD COLUMN `faction_id` INTEGER UNSIGNED NULL;

-- CreateTable
CREATE TABLE `LiveAdminUserAreaRelation` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `area` VARCHAR(6) NOT NULL,

    INDEX `LiveAdminUserAreaRelation_user_id_idx`(`user_id`),
    INDEX `LiveAdminUserAreaRelation_area_idx`(`area`),
    UNIQUE INDEX `LiveAdminUserAreaRelation_user_id_area_key`(`user_id`, `area`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrgAreaRelation` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `org_id` BIGINT UNSIGNED NOT NULL,
    `area` VARCHAR(6) NOT NULL,

    INDEX `OrgAreaRelation_org_id_idx`(`org_id`),
    INDEX `OrgAreaRelation_area_idx`(`area`),
    UNIQUE INDEX `OrgAreaRelation_org_id_area_key`(`org_id`, `area`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LiveAdminUserAreaRelation` ADD CONSTRAINT `LiveAdminUserAreaRelation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `LiveAdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrgAreaRelation` ADD CONSTRAINT `OrgAreaRelation_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
