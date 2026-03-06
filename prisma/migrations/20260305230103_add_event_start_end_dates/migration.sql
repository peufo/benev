-- AlterTable
ALTER TABLE `Event` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL;

-- Calculate initial dates from periods
UPDATE `Event` e
SET 
    `startDate` = (
        SELECT MIN(p.`start`)
        FROM `Team` t
        JOIN `Period` p ON p.`teamId` = t.`id`
        WHERE t.`eventId` = e.`id`
    ),
    `endDate` = (
        SELECT MAX(p.`end`)
        FROM `Team` t
        JOIN `Period` p ON p.`teamId` = t.`id`
        WHERE t.`eventId` = e.`id`
    );
