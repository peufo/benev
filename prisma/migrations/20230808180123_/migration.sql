/*
  Warnings:

  - The values [cancel] on the enum `Subscribe_state` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Subscribe` MODIFY `state` ENUM('request', 'accepted', 'denied', 'cancelled') NOT NULL DEFAULT 'request';
