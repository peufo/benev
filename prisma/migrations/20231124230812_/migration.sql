/*
  Warnings:

  - A unique constraint covering the columns `[eventId,name]` on the table `Gift` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Gift` MODIFY `conditionsMode` ENUM('sum', 'highest') NOT NULL DEFAULT 'sum';

-- CreateIndex
CREATE UNIQUE INDEX `Gift_eventId_name_key` ON `Gift`(`eventId`, `name`);
