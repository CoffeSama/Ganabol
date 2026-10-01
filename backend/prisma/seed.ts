/**
 * Carga inicial de datos para el entorno de desarrollo.
 *
 * Crea un usuario por cada rol previsto, los potreros del establecimiento y un
 * hato reducido de prueba. No debe ejecutarse en producción.
 */
import {
  PrismaClient,
  Rol,
  Sexo,
  CategoriaAnimal,
  FaseManejo,
} from '@prisma/client';
import { ulid } from 'ulid';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Ganabol2026', {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const usuarios = [
    { nombre: 'Administrador del sistema', email: 'admin@ganabol.bo', rol: Rol.administrador },
    { nombre: 'Propietario del establecimiento', email: 'propietario@ganabol.bo', rol: Rol.propietario },
    { nombre: 'Personal de campo', email: 'campo@ganabol.bo', rol: Rol.personal_campo },
    { nombre: 'Veterinario', email: 'veterinario@ganabol.bo', rol: Rol.veterinario },
  ];

  for (const u of usuarios) {
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: { idUsuario: ulid(), ...u, passwordHash },
    });
  }

  const registrador = await prisma.usuario.findUniqueOrThrow({
    where: { email: 'campo@ganabol.bo' },
  });

  const potreros = [
    { nombre: 'Potrero Norte', superficieHa: 120.5 },
    { nombre: 'Potrero Sur', superficieHa: 98.0 },
    { nombre: 'Corral de manejo', superficieHa: 2.5 },
  ];

  const idsPotrero: string[] = [];
  for (const p of potreros) {
    const existente = await prisma.potrero.findFirst({ where: { nombre: p.nombre } });
    if (existente) {
      idsPotrero.push(existente.idPotrero);
    } else {
      const creado = await prisma.potrero.create({
        data: { idPotrero: ulid(), ...p },
      });
      idsPotrero.push(creado.idPotrero);
    }
  }

  const hato = [
    { caravana: 'A-101', sexo: Sexo.H, categoria: CategoriaAnimal.vaca, fase: FaseManejo.engorde, raza: 'Nelore' },
    { caravana: 'A-102', sexo: Sexo.H, categoria: CategoriaAnimal.vaquillona, fase: FaseManejo.destete, raza: 'Brahman' },
    { caravana: 'A-103', sexo: Sexo.M, categoria: CategoriaAnimal.novillo, fase: FaseManejo.engorde, raza: 'Nelore' },
    { caravana: 'A-104', sexo: Sexo.M, categoria: CategoriaAnimal.ternero, fase: FaseManejo.crianza, raza: 'Criollo' },
    { caravana: 'A-105', sexo: Sexo.M, categoria: CategoriaAnimal.toro, fase: FaseManejo.engorde, raza: 'Santa Gertrudis' },
  ];

  for (const [i, animal] of hato.entries()) {
    const existente = await prisma.animal.findUnique({
      where: { caravana: animal.caravana },
    });
    if (!existente) {
      await prisma.animal.create({
        data: {
          idAnimal: ulid(),
          idUsuario: registrador.idUsuario,
          idPotrero: idsPotrero[i % idsPotrero.length],
          ...animal,
        },
      });
    }
  }

  console.log(
    `Carga inicial completada: ${usuarios.length} usuarios, ` +
      `${potreros.length} potreros, ${hato.length} animales.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
