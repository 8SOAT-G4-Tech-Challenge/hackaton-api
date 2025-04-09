/*
  Warnings:

  - Added the required column `screenshots_time` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file" ADD COLUMN     "screenshots_time" DECIMAL NOT NULL;
