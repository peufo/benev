-- AlterTable
ALTER TABLE `Event` ADD COLUMN `selfRegisterAllowed` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `selfSubscribeAllowed` BOOLEAN NOT NULL DEFAULT true;
