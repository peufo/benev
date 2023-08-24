/*
  Warnings:

  - A unique constraint covering the columns `[eventId,name]` on the table `Field` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Field_eventId_name_key` ON `Field`(`eventId`, `name`);
