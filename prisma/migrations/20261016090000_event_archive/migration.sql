-- L'archivage automatique: l'avertissement envoyé à l'organisateur·ice, et le dernier geste qui
-- a gardé l'évènement ouvert.
ALTER TABLE `Event` ADD COLUMN `archiveKeptAt` DATETIME(3) NULL,
    ADD COLUMN `archiveNoticeAt` DATETIME(3) NULL;
