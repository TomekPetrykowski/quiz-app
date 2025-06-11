/*
  Warnings:

  - You are about to drop the column `keycloak_id` on the `users` table. All the data in the column will be lost.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_keycloak_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "keycloak_id",
ADD COLUMN     "password" TEXT NOT NULL;
