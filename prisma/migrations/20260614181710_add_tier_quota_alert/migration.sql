-- AlterTable
ALTER TABLE `Event` ADD COLUMN `notifiedQuota100` DATETIME(3) NULL,
    ADD COLUMN `notifiedQuota80` DATETIME(3) NULL,
    ADD COLUMN `notifiedQuota90` DATETIME(3) NULL;
