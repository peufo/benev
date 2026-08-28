-- AlterTable
ALTER TABLE `Token` ADD COLUMN `memberId` VARCHAR(191) NULL,
    MODIFY `type` ENUM('emailVerification', 'passwordReset', 'invitation') NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
