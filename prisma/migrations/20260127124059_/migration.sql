/*
  Warnings:

  - You are about to drop the column `isHeadlessAccount` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `isHeadlessAccount`;

-- CreateTable
CREATE TABLE `Badge` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'Badge d''accès',
    `eventId` VARCHAR(191) NOT NULL,
    `backgroundId` VARCHAR(191) NOT NULL,
    `logoId` VARCHAR(191) NOT NULL,
    `typeFieldId` VARCHAR(191) NOT NULL,
    `accessDaysFieldId` VARCHAR(191) NOT NULL,
    `accessSectorsFieldId` VARCHAR(191) NOT NULL,
    `colorMap` JSON NOT NULL,
    `colorDefault` VARCHAR(191) NOT NULL DEFAULT '#C7B198',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_backgroundId_fkey` FOREIGN KEY (`backgroundId`) REFERENCES `Media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `Media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_typeFieldId_fkey` FOREIGN KEY (`typeFieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_accessDaysFieldId_fkey` FOREIGN KEY (`accessDaysFieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_accessSectorsFieldId_fkey` FOREIGN KEY (`accessSectorsFieldId`) REFERENCES `Field`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
