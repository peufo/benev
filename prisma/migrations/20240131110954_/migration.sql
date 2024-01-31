-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_logoId_fkey`;

-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_posterId_fkey`;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_logoId_fkey` FOREIGN KEY (`logoId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_posterId_fkey` FOREIGN KEY (`posterId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
