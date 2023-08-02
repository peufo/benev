/*
  Warnings:

  - A unique constraint covering the columns `[eventId,title]` on the table `Page` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Page_id_key` ON `Page`;

-- DropIndex
DROP INDEX `Period_id_key` ON `Period`;

-- DropIndex
DROP INDEX `Subscribe_id_key` ON `Subscribe`;

-- DropIndex
DROP INDEX `Team_id_key` ON `Team`;

-- CreateIndex
CREATE UNIQUE INDEX `Page_eventId_title_key` ON `Page`(`eventId`, `title`);
