-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_file_id_fkey";

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
