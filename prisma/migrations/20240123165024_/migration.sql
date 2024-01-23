/*
  Warnings:

  - You are about to drop the column `price` on the `Licence` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Licence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberId]` on the table `Licence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId]` on the table `Licence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[licenceId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_licenceId_fkey`;

-- DropForeignKey
ALTER TABLE `Member` DROP FOREIGN KEY `Member_licenceId_fkey`;

-- AlterTable
ALTER TABLE `Licence` DROP COLUMN `price`,
    DROP COLUMN `quantity`,
    ADD COLUMN `eventId` VARCHAR(191) NULL,
    ADD COLUMN `memberId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Licence_memberId_key` ON `Licence`(`memberId`);

-- CreateIndex
CREATE UNIQUE INDEX `Licence_eventId_key` ON `Licence`(`eventId`);

-- CreateIndex
CREATE UNIQUE INDEX `Member_licenceId_key` ON `Member`(`licenceId`);

-- AddForeignKey
ALTER TABLE `Licence` ADD CONSTRAINT `Licence_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Licence` ADD CONSTRAINT `Licence_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
