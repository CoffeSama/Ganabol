-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMINISTRADOR', 'PROPIETARIO', 'PERSONAL_CAMPO', 'VETERINARIO');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MACHO', 'HEMBRA');

-- CreateEnum
CREATE TYPE "CategoriaAnimal" AS ENUM ('TERNERO', 'TERNERA', 'NOVILLO', 'VAQUILLA', 'TORO', 'VACA', 'BUEY');

-- CreateEnum
CREATE TYPE "FaseProductiva" AS ENUM ('CRIANZA', 'DESTETE', 'ENGORDE');

-- CreateEnum
CREATE TYPE "EstadoAnimal" AS ENUM ('ACTIVO', 'VENDIDO', 'MUERTO', 'EXTRAVIADO');

-- CreateTable
CREATE TABLE "predio" (
    "id" VARCHAR(26) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "ubicacion" VARCHAR(200),
    "superficie_ha" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "predio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" VARCHAR(26) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "password_hash" VARCHAR(72) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'PERSONAL_CAMPO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "predio_id" VARCHAR(26),
    "ultimo_acceso_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal" (
    "id" VARCHAR(26) NOT NULL,
    "caravana" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(80),
    "sexo" "Sexo" NOT NULL,
    "raza" VARCHAR(60),
    "fecha_nacimiento" DATE,
    "categoria" "CategoriaAnimal" NOT NULL,
    "fase" "FaseProductiva" NOT NULL DEFAULT 'CRIANZA',
    "estado" "EstadoAnimal" NOT NULL DEFAULT 'ACTIVO',
    "madre_id" VARCHAR(26),
    "predio_id" VARCHAR(26) NOT NULL,
    "registrado_por_id" VARCHAR(26),
    "observaciones" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "predio_deleted_at_idx" ON "predio"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_predio_id_idx" ON "usuario"("predio_id");

-- CreateIndex
CREATE INDEX "usuario_deleted_at_idx" ON "usuario"("deleted_at");

-- CreateIndex
CREATE INDEX "animal_predio_id_estado_idx" ON "animal"("predio_id", "estado");

-- CreateIndex
CREATE INDEX "animal_updated_at_idx" ON "animal"("updated_at");

-- CreateIndex
CREATE INDEX "animal_deleted_at_idx" ON "animal"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "animal_predio_id_caravana_key" ON "animal"("predio_id", "caravana");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_predio_id_fkey" FOREIGN KEY ("predio_id") REFERENCES "predio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_madre_id_fkey" FOREIGN KEY ("madre_id") REFERENCES "animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_predio_id_fkey" FOREIGN KEY ("predio_id") REFERENCES "predio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
