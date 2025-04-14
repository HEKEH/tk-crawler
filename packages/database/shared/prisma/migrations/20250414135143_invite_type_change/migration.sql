/*
  Warnings:

  - You are about to alter the column `invite_type` on the `AnchorInviteCheck` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedTinyInt`.

*/
-- AlterTable
ALTER TABLE `AnchorInviteCheck` MODIFY `invite_type` TINYINT UNSIGNED NULL;
