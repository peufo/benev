-- Les invitations de l'ancien modèle portaient un `User` coquille créé par l'organisateur, du temps
-- où `Member.userId` était NOT NULL. Sans ce détachement elles passeraient pour des adhésions
-- abouties et sauteraient l'étape d'adhésion, donc la charte. Les lignes concernées ont toutes un
-- email: `acceptInvite` les retrouve par lui et les relie, inscriptions conservées.
UPDATE `Member` SET `userId` = NULL
WHERE `isValidedByUser` = 0 AND `userId` IS NOT NULL;

-- Des vues enregistrées filtrent sur l'ancienne clé; le nom nu couvre aussi sa forme encodée
-- `%22isValidedByUser%22` dans `members_fields_visible`. Pas de collision possible avec
-- `isValidedByEvent`, qui ne contient pas la sous-chaîne.
UPDATE `View` SET `query` = REPLACE(`query`, 'isValidedByUser', 'hasAccount')
WHERE `query` LIKE '%isValidedByUser%';

-- DropColumn
ALTER TABLE `Member` DROP COLUMN `isValidedByUser`;
