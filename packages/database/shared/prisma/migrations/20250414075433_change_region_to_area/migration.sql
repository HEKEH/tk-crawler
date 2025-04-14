/*
  Warnings:

  - You are about to drop the column `region` on the `AnchorInviteCheck` table. All the data in the column will be lost.
  - Added the required column `area` to the `AnchorInviteCheck` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AnchorInviteCheck_region_idx` ON `AnchorInviteCheck`;

-- AlterTable
ALTER TABLE `AnchorInviteCheck` DROP COLUMN `region`,
    ADD COLUMN `area` VARCHAR(6) NOT NULL;

-- CreateIndex
CREATE INDEX `AnchorInviteCheck_area_idx` ON `AnchorInviteCheck`(`area`);
