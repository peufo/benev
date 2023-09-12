-- AlterTable
ALTER TABLE `Field` MODIFY `type` ENUM('string', 'textarea', 'number', 'boolean', 'select', 'multiselect') NOT NULL;
