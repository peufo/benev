/*
  Warnings:

  - You are about to drop the column `memberId` on the `View` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `View` DROP FOREIGN KEY `View_memberId_fkey`;

-- AlterTable
ALTER TABLE `View` DROP COLUMN `memberId`;
