-- AlterTable
ALTER TABLE `Member` ADD COLUMN `isMemberProfileCompleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isUserProfileCompleted` BOOLEAN NOT NULL DEFAULT false;
