/*
  Warnings:

  - You are about to alter the column `device_id` on the `MobileDevice` table. The data in that column could be lost. The data in that column will be cast from `UnsignedBigInt` to `VarChar(32)`.

*/
-- AlterTable
ALTER TABLE `MobileDevice` MODIFY `device_id` VARCHAR(32) NOT NULL;
