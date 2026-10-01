-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('administrador', 'personal_campo', 'veterinario', 'propietario');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('M', 'H');

-- CreateEnum
CREATE TYPE "CategoriaAnimal" AS ENUM ('ternero', 'vaquillona', 'novillo', 'vaca', 'toro');

-- CreateEnum
CREATE TYPE "FaseManejo" AS ENUM ('crianza', 'destete', 'engorde');

-- CreateEnum
CREATE TYPE "EstadoAnimal" AS ENUM ('activo', 'vendido', 'baja');

-- CreateEnum
CREATE TYPE "OperacionSync" AS ENUM ('alta', 'modificacion', 'baja');

-- CreateEnum
CREATE TYPE "EstadoSync" AS ENUM ('pendiente', 'sincronizado', 'conflicto');

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" CHAR(26) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'personal_campo',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso_en" TIMESTAMPTZ,
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "potrero" (
    "id_potrero" CHAR(26) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "superficie_ha" DECIMAL(8,2),
    "actualizado_en" TIMESTAMPTZ NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "potrero_pkey" PRIMARY KEY ("id_potrero")
);

-- CreateTable
CREATE TABLE "animal" (
    "id_animal" CHAR(26) NOT NULL,
    "id_usuario" CHAR(26) NOT NULL,
    "id_potrero" CHAR(26),
    "caravana" VARCHAR(20) NOT NULL,
    "categoria" "CategoriaAnimal" NOT NULL,
    "raza" VARCHAR(40),
    "sexo" "Sexo" NOT NULL,
    "fecha_nacimiento" DATE,
    "fase" "FaseManejo" NOT NULL,
    "estado" "EstadoAnimal" NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id_animal")
);

-- CreateTable
CREATE TABLE "registro_sync" (
    "id_registro" CHAR(26) NOT NULL,
    "entidad" VARCHAR(30) NOT NULL,
    "id_entidad" CHAR(26) NOT NULL,
    "operacion" "OperacionSync" NOT NULL,
    "estado" "EstadoSync" NOT NULL DEFAULT 'pendiente',
    "marca_tiempo" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "registro_sync_pkey" PRIMARY KEY ("id_registro")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "potrero_eliminado_idx" ON "potrero"("eliminado");

-- CreateIndex
CREATE UNIQUE INDEX "animal_caravana_key" ON "animal"("caravana");

-- CreateIndex
CREATE INDEX "animal_estado_eliminado_idx" ON "animal"("estado", "eliminado");

-- CreateIndex
CREATE INDEX "animal_actualizado_en_idx" ON "animal"("actualizado_en");

-- CreateIndex
CREATE INDEX "animal_id_potrero_idx" ON "animal"("id_potrero");

-- CreateIndex
CREATE INDEX "registro_sync_entidad_estado_idx" ON "registro_sync"("entidad", "estado");

-- CreateIndex
CREATE INDEX "registro_sync_marca_tiempo_idx" ON "registro_sync"("marca_tiempo");

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal" ADD CONSTRAINT "animal_id_potrero_fkey" FOREIGN KEY ("id_potrero") REFERENCES "potrero"("id_potrero") ON DELETE SET NULL ON UPDATE CASCADE;
