/*
  Warnings:

  - You are about to drop the column `hasLicence` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `hasLicence`,
    ADD COLUMN `activedAt` DATETIME(3) NULL;
