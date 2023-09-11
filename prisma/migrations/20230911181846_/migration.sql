/*
  Warnings:

  - You are about to drop the column `request` on the `Subscribe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Subscribe` DROP COLUMN `request`,
    ADD COLUMN `createdBy` ENUM('user', 'leader') NOT NULL DEFAULT 'user';
