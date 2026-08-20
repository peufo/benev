-- AlterTable
ALTER TABLE `Message` ADD COLUMN `authorEmail` VARCHAR(191) NULL,
    ADD COLUMN `authorName` VARCHAR(191) NULL,
    MODIFY `authorId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `termsAcceptedAt` DATETIME(3) NULL,
    ADD COLUMN `termsVersion` VARCHAR(191) NULL;
