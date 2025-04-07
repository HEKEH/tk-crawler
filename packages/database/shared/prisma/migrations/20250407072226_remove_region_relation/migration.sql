-- DropForeignKey
ALTER TABLE `LiveAdminUserRegionRelation` DROP FOREIGN KEY `LiveAdminUserRegionRelation_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `OrgRegionRelation` DROP FOREIGN KEY `OrgRegionRelation_org_id_fkey`;

-- AlterTable
ALTER TABLE `LiveAdminUserRegionRelation` MODIFY `region` VARCHAR(6) NOT NULL;

-- AlterTable
ALTER TABLE `OrgRegionRelation` MODIFY `region` VARCHAR(6) NOT NULL;
