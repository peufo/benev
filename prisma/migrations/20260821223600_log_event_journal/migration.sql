-- AlterTable
ALTER TABLE `Log` ADD COLUMN `teamId` VARCHAR(191) NULL,
    MODIFY `type` ENUM('subscribe_create', 'subscribe_state', 'subscribe_delete', 'subscribe_absent', 'member_invite', 'member_join', 'member_delete', 'member_update', 'member_role', 'member_validated', 'event_state', 'event_update', 'team_create', 'team_update', 'team_delete', 'period_create', 'period_delete', 'note_create', 'email_sent', 'email_failed') NOT NULL;

-- CreateIndex
CREATE INDEX `Log_memberId_createdAt_idx` ON `Log`(`memberId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
