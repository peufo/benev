-- `closeSubscribing` devient l'instant où le secteur repasse en `validated`. L'ancienne règle
-- refusait l'inscription le lendemain de la date saisie: on garde cette promesse.
UPDATE `Event` SET `closeSubscribing` = DATE_ADD(`closeSubscribing`, INTERVAL 1 DAY) WHERE `closeSubscribing` IS NOT NULL;
UPDATE `Team` SET `closeSubscribing` = DATE_ADD(`closeSubscribing`, INTERVAL 1 DAY) WHERE `closeSubscribing` IS NOT NULL;

-- CreateTable
CREATE TABLE `TaskRun` (
    `name` VARCHAR(191) NOT NULL,
    `cursor` DATETIME(3) NOT NULL,
    `ranAt` DATETIME(3) NOT NULL,
    `duration` INTEGER NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `error` TEXT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
