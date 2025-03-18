/*
  Warnings:

  - A unique constraint covering the columns `[org_id,name]` on the table `AnchorFollowGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `AnchorFollowGroup_name_key` ON `AnchorFollowGroup`;

-- CreateIndex
CREATE UNIQUE INDEX `AnchorFollowGroup_org_id_name_key` ON `AnchorFollowGroup`(`org_id`, `name`);
