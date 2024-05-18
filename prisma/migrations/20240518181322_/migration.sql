/*
  Warnings:

  - You are about to alter the column `backgroundBlur` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `backgroundWhiteness` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `cardOpacity` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Event` MODIFY `backgroundBlur` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `backgroundWhiteness` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `cardOpacity` DOUBLE NOT NULL DEFAULT 1;
