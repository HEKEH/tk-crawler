/*
  Warnings:

  - A unique constraint covering the columns `[org_id,anchor_id]` on the table `AnchorInviteCheck` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AnchorInviteCheck_org_id_anchor_id_key` ON `AnchorInviteCheck`(`org_id`, `anchor_id`);
