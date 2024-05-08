/*
  Warnings:

  - Made the column `conditions` on table `Team` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Team` MODIFY `conditions` JSON NOT NULL;
