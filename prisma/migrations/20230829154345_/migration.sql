/*
  Warnings:

  - You are about to drop the column `comment` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `diet` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isInsured` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `skillString` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `comment`,
    DROP COLUMN `diet`,
    DROP COLUMN `isInsured`,
    DROP COLUMN `size`,
    DROP COLUMN `skillString`;
