-- AlterTable
ALTER TABLE `Member` ADD COLUMN `avatarId` VARCHAR(191) NULL,
    ADD COLUMN `avatarPlaceholder` VARCHAR(191) NOT NULL DEFAULT '';
