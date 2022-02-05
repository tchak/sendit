/*
  Warnings:

  - Added the required column `email` to the `smtp_configurations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "smtp_configurations" ADD COLUMN     "email" TEXT NOT NULL;
