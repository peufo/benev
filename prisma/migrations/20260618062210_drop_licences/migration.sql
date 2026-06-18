/*
  Warnings:

  - You are about to drop the column `isDonation` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `missingLicencesMember` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Licence` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Licence` DROP FOREIGN KEY `Licence_checkoutId_fkey`;

-- DropForeignKey
ALTER TABLE `Licence` DROP FOREIGN KEY `Licence_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `Licence` DROP FOREIGN KEY `Licence_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `Licence` DROP FOREIGN KEY `Licence_ownerId_fkey`;

-- AlterTable
ALTER TABLE `Checkout` DROP COLUMN `isDonation`;

-- AlterTable
ALTER TABLE `Event` DROP COLUMN `missingLicencesMember`;

-- DropTable
DROP TABLE `Licence`;
