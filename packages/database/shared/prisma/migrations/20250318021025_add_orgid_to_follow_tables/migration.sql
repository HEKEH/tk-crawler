-- AlterTable
ALTER TABLE `AnchorFollowGroup` ADD COLUMN `org_id` BIGINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `AnchorFrom87` ADD COLUMN `org_id` BIGINT UNSIGNED NULL;

-- CreateIndex
CREATE INDEX `AnchorFollowGroup_org_id_idx` ON `AnchorFollowGroup`(`org_id`);

-- CreateIndex
CREATE INDEX `AnchorFrom87_org_id_idx` ON `AnchorFrom87`(`org_id`);

-- AddForeignKey
ALTER TABLE `AnchorFrom87` ADD CONSTRAINT `AnchorFrom87_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnchorFollowGroup` ADD CONSTRAINT `AnchorFollowGroup_org_id_fkey` FOREIGN KEY (`org_id`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
