/*
  Warnings:

  - A unique constraint covering the columns `[fieldId,memberId]` on the table `FieldValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `FieldValue_fieldId_memberId_key` ON `FieldValue`(`fieldId`, `memberId`);
