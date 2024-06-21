-- AlterTable
ALTER TABLE `Member` ADD COLUMN `isNotifiedAdminOfNewMember` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isNotifiedAdminOfSubscribe` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isNotifiedLeaderOfSubscribe` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isNotifiedSubscribe` BOOLEAN NOT NULL DEFAULT true;
