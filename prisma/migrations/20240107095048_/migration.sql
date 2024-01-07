-- AlterTable
ALTER TABLE `Checkout` ADD COLUMN `name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `hasLicence` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Member` ADD COLUMN `hasLicence` BOOLEAN NOT NULL DEFAULT false;
