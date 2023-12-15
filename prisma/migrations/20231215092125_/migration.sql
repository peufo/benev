/*
  Warnings:

  - Added the required column `price` to the `Licence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Licence` ADD COLUMN `price` INTEGER NOT NULL;
