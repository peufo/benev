/*
  Warnings:

  - A unique constraint covering the columns `[backgroundImageId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Badge` MODIFY `colorDefault` VARCHAR(191) NOT NULL DEFAULT '#F8E7D4';

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `backgroundImageId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Event_backgroundImageId_key` ON `Event`(`backgroundImageId`);

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_backgroundImageId_fkey` FOREIGN KEY (`backgroundImageId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
