-- AlterTable
ALTER TABLE "smtp_configurations" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "email_templates" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "email_columns" TEXT[],
    "data" JSONB NOT NULL DEFAULT '{}',
    "user_id" UUID NOT NULL,
    "configuration_id" UUID,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_templates_user_id_idx" ON "email_templates"("user_id");

-- CreateIndex
CREATE INDEX "email_templates_configuration_id_idx" ON "email_templates"("configuration_id");

-- CreateIndex
CREATE INDEX "smtp_configurations_user_id_idx" ON "smtp_configurations"("user_id");

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "smtp_configurations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
