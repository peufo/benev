/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `Licence` table. All the data in the column will be lost.
  - You are about to drop the column `quantityUsed` on the `Licence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` ADD COLUMN `licenceId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Licence` DROP COLUMN `isAvailable`,
    DROP COLUMN `quantityUsed`;

-- AlterTable
ALTER TABLE `Member` ADD COLUMN `licenceId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_licenceId_fkey` FOREIGN KEY (`licenceId`) REFERENCES `Licence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_licenceId_fkey` FOREIGN KEY (`licenceId`) REFERENCES `Licence`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
