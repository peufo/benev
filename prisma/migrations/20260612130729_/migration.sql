-- AlterTable
ALTER TABLE `Event` ADD COLUMN `tier` ENUM('basic', 'standard', 'premium', 'pro') NOT NULL DEFAULT 'basic';

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NULL,
    `checkoutId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Product_id_key`(`id`),
    UNIQUE INDEX `Product_eventId_key`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_checkoutId_fkey` FOREIGN KEY (`checkoutId`) REFERENCES `Checkout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
