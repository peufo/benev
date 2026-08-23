-- AlterTable
ALTER TABLE `Event` DROP COLUMN `cardOpacity`,
    ADD COLUMN `backgroundGrain` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `backgroundPreset` VARCHAR(191) NULL;

