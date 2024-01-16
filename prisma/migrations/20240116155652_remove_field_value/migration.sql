/*
  Warnings:

  - You are about to drop the `FieldValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `FieldValue` DROP FOREIGN KEY `FieldValue_fieldId_fkey`;

-- DropForeignKey
ALTER TABLE `FieldValue` DROP FOREIGN KEY `FieldValue_memberId_fkey`;

-- DropTable
DROP TABLE `FieldValue`;
