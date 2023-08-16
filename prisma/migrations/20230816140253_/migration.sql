/*
  Warnings:

  - You are about to drop the column `userId` on the `Subscribe` table. All the data in the column will be lost.
  - You are about to drop the `Leader` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[memberId,periodId]` on the table `Subscribe` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `memberId` to the `Subscribe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Leader` DROP FOREIGN KEY `Leader_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `Leader` DROP FOREIGN KEY `Leader_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Subscribe` DROP FOREIGN KEY `Subscribe_userId_fkey`;

-- DropIndex
DROP INDEX `Subscribe_userId_periodId_key` ON `Subscribe`;

-- AlterTable
ALTER TABLE `Subscribe` DROP COLUMN `userId`,
    ADD COLUMN `memberId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Leader`;

-- CreateTable
CREATE TABLE `Member` (
    `id` VARCHAR(191) NOT NULL,
    `isValidedByEvent` BOOLEAN NOT NULL DEFAULT false,
    `isValidedByUser` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Member_userId_eventId_key`(`userId`, `eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MemberToTeam` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_MemberToTeam_AB_unique`(`A`, `B`),
    INDEX `_MemberToTeam_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Subscribe_memberId_periodId_key` ON `Subscribe`(`memberId`, `periodId`);

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscribe` ADD CONSTRAINT `Subscribe_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MemberToTeam` ADD CONSTRAINT `_MemberToTeam_A_fkey` FOREIGN KEY (`A`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MemberToTeam` ADD CONSTRAINT `_MemberToTeam_B_fkey` FOREIGN KEY (`B`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
