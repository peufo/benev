-- AlterTable
ALTER TABLE `Event` ADD COLUMN `state` ENUM('draft', 'actived', 'published', 'archived') NOT NULL DEFAULT 'draft';
