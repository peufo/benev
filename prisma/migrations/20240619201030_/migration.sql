/*
  Warnings:

  - You are about to drop the column `timezone` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `timezone`,
    ADD COLUMN `overlapPeriodAllowed` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `selfSubscribeCancelAllowed` BOOLEAN NOT NULL DEFAULT true;
