/*
  Warnings:

  - You are about to drop the column `type` on the `notification` table. All the data in the column will be lost.
  - Added the required column `notification_type` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('error', 'success');

-- AlterTable
ALTER TABLE "file" ALTER COLUMN "video_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notification" DROP COLUMN "type",
ADD COLUMN     "notification_type" "NotificationType" NOT NULL;

-- DropEnum
DROP TYPE "Type";
