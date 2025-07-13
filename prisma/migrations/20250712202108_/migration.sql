/*
  Warnings:

  - A unique constraint covering the columns `[email,eventId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Member` ADD COLUMN `birthday` DATETIME(3) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT 'MIGRATION',
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL DEFAULT 'IN PROGRESS',
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `street` VARCHAR(191) NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Member_email_eventId_key` ON `Member`(`email`, `eventId`);
