/*
  Warnings:

  - You are about to drop the `LiveAdminUserAreaRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `LiveAdminUserAreaRelation` DROP FOREIGN KEY `LiveAdminUserAreaRelation_user_id_fkey`;

-- AlterTable
ALTER TABLE `LiveAdminUser` ADD COLUMN `area` VARCHAR(6) NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `LiveAdminUserAreaRelation`;
