-- AlterTable
ALTER TABLE "evento_sanitario" ADD COLUMN     "id_plan" CHAR(26);

-- CreateIndex
CREATE INDEX "evento_sanitario_id_animal_id_plan_fecha_idx" ON "evento_sanitario"("id_animal", "id_plan", "fecha");

-- AddForeignKey
ALTER TABLE "evento_sanitario" ADD CONSTRAINT "evento_sanitario_id_plan_fkey" FOREIGN KEY ("id_plan") REFERENCES "plan_sanitario"("id_plan") ON DELETE SET NULL ON UPDATE CASCADE;
