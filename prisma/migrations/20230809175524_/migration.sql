-- DropForeignKey
ALTER TABLE `Leader` DROP FOREIGN KEY `Leader_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `Leader` DROP FOREIGN KEY `Leader_userId_fkey`;

-- AlterTable
ALTER TABLE `Leader` MODIFY `isValided` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `Leader` ADD CONSTRAINT `Leader_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leader` ADD CONSTRAINT `Leader_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
