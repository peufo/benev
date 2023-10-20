/*
  Warnings:

  - You are about to drop the column `medium` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `small` on the `Media` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Media` DROP COLUMN `medium`,
    DROP COLUMN `path`,
    DROP COLUMN `small`;
