-- CreateTable
CREATE TABLE "smtp_configurations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "smtp_configurations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "smtp_configurations" ADD CONSTRAINT "smtp_configurations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
