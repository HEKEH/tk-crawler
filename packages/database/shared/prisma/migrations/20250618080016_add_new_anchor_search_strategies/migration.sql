-- AlterTable
ALTER TABLE `Organization` ADD COLUMN `highest_diamonds_limit` INTEGER UNSIGNED NULL,
    ADD COLUMN `rank_league_limit` CHAR(2) NULL;
