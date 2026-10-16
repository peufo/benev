-- Le rappel avant un créneau: le délai choisi par l'évènement (0 = aucun), le choix du membre, et
-- le marqueur qui empêche une fenêtre rejouée d'envoyer deux fois le même rappel.
ALTER TABLE `Event` ADD COLUMN `reminderHours` INTEGER NOT NULL DEFAULT 24;

ALTER TABLE `Member` ADD COLUMN `isNotifiedReminder` BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE `Subscribe` ADD COLUMN `remindedAt` DATETIME(3) NULL;
