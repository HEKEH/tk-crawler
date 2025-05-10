/*
Warnings:

- Made the column `has_commerce_goods` on table `Anchor` required. This step will fail if there are existing NULL values in that column.

 */
UPDATE `Anchor`
SET
  has_commerce_goods = false
WHERE
  has_commerce_goods IS NULL;

-- AlterTable
ALTER TABLE `Anchor` MODIFY `has_commerce_goods` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Anchor_has_commerce_goods_idx` ON `Anchor` (`has_commerce_goods`);