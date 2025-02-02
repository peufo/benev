/*
  Warnings:

  - You are about to drop the column `authorId` on the `View` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `View_authorId_fkey`;

-- AlterTable
ALTER TABLE `View` DROP COLUMN `authorId`,
    ADD COLUMN `memberId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `View` ADD CONSTRAINT `View_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
