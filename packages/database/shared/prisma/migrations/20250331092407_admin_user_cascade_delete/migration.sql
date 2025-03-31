-- DropForeignKey
ALTER TABLE `LiveAdminUser` DROP FOREIGN KEY `LiveAdminUser_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `LiveAdminUserRegionRelation` DROP FOREIGN KEY `LiveAdminUserRegionRelation_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `LiveAdminUser` ADD CONSTRAINT `LiveAdminUser_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LiveAdminUserRegionRelation` ADD CONSTRAINT `LiveAdminUserRegionRelation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `LiveAdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
