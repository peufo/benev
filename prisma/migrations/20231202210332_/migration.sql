/*
  Warnings:

  - You are about to drop the column `isMemberProfileCompleted` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `isUserProfileCompleted` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Member` DROP COLUMN `isMemberProfileCompleted`,
    DROP COLUMN `isUserProfileCompleted`;
