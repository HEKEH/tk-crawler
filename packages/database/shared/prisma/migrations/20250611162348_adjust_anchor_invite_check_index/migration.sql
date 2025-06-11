-- DropIndex
DROP INDEX `AnchorInviteCheck_area_idx` ON `AnchorInviteCheck`;

-- DropIndex
DROP INDEX `AnchorInviteCheck_checked_at_idx` ON `AnchorInviteCheck`;

-- DropIndex
DROP INDEX `AnchorInviteCheck_checked_result_idx` ON `AnchorInviteCheck`;

-- CreateIndex
CREATE INDEX `AnchorInviteCheck_org_id_area_checked_result_contacted_by_ch_idx` ON `AnchorInviteCheck`(`org_id`, `area`, `checked_result`, `contacted_by`, `checked_at` DESC);
