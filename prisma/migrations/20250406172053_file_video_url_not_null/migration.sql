/*
  Warnings:

  - Made the column `video_url` on table `file` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "file" ALTER COLUMN "video_url" SET NOT NULL;
