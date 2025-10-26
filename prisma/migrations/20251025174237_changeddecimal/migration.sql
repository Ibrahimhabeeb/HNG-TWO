-- AlterTable
ALTER TABLE `countries` MODIFY `exchange_rate` DECIMAL(65, 30) NOT NULL,
    MODIFY `estimated_gdp` DECIMAL(65, 30) NOT NULL;
