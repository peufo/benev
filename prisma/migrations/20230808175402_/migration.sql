-- AlterTable
ALTER TABLE `Subscribe` MODIFY `state` ENUM('request', 'accepted', 'denied', 'cancel') NOT NULL DEFAULT 'request';
