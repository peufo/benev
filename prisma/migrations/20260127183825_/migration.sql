/*
  Warnings:

  - A unique constraint covering the columns `[eventId,name]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Badge_eventId_name_key` ON `Badge`(`eventId`, `name`);
