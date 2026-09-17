-- AlterTable
ALTER TABLE `Log` MODIFY `type` ENUM('subscribe_create', 'subscribe_state', 'subscribe_delete', 'subscribe_absent', 'member_invite', 'member_join', 'member_decline', 'member_delete', 'member_update', 'member_role', 'member_validated', 'event_create', 'event_state', 'event_update', 'team_create', 'team_update', 'team_state', 'team_delete', 'period_create', 'period_delete', 'note_create', 'email_sent', 'email_failed') NOT NULL;

-- AlterTable
ALTER TABLE `Team` ADD COLUMN `state` ENUM('draft', 'validated', 'published') NOT NULL DEFAULT 'draft';

-- Le brouillon n'est le défaut que pour ce qui naît après: l'existant était visible, il le reste.
UPDATE `Team` SET `state` = 'published';
