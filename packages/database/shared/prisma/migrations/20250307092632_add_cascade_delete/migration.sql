-- DropForeignKey
ALTER TABLE `AnchorConnect` DROP FOREIGN KEY `AnchorConnect_anchor_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorConnect` DROP FOREIGN KEY `AnchorConnect_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorInviteCheck` DROP FOREIGN KEY `AnchorInviteCheck_anchor_id_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorInviteCheck` DROP FOREIGN KEY `AnchorInviteCheck_checked_by_fkey`;

-- DropForeignKey
ALTER TABLE `AnchorInviteCheck` DROP FOREIGN KEY `AnchorInviteCheck_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `OrgRegionRelation` DROP FOREIGN KEY `OrgRegionRelation_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `OrgUser` DROP FOREIGN KEY `OrgUser_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `TaskAssign` DROP FOREIGN KEY `TaskAssign_anchor_id_fkey`;

-- DropForeignKey
ALTER TABLE `TaskAssign` DROP FOREIGN KEY `TaskAssign_org_id_fkey`;

-- DropForeignKey
ALTER TABLE `TaskAssign` DROP FOREIGN KEY `TaskAssign_org_user_id_fkey`;

-- DropIndex
DROP INDEX `AnchorInviteCheck_anchor_id_fkey` ON `AnchorInviteCheck`;

-- DropIndex
DROP INDEX `AnchorInviteCheck_checked_by_fkey` ON `AnchorInviteCheck`;

-- DropIndex
DROP INDEX `TaskAssign_anchor_id_fkey` ON `TaskAssign`;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_anchor_id_fkey` FOREIGN KEY (`anchor_id`) REFERENCES `Anchor`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorInviteCheck` ADD CONSTRAINT `AnchorInviteCheck_checked_by_fkey` FOREIGN KEY (`checked_by`) REFERENCES `LiveAdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrgUser` ADD CONSTRAINT `OrgUser_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrgRegionRelation` ADD CONSTRAINT `OrgRegionRelation_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskAssign` ADD CONSTRAINT `TaskAssign_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskAssign` ADD CONSTRAINT `TaskAssign_anchor_id_fkey` FOREIGN KEY (`anchor_id`) REFERENCES `Anchor`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskAssign` ADD CONSTRAINT `TaskAssign_org_user_id_fkey` FOREIGN KEY (`org_user_id`) REFERENCES `OrgUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorConnect` ADD CONSTRAINT `AnchorConnect_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorConnect` ADD CONSTRAINT `AnchorConnect_anchor_id_fkey` FOREIGN KEY (`anchor_id`) REFERENCES `Anchor`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
