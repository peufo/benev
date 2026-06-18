/*
  Warnings:

  - You are about to drop the column `activedAt` on the `Event` table. All the data in the column will be lost.
  - The values [actived] on the enum `Event_state` will be removed. If these variants are still used in the database, this will fail.

*/
-- Migrate existing events from the removed `actived` state to `draft`
UPDATE `Event` SET `state` = 'draft' WHERE `state` = 'actived';

-- AlterTable
ALTER TABLE `Event` DROP COLUMN `activedAt`,
    MODIFY `state` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft';
