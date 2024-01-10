/*
  Warnings:

  - You are about to drop the column `quantityAvailable` on the `Licence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Licence` DROP COLUMN `quantityAvailable`,
    ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `quantityUsed` INTEGER NOT NULL DEFAULT 0;
