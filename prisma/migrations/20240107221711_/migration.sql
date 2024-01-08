/*
  Warnings:

  - Made the column `checkoutId` on table `Licence` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Licence` DROP FOREIGN KEY `Licence_checkoutId_fkey`;

-- AlterTable
ALTER TABLE `Licence` MODIFY `checkoutId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Licence` ADD CONSTRAINT `Licence_checkoutId_fkey` FOREIGN KEY (`checkoutId`) REFERENCES `Checkout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
