/*
  Warnings:

  - Added the required column `seller` to the `Seller` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Seller` ADD COLUMN     `seller` VARCHAR(191) NOT NULL;
