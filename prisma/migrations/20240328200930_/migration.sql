/*
  Warnings:

  - You are about to drop the column `isVisibleByAll` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `isVisibleByMember` on the `Page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Page` DROP COLUMN `isVisibleByAll`,
    DROP COLUMN `isVisibleByMember`,
    MODIFY `type` ENUM('home', 'charter', 'public', 'member', 'email') NOT NULL DEFAULT 'public';
