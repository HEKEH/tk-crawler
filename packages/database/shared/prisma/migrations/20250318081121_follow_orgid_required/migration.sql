/*
  Warnings:

  - Made the column `org_id` on table `AnchorFollowGroup` required. This step will fail if there are existing NULL values in that column.
  - Made the column `org_id` on table `AnchorFrom87` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `AnchorFollowGroup` DROP FOREIGN KEY `AnchorFollowGroup_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorFrom87` DROP FOREIGN KEY `AnchorFrom87_org_id_fkey`;

-- AlterTable
ALTER TABLE `AnchorFollowGroup` MODIFY `org_id` BIGINT UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `AnchorFrom87` MODIFY `org_id` BIGINT UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `AnchorFrom87` ADD CONSTRAINT `AnchorFrom87_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorFollowGroup` ADD CONSTRAINT `AnchorFollowGroup_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
