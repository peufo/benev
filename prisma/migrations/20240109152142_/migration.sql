/*
  Warnings:

  - You are about to drop the column `hasLicence` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Member` DROP COLUMN `hasLicence`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isOrganizer` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isTermsAccepted` BOOLEAN NOT NULL DEFAULT false;
