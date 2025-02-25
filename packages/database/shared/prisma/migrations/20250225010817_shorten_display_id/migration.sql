/*
  Warnings:

  - You are about to alter the column `display_id` on the `Anchor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(40)` to `VarChar(24)`.

*/
-- AlterTable
ALTER TABLE `Anchor` MODIFY `display_id` VARCHAR(24) NOT NULL;
