/*
  Warnings:

  - A unique constraint covering the columns `[name,eventId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Tag_name_eventId_key` ON `Tag`(`name`, `eventId`);
