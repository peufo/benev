-- AlterTable
ALTER TABLE `Page` ADD COLUMN `isVisibleByAll` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isVisibleByMember` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `type` ENUM('home', 'charter', 'public', 'member') NOT NULL DEFAULT 'public';
