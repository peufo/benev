/*
  Warnings:

  - You are about to drop the column `fieldId` on the `Badge` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Badge` DROP FOREIGN KEY `Badge_fieldId_fkey`;

-- AlterTable
ALTER TABLE `Badge` DROP COLUMN `fieldId`;
