/*
  Warnings:

  - You are about to drop the column `is_active` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_active";
