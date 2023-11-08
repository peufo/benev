/*
  Warnings:

  - You are about to drop the `Ban` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Ban` DROP FOREIGN KEY `Ban_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `Ban` DROP FOREIGN KEY `Ban_userId_fkey`;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `state` ENUM('draft', 'active', 'archived') NOT NULL DEFAULT 'draft';

-- DropTable
DROP TABLE `Ban`;
