/*
  Warnings:

  - You are about to drop the column `configuration_id` on the `email_templates` table. All the data in the column will be lost.
  - You are about to drop the `smtp_configurations` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id,user_id]` on the table `email_templates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "email_templates" DROP CONSTRAINT "email_templates_configuration_id_fkey";

-- DropForeignKey
ALTER TABLE "smtp_configurations" DROP CONSTRAINT "smtp_configurations_user_id_fkey";

-- DropIndex
DROP INDEX "email_templates_configuration_id_idx";

-- AlterTable
ALTER TABLE "email_templates" DROP COLUMN "configuration_id",
ADD COLUMN     "transport_id" UUID;

-- DropTable
DROP TABLE "smtp_configurations";

-- CreateTable
CREATE TABLE "email_transports" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "email_transports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_transports_user_id_idx" ON "email_transports"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_transports_id_user_id_key" ON "email_transports"("id", "user_id");

-- CreateIndex
CREATE INDEX "email_templates_transport_id_idx" ON "email_templates"("transport_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_id_user_id_key" ON "email_templates"("id", "user_id");

-- AddForeignKey
ALTER TABLE "email_transports" ADD CONSTRAINT "email_transports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "email_transports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
