-- AddForeignKey
ALTER TABLE `AnchorFollowGroupRelation` ADD CONSTRAINT `AnchorFollowGroupRelation_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `AnchorFollowGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
