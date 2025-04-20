/*
  Warnings:

  - You are about to drop the column `is_finished` on the `AnchorInviteCheck` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `AnchorInviteCheck` DROP COLUMN `is_finished`,
    ADD COLUMN `contacted_by` BIGINT UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_contacted_by_fkey` FOREIGN KEY (`contacted_by`) REFERENCES `OrgUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
