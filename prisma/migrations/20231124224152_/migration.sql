/*
  Warnings:

  - Added the required column `eventId` to the `Gift` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Gift` ADD COLUMN `eventId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Gift` ADD CONSTRAINT `Gift_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
