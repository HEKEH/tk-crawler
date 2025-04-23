-- AlterTable
ALTER TABLE `Organization` ADD COLUMN `mobile_device_limit` INTEGER UNSIGNED NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE `MobileDevice` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `device_id` BIGINT UNSIGNED NOT NULL,
    `device_name` VARCHAR(50) NOT NULL,
    `org_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `MobileDevice_org_id_idx`(`org_id`),
    UNIQUE INDEX `MobileDevice_org_id_device_id_key`(`org_id`, `device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MobileDevice` ADD CONSTRAINT `MobileDevice_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
