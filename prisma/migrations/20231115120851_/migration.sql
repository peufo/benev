/*
  Warnings:

  - You are about to drop the column `logo` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `logo`,
    ADD COLUMN `icon` VARCHAR(191) NULL;
