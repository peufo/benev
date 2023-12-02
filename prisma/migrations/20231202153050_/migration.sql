/*
  Warnings:

  - You are about to drop the column `memberAdressRequired` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `memberAvatarRequired` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `memberBirthdayRequired` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `memberPhoneRequired` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `memberAdressRequired`,
    DROP COLUMN `memberAvatarRequired`,
    DROP COLUMN `memberBirthdayRequired`,
    DROP COLUMN `memberPhoneRequired`,
    ADD COLUMN `userAddressRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `userAvatarRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `userBirthdayRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `userPhoneRequired` BOOLEAN NOT NULL DEFAULT false;
