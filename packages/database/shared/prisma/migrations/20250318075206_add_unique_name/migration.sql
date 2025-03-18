/*
Warnings:

- You are about to drop the column `anchor_id` on the `AnchorFollowGroupRelation` table. All the data in the column will be lost.
- A unique constraint covering the columns `[group_id,anchor_table_id]` on the table `AnchorFollowGroupRelation` will be added. If there are existing duplicate values, this will fail.
- Added the required column `anchor_table_id` to the `AnchorFollowGroupRelation` table without a default value. This is not possible if the table is not empty.

 */
-- DropForeignKey
ALTER TABLE `AnchorFollowGroupRelation`
DROP FOREIGN KEY `AnchorFollowGroupRelation_anchor_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorFollowGroupRelation`
DROP FOREIGN KEY `AnchorFollowGroupRelation_group_id_fkey`;

-- DropIndex
DROP INDEX `AnchorFollowGroupRelation_anchor_id_idx` ON `AnchorFollowGroupRelation`;

-- DropIndex
DROP INDEX `AnchorFollowGroupRelation_group_id_anchor_id_key` ON `AnchorFollowGroupRelation`;

-- AlterTable
ALTER TABLE `AnchorFollowGroupRelation`
DROP COLUMN `anchor_id`,
ADD COLUMN `anchor_table_id` BIGINT UNSIGNED NOT NULL;

-- CreateIndex
CREATE INDEX `AnchorFollowGroupRelation_anchor_table_id_idx` ON `AnchorFollowGroupRelation` (`anchor_table_id`);

-- CreateIndex
CREATE UNIQUE INDEX `AnchorFollowGroupRelation_group_id_anchor_table_id_key` ON `AnchorFollowGroupRelation` (`group_id`, `anchor_table_id`);

-- AddForeignKey
-- ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_checked_by_fkey` FOREIGN KEY (`checked_by`) REFERENCES `LiveAdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE `AnchorFollowGroupRelation` ADD CONSTRAINT `AnchorFollowGroupRelation_anchor_table_id_fkey` FOREIGN KEY (`anchor_table_id`) REFERENCES `AnchorFrom87` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;