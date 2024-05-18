-- AlterTable
ALTER TABLE `Event` ADD COLUMN `backgroundBlur` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `backgroundBrightness` INTEGER NOT NULL DEFAULT 100,
    ADD COLUMN `backgroundColor` VARCHAR(191) NOT NULL DEFAULT '#fffff',
    ADD COLUMN `backgroundPoster` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `backgroundWhiteness` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `cardOpacity` INTEGER NOT NULL DEFAULT 1;
