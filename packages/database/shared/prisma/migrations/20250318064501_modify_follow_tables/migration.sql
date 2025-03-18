/*
  Warnings:

  - The primary key for the `AnchorFrom87` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `AnchorFrom87` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - A unique constraint covering the columns `[org_id,account_id]` on the table `AnchorFrom87` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `AnchorFollowGroupRelation` DROP FOREIGN KEY `AnchorFollowGroupRelation_anchor_id_fkey`;

-- DropIndex
DROP INDEX `AnchorFrom87_account_id_key` ON `AnchorFrom87`;

-- DropIndex
DROP INDEX `AnchorFrom87_account_key` ON `AnchorFrom87`;

-- AlterTable
ALTER TABLE `AnchorFrom87` DROP PRIMARY KEY,
    MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `AnchorFrom87_org_id_account_id_key` ON `AnchorFrom87`(`org_id`, `account_id`);

-- AddForeignKey
ALTER TABLE `AnchorFollowGroupRelation` ADD CONSTRAINT `AnchorFollowGroupRelation_anchor_id_fkey` FOREIGN KEY (`anchor_id`) REFERENCES `AnchorFrom87`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
