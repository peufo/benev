-- AlterTable
ALTER TABLE `Gift` ALTER COLUMN `conditionsMode` DROP DEFAULT;

-- AlterTable
ALTER TABLE `GiftCondition` ADD COLUMN `value` INTEGER NOT NULL DEFAULT 1;
