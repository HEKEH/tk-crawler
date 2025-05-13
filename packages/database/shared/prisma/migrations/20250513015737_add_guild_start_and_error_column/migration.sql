-- AlterTable
ALTER TABLE `LiveAdminUser` ADD COLUMN `error_at` DATETIME(3) NULL,
    ADD COLUMN `started_at` DATETIME(3) NULL;
