/*
  Warnings:

  - Added the required column `quantityAvailable` to the `Licence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Licence` ADD COLUMN `quantityAvailable` INTEGER NOT NULL;
