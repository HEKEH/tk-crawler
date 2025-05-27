-- AlterTable
ALTER TABLE `Organization` ADD COLUMN `owner_id` BIGINT UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `SystemAdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
