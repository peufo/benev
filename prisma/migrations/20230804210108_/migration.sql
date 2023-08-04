-- AlterTable
ALTER TABLE `Subscribe` ADD COLUMN `state` ENUM('request', 'accepted', 'denied') NOT NULL DEFAULT 'request';
