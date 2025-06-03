/*
  Warnings:

  - You are about to drop the column `discount` on the `SystemAdminUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SystemAdminUser` DROP COLUMN `discount`,
    ADD COLUMN `base_price` INTEGER UNSIGNED NOT NULL DEFAULT 1000,
    ADD COLUMN `follow_price` INTEGER UNSIGNED NOT NULL DEFAULT 200;
