/**
 * Carga inicial de datos para el entorno de desarrollo.
 *
 * Crea el establecimiento ganadero del caso de estudio, un usuario por rol y
 * un pequeño hato de prueba. No debe ejecutarse en producción.
 */
import { PrismaClient, Rol, Sexo, CategoriaAnimal, FaseProductiva } from '@prisma/client';
import { ulid } from 'ulid';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Ganabol2026', 10);

  const predio = await prisma.predio.upsert({
    where: { id: '01JGKQZ8XW4P7N2M5R8T3V6Y00' },
    update: {},
    create: {
      id: '01JGKQZ8XW4P7N2M5R8T3V6Y00',
      nombre: 'Establecimiento ganadero Sabayones',
      ubicacion: 'Zona del Izozog, Chaco cruceño, Santa Cruz',
      superficieHa: 450.0,
    },
  });

  const usuarios = [
    { email: 'admin@ganabol.bo', nombre: 'Administrador del sistema', rol: Rol.ADMINISTRADOR },
    { email: 'propietario@ganabol.bo', nombre: 'Propietario del predio', rol: Rol.PROPIETARIO },
    { email: 'campo@ganabol.bo', nombre: 'Personal de campo', rol: Rol.PERSONAL_CAMPO },
    { email: 'veterinario@ganabol.bo', nombre: 'Veterinario', rol: Rol.VETERINARIO },
  ];

  for (const u of usuarios) {
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: { id: ulid(), ...u, passwordHash, predioId: predio.id },
    });
  }

  const hato = [
    { caravana: 'A-101', sexo: Sexo.HEMBRA, categoria: CategoriaAnimal.VACA, fase: FaseProductiva.ENGORDE, raza: 'Nelore' },
    { caravana: 'A-102', sexo: Sexo.HEMBRA, categoria: CategoriaAnimal.VAQUILLA, fase: FaseProductiva.DESTETE, raza: 'Brahman' },
    { caravana: 'A-103', sexo: Sexo.MACHO, categoria: CategoriaAnimal.NOVILLO, fase: FaseProductiva.ENGORDE, raza: 'Nelore' },
    { caravana: 'A-104', sexo: Sexo.MACHO, categoria: CategoriaAnimal.TERNERO, fase: FaseProductiva.CRIANZA, raza: 'Criollo' },
    { caravana: 'A-105', sexo: Sexo.HEMBRA, categoria: CategoriaAnimal.TERNERA, fase: FaseProductiva.CRIANZA, raza: 'Santa Gertrudis' },
  ];

  for (const animal of hato) {
    const existe = await prisma.animal.findFirst({
      where: { predioId: predio.id, caravana: animal.caravana },
    });
    if (!existe) {
      await prisma.animal.create({
        data: { id: ulid(), ...animal, predioId: predio.id },
      });
    }
  }

  console.log(`Carga inicial completada: ${usuarios.length} usuarios, ${hato.length} animales.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
