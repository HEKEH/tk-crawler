-- DropIndex
DROP INDEX `region_updated_at_desc` ON `Anchor`;

-- AlterTable
ALTER TABLE `Anchor` ADD COLUMN `area` VARCHAR(6) NULL;

-- CreateIndex
CREATE INDEX `region` ON `Anchor`(`region`);

-- CreateIndex
CREATE INDEX `area_updated_at_desc` ON `Anchor`(`area`, `updated_at` DESC);
