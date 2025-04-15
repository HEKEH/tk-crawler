/*
  Warnings:

  - You are about to drop the `AnchorFollowGroupRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AnchorFollowGroupRelation` DROP FOREIGN KEY `AnchorFollowGroupRelation_anchor_table_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorFollowGroupRelation` DROP FOREIGN KEY `AnchorFollowGroupRelation_group_id_fkey`;

-- AlterTable
ALTER TABLE `AnchorFrom87` ADD COLUMN `group_id` BIGINT UNSIGNED NULL;

-- DropTable
DROP TABLE `AnchorFollowGroupRelation`;

-- AddForeignKey
ALTER TABLE `AnchorFrom87` ADD CONSTRAINT `AnchorFrom87_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `AnchorFollowGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
