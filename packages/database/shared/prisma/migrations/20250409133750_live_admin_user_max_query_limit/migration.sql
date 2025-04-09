/*
  Warnings:

  - Made the column `max_query_per_hour` on table `LiveAdminUser` required. This step will fail if there are existing NULL values in that column.
  - Made the column `max_query_per_day` on table `LiveAdminUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `LiveAdminUser` MODIFY `max_query_per_hour` INTEGER UNSIGNED NOT NULL DEFAULT 50,
    MODIFY `max_query_per_day` INTEGER UNSIGNED NOT NULL DEFAULT 280;
