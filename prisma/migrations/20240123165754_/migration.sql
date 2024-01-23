/*
  Warnings:

  - You are about to drop the column `licenceId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `licenceId` on the `Member` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Event_licenceId_fkey` ON `Event`;

-- DropIndex
DROP INDEX `Member_licenceId_key` ON `Member`;

-- AlterTable
ALTER TABLE `Event` DROP COLUMN `licenceId`;

-- AlterTable
ALTER TABLE `Member` DROP COLUMN `licenceId`;
