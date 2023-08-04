/*
  Warnings:

  - A unique constraint covering the columns `[userId,periodId]` on the table `Subscribe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Subscribe_userId_periodId_key` ON `Subscribe`(`userId`, `periodId`);
