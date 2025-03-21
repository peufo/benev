/*
  Warnings:

  - Added the required column `eventId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Tag` ADD COLUMN `eventId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
