-- Les e-mails qu'un évènement non publié retient: l'invitation qui attend sa publication, et le
-- marqueur de la demande d'inscription envoyée, pour qu'une publication rejouée ne la renvoie pas.
ALTER TABLE `Member` ADD COLUMN `invitePendingAt` DATETIME(3) NULL;

ALTER TABLE `Subscribe` ADD COLUMN `notifiedAt` DATETIME(3) NULL;

-- Hors d'un secteur en brouillon, la demande est déjà partie à sa création.
UPDATE `Subscribe` s
	JOIN `Period` p ON s.`periodId` = p.`id`
	JOIN `Team` t ON p.`teamId` = t.`id`
SET s.`notifiedAt` = s.`createdAt`
WHERE t.`state` <> 'draft';
