/*
  Warnings:

  - You are about to drop the `Gift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GiftAllocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GiftCondition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Gift` DROP FOREIGN KEY `Gift_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `GiftAllocation` DROP FOREIGN KEY `GiftAllocation_giftId_fkey`;

-- DropForeignKey
ALTER TABLE `GiftAllocation` DROP FOREIGN KEY `GiftAllocation_memberId_fkey`;

-- DropForeignKey
ALTER TABLE `GiftCondition` DROP FOREIGN KEY `GiftCondition_giftId_fkey`;

-- DropTable
DROP TABLE `Gift`;

-- DropTable
DROP TABLE `GiftAllocation`;

-- DropTable
DROP TABLE `GiftCondition`;
