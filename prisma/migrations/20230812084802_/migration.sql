-- AlterTable
ALTER TABLE `Subscribe` ADD COLUMN `request` ENUM('byUser', 'byLeader') NOT NULL DEFAULT 'byUser';
