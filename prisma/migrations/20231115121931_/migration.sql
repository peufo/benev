/*
  Warnings:

  - A unique constraint covering the columns `[logoId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[posterId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Event` ADD COLUMN `logoId` VARCHAR(191) NULL,
    ADD COLUMN `posterId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Event_logoId_key` ON `Event`(`logoId`);

-- CreateIndex
CREATE UNIQUE INDEX `Event_posterId_key` ON `Event`(`posterId`);

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_posterId_fkey` FOREIGN KEY (`posterId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
