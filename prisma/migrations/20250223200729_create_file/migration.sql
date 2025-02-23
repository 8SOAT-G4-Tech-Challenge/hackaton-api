-- CreateEnum
CREATE TYPE "Status" AS ENUM ('initialized', 'processing', 'processed', 'error');

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "status" "Status" NOT NULL,
    "video_url" VARCHAR(255) NOT NULL,
    "images_compressed_url" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
