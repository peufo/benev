-- AlterTable
ALTER TABLE `User` ADD COLUMN `birthday` DATETIME(3) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `comment` VARCHAR(191) NULL,
    ADD COLUMN `diet` VARCHAR(191) NULL,
    ADD COLUMN `isInsured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `size` ENUM('small', 'medium', 'large', 'xLarge') NULL,
    ADD COLUMN `skillString` VARCHAR(191) NULL,
    ADD COLUMN `street` VARCHAR(191) NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NULL;
