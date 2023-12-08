/*
  Warnings:

  - You are about to drop the column `conditionsJson` on the `Team` table. All the data in the column will be lost.
  - You are about to alter the column `conditions` on the `Team` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.

*/
-- AlterTable
ALTER TABLE `Team` DROP COLUMN `conditionsJson`,
    MODIFY `conditions` JSON NULL;
