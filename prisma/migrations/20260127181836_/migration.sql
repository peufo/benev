-- DropForeignKey
ALTER TABLE `Badge` DROP FOREIGN KEY `Badge_accessDaysFieldId_fkey`;

-- DropForeignKey
ALTER TABLE `Badge` DROP FOREIGN KEY `Badge_accessSectorsFieldId_fkey`;

-- DropForeignKey
ALTER TABLE `Badge` DROP FOREIGN KEY `Badge_backgroundId_fkey`;

-- DropForeignKey
ALTER TABLE `Badge` DROP FOREIGN KEY `Badge_logoId_fkey`;

-- DropForeignKey
ALTER TABLE `Badge` DROP FOREIGN KEY `Badge_typeFieldId_fkey`;

-- AlterTable
ALTER TABLE `Badge` MODIFY `backgroundId` VARCHAR(191) NULL,
    MODIFY `logoId` VARCHAR(191) NULL,
    MODIFY `typeFieldId` VARCHAR(191) NULL,
    MODIFY `accessDaysFieldId` VARCHAR(191) NULL,
    MODIFY `accessSectorsFieldId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_backgroundId_fkey` FOREIGN KEY (`backgroundId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_typeFieldId_fkey` FOREIGN KEY (`typeFieldId`) REFERENCES `Field`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_accessDaysFieldId_fkey` FOREIGN KEY (`accessDaysFieldId`) REFERENCES `Field`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_accessSectorsFieldId_fkey` FOREIGN KEY (`accessSectorsFieldId`) REFERENCES `Field`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
