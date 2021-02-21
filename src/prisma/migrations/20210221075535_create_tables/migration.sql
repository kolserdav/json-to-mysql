-- CreateTable
CREATE TABLE `Price` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `aggregator` VARCHAR(191) NOT NULL,
    `price_id` INTEGER NOT NULL,
    `product_name` VARCHAR(512) NOT NULL,
    `category_name` VARCHAR(191) NOT NULL,
    `price_supplier` DOUBLE NOT NULL,
    `price_min` DOUBLE NOT NULL,
    `price_adapted` DOUBLE NOT NULL,
    `margin_before` DOUBLE NOT NULL,
    `margin_after` DOUBLE NOT NULL,
    `date_public` DATETIME(3),
    `price_publisher` VARCHAR(191) NOT NULL,
    `price_column` VARCHAR(191),
    `hotline_url` VARCHAR(191) NOT NULL,
    `data_parse` DATETIME(3) NOT NULL,
    `data_parse_human` DATETIME(3) NOT NULL,
    `date_comtrading` DATETIME(3),
    `source_file` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seller` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prod_id` INTEGER NOT NULL,
    `aggregator_id` INTEGER NOT NULL,
    `dt` DATETIME(3) NOT NULL,
    `price` INTEGER NOT NULL,
    `delivery_kiev` BOOLEAN NOT NULL,
    `delivery_free` BOOLEAN NOT NULL,
    `price_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Seller` ADD FOREIGN KEY (`price_id`) REFERENCES `Price`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
