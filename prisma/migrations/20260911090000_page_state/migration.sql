-- AlterTable
-- `index` devient `position`: un renommage, pour que l'ordre des modèles de courriel survive.
ALTER TABLE `Page` RENAME COLUMN `index` TO `position`;
ALTER TABLE `Page` ADD COLUMN `state` ENUM('draft', 'published') NOT NULL DEFAULT 'draft';

-- Le brouillon n'est le défaut que pour ce qui naît après: l'existant était visible, il le reste.
UPDATE `Page` SET `state` = 'published';
