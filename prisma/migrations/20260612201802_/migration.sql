/*
  Warnings:

  - Added the required column `priceId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `priceId` VARCHAR(191) NOT NULL;
