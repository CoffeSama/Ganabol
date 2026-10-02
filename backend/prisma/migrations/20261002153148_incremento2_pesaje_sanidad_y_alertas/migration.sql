-- CreateEnum
CREATE TYPE "TipoEventoSanitario" AS ENUM ('vacunacion', 'desparasitacion', 'tratamiento', 'diagnostico');

-- CreateEnum
CREATE TYPE "TipoEventoPlan" AS ENUM ('vacunacion', 'desparasitacion', 'tratamiento');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('sanitaria', 'reproductiva');

-- CreateEnum
CREATE TYPE "EstadoAlerta" AS ENUM ('pendiente', 'atendida', 'vencida');

-- CreateTable
CREATE TABLE "pesaje" (
    "id_pesaje" CHAR(26) NOT NULL,
    "id_animal" CHAR(26) NOT NULL,
    "fecha" DATE NOT NULL,
    "perimetro_toracico" DECIMAL(6,2) NOT NULL,
    "largo_corporal" DECIMAL(6,2) NOT NULL,
    "peso_estimado" DECIMAL(6,2) NOT NULL,
    "constante" DECIMAL(8,2) NOT NULL,
    "actualizado_en" TIMESTAMPTZ NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pesaje_pkey" PRIMARY KEY ("id_pesaje")
);

-- CreateTable
CREATE TABLE "evento_sanitario" (
    "id_evento" CHAR(26) NOT NULL,
    "id_animal" CHAR(26) NOT NULL,
    "tipo" "TipoEventoSanitario" NOT NULL,
    "producto" VARCHAR(100),
    "dosis" VARCHAR(40),
    "fecha" DATE NOT NULL,
    "responsable" VARCHAR(120),
    "actualizado_en" TIMESTAMPTZ NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "evento_sanitario_pkey" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "plan_sanitario" (
    "id_plan" CHAR(26) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "categoria" "CategoriaAnimal",
    "tipo_evento" "TipoEventoPlan" NOT NULL,
    "descripcion" VARCHAR(200),
    "periodicidad_dias" INTEGER NOT NULL,
    "actualizado_en" TIMESTAMPTZ NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "plan_sanitario_pkey" PRIMARY KEY ("id_plan")
);

-- CreateTable
CREATE TABLE "alerta" (
    "id_alerta" CHAR(26) NOT NULL,
    "id_animal" CHAR(26) NOT NULL,
    "id_plan" CHAR(26),
    "id_evento_cierre" CHAR(26),
    "tipo" "TipoAlerta" NOT NULL,
    "descripcion" VARCHAR(200),
    "fecha_programada" DATE NOT NULL,
    "estado" "EstadoAlerta" NOT NULL DEFAULT 'pendiente',
    "actualizado_en" TIMESTAMPTZ NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alerta_pkey" PRIMARY KEY ("id_alerta")
);

-- CreateIndex
CREATE INDEX "pesaje_id_animal_fecha_idx" ON "pesaje"("id_animal", "fecha");

-- CreateIndex
CREATE INDEX "pesaje_actualizado_en_idx" ON "pesaje"("actualizado_en");

-- CreateIndex
CREATE INDEX "evento_sanitario_id_animal_fecha_idx" ON "evento_sanitario"("id_animal", "fecha");

-- CreateIndex
CREATE INDEX "evento_sanitario_actualizado_en_idx" ON "evento_sanitario"("actualizado_en");

-- CreateIndex
CREATE INDEX "plan_sanitario_eliminado_idx" ON "plan_sanitario"("eliminado");

-- CreateIndex
CREATE INDEX "alerta_estado_fecha_programada_idx" ON "alerta"("estado", "fecha_programada");

-- CreateIndex
CREATE INDEX "alerta_actualizado_en_idx" ON "alerta"("actualizado_en");

-- CreateIndex
CREATE UNIQUE INDEX "alerta_id_animal_id_plan_fecha_programada_key" ON "alerta"("id_animal", "id_plan", "fecha_programada");

-- AddForeignKey
ALTER TABLE "pesaje" ADD CONSTRAINT "pesaje_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "animal"("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_sanitario" ADD CONSTRAINT "evento_sanitario_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "animal"("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "animal"("id_animal") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_id_plan_fkey" FOREIGN KEY ("id_plan") REFERENCES "plan_sanitario"("id_plan") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_id_evento_cierre_fkey" FOREIGN KEY ("id_evento_cierre") REFERENCES "evento_sanitario"("id_evento") ON DELETE SET NULL ON UPDATE CASCADE;
