-- AlterTable
ALTER TABLE `Badge` ADD COLUMN `fieldId` VARCHAR(191) NULL,
    ADD COLUMN `labelFieldId` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NOT NULL DEFAULT 'Badge standard';

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_labelFieldId_fkey` FOREIGN KEY (`labelFieldId`) REFERENCES `Field`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Badge` ADD CONSTRAINT `Badge_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `Field`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
