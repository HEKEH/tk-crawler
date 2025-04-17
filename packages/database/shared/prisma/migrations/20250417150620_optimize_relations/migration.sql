/*
  Warnings:

  - You are about to drop the `AnchorConnect` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskAssign` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AnchorConnect` DROP FOREIGN KEY `AnchorConnect_anchor_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorConnect` DROP FOREIGN KEY `AnchorConnect_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorFrom87` DROP FOREIGN KEY `AnchorFrom87_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorInviteCheck` DROP FOREIGN KEY `AnchorInviteCheck_checked_by_fkey`;

-- DropForeignKey
ALTER TABLE `TaskAssign` DROP FOREIGN KEY `TaskAssign_anchor_id_fkey`;

-- DropForeignKey
ALTER TABLE `TaskAssign` DROP FOREIGN KEY `TaskAssign_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `TaskAssign` DROP FOREIGN KEY `TaskAssign_org_user_id_fkey`;

-- DropIndex
DROP INDEX `AnchorInviteCheck_checked_by_fkey` ON `AnchorInviteCheck`;

-- AlterTable
ALTER TABLE `AnchorInviteCheck` ADD COLUMN `assign_to` BIGINT UNSIGNED NULL,
    ADD COLUMN `is_finished` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `checked_by` BIGINT UNSIGNED NULL;

-- DropTable
DROP TABLE `AnchorConnect`;

-- DropTable
DROP TABLE `TaskAssign`;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_assign_to_fkey` FOREIGN KEY (`assign_to`) REFERENCES `OrgUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_checked_by_fkey` FOREIGN KEY (`checked_by`) REFERENCES `LiveAdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorFrom87` ADD CONSTRAINT `AnchorFrom87_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `AnchorFollowGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
