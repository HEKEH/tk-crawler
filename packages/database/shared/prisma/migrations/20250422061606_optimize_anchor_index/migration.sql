-- DropIndex
DROP INDEX `region_updated_at` ON `Anchor`;

-- CreateIndex
CREATE INDEX `region_updated_at_desc` ON `Anchor`(`region`, `updated_at` DESC);
