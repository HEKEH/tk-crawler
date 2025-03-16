/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `AnchorFollowGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AnchorFollowGroup_name_key` ON `AnchorFollowGroup`(`name`);
