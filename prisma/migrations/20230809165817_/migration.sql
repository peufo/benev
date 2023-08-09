/*
  Warnings:

  - You are about to drop the `_TeamToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_TeamToUser` DROP FOREIGN KEY `_TeamToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_TeamToUser` DROP FOREIGN KEY `_TeamToUser_B_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isEmailValided` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `_TeamToUser`;

-- CreateTable
CREATE TABLE `Leader` (
    `isValided` BOOLEAN NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`, `teamId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Leader` ADD CONSTRAINT `Leader_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leader` ADD CONSTRAINT `Leader_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
