-- AlterTable
ALTER TABLE `Event` ADD COLUMN `memberAdressRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `memberAvatarRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `memberBirthdayRequired` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `memberPhoneRequired` BOOLEAN NOT NULL DEFAULT false;
