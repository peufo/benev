/*
  Warnings:

  - You are about to drop the column `description` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the `_MemberToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TagToTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_MemberToTag` DROP FOREIGN KEY `_MemberToTag_A_fkey`;

-- DropForeignKey
ALTER TABLE `_MemberToTag` DROP FOREIGN KEY `_MemberToTag_B_fkey`;

-- DropForeignKey
ALTER TABLE `_TagToTeam` DROP FOREIGN KEY `_TagToTeam_A_fkey`;

-- DropForeignKey
ALTER TABLE `_TagToTeam` DROP FOREIGN KEY `_TagToTeam_B_fkey`;

-- AlterTable
ALTER TABLE `Tag` DROP COLUMN `description`;

-- DropTable
DROP TABLE `_MemberToTag`;

-- DropTable
DROP TABLE `_TagToTeam`;

-- CreateTable
CREATE TABLE `_PeriodToTag` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PeriodToTag_AB_unique`(`A`, `B`),
    INDEX `_PeriodToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PeriodToTag` ADD CONSTRAINT `_PeriodToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Period`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PeriodToTag` ADD CONSTRAINT `_PeriodToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
