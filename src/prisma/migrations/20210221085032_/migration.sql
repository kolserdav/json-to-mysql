/*
  Warnings:

  - You are about to drop the column `price_id` on the `Seller` table. All the data in the column will be lost.
  - You are about to alter the column `prod_id` on the `Seller` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `price` on the `Seller` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- DropForeignKey
ALTER TABLE `Seller` DROP FOREIGN KEY `Seller_ibfk_1`;

-- AlterTable
ALTER TABLE `Seller` DROP COLUMN `price_id`,
    MODIFY `prod_id` DOUBLE NOT NULL,
    MODIFY `price` DOUBLE NOT NULL;
