/*
  Warnings:

  - A unique constraint covering the columns `[template_id,version,row]` on the table `email_messages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `row` to the `email_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `email_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_messages" ADD COLUMN     "row" INTEGER NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "email_messages_template_id_version_row_key" ON "email_messages"("template_id", "version", "row");
