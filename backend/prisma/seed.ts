/**
 * Carga inicial de datos para el entorno de desarrollo.
 *
 * Crea un usuario por cada rol previsto, los potreros del establecimiento, un
 * hato reducido de prueba, los protocolos del calendario sanitario y un
 * historial de pesajes y de eventos con el que ejercitar las consultas.
 *
 * Las fechas se calculan en días hacia atrás desde el momento de la carga, de
 * modo que el calendario produzca siempre una mezcla de tareas vencidas y
 * próximas sin depender de la fecha en que se ejecute. No debe ejecutarse en
 * producción.
 */
import {
  PrismaClient,
  Rol,
  Sexo,
  CategoriaAnimal,
  FaseManejo,
  TipoEventoPlan,
  TipoEventoSanitario,
} from '@prisma/client';
import { ulid } from 'ulid';
import * as argon2 from 'argon2';
import { estimarPeso } from '../src/pesajes/dominio/schaeffer';

const prisma = new PrismaClient();

const MS_DIA = 1000 * 60 * 60 * 24;

/** Día del almanaque, en UTC, situado tantos días antes de hoy. */
function haceDias(dias: number): Date {
  const d = new Date(Date.now() - dias * MS_DIA);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

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
    { caravana: 'A-101', sexo: Sexo.H, categoria: CategoriaAnimal.vaca, fase: FaseManejo.engorde, raza: 'Nelore', edadDias: 1970 },
    { caravana: 'A-102', sexo: Sexo.H, categoria: CategoriaAnimal.vaquillona, fase: FaseManejo.destete, raza: 'Brahman', edadDias: 770 },
    { caravana: 'A-103', sexo: Sexo.M, categoria: CategoriaAnimal.novillo, fase: FaseManejo.engorde, raza: 'Nelore', edadDias: 930 },
    { caravana: 'A-104', sexo: Sexo.M, categoria: CategoriaAnimal.ternero, fase: FaseManejo.crianza, raza: 'Criollo', edadDias: 105 },
    { caravana: 'A-105', sexo: Sexo.M, categoria: CategoriaAnimal.toro, fase: FaseManejo.engorde, raza: 'Santa Gertrudis', edadDias: 2130 },
  ];

  for (const [i, { edadDias, ...animal }] of hato.entries()) {
    const existente = await prisma.animal.findUnique({
      where: { caravana: animal.caravana },
    });
    if (!existente) {
      await prisma.animal.create({
        data: {
          idAnimal: ulid(),
          idUsuario: registrador.idUsuario,
          idPotrero: idsPotrero[i % idsPotrero.length],
          fechaNacimiento: haceDias(edadDias),
          ...animal,
        },
      });
    }
  }

  const porCaravana = new Map(
    (await prisma.animal.findMany()).map((a) => [a.caravana, a.idAnimal]),
  );

  // --- Protocolos del calendario sanitario ---------------------------------
  //
  // Reproducen el calendario que rige en la zona: la campaña oficial contra la
  // fiebre aftosa del SENASAG, que es obligatoria y semestral, y los
  // protocolos de rutina del establecimiento.

  const planes = [
    {
      nombre: 'Vacunación antiaftosa',
      tipoEvento: TipoEventoPlan.vacunacion,
      periodicidadDias: 180,
      categoria: null,
      descripcion:
        'Campaña oficial del SENASAG, obligatoria y de aplicación semestral a ' +
        'todo el hato.',
    },
    {
      nombre: 'Desparasitación interna',
      tipoEvento: TipoEventoPlan.desparasitacion,
      periodicidadDias: 120,
      categoria: null,
      descripcion: 'Antiparasitario de amplio espectro, cada cuatro meses.',
    },
    {
      nombre: 'Vacunación contra carbunclo sintomático',
      tipoEvento: TipoEventoPlan.vacunacion,
      periodicidadDias: 365,
      categoria: CategoriaAnimal.ternero,
      descripcion: 'Clostridiosis en terneros, revacunación anual.',
    },
    {
      nombre: 'Vacunación contra brucelosis',
      tipoEvento: TipoEventoPlan.vacunacion,
      periodicidadDias: 365,
      categoria: CategoriaAnimal.vaquillona,
      descripcion: 'Cepa RB51 en vaquillonas de reposición.',
    },
  ];

  const idsPlan = new Map<string, string>();
  for (const plan of planes) {
    const existente = await prisma.planSanitario.findFirst({
      where: { nombre: plan.nombre },
    });
    const idPlan = existente
      ? existente.idPlan
      : (await prisma.planSanitario.create({ data: { idPlan: ulid(), ...plan } }))
          .idPlan;
    idsPlan.set(plan.nombre, idPlan);
  }

  // --- Historial de pesajes ------------------------------------------------
  //
  // El novillo en engorde recibe una serie de tres mediciones espaciadas, que
  // es lo que permite ver la curva de crecimiento y la ganancia media diaria.
  // El peso no se carga: se calcula con la misma función que usa el servicio.

  const mediciones = [
    { caravana: 'A-103', dias: 120, perimetroToracico: 158, largoCorporal: 131 },
    { caravana: 'A-103', dias: 60, perimetroToracico: 168, largoCorporal: 138 },
    { caravana: 'A-103', dias: 5, perimetroToracico: 176, largoCorporal: 143 },
    { caravana: 'A-101', dias: 30, perimetroToracico: 186, largoCorporal: 152 },
    { caravana: 'A-105', dias: 18, perimetroToracico: 214, largoCorporal: 176 },
    { caravana: 'A-104', dias: 10, perimetroToracico: 94, largoCorporal: 78 },
  ];

  let pesajesCargados = 0;
  for (const m of mediciones) {
    const idAnimal = porCaravana.get(m.caravana);
    if (!idAnimal) continue;

    const fecha = haceDias(m.dias);
    const yaEsta = await prisma.pesaje.findFirst({ where: { idAnimal, fecha } });
    if (yaEsta) continue;

    const { pesoEstimado, constante } = estimarPeso(m);
    await prisma.pesaje.create({
      data: {
        idPesaje: ulid(),
        idAnimal,
        fecha,
        perimetroToracico: m.perimetroToracico,
        largoCorporal: m.largoCorporal,
        pesoEstimado,
        constante,
      },
    });
    pesajesCargados += 1;
  }

  // --- Historial sanitario -------------------------------------------------
  //
  // Las fechas están elegidas para que el calendario produzca las tres
  // situaciones: una tarea vencida, una próxima y una que todavía queda fuera
  // de la ventana de anticipación.

  const eventos = [
    { caravana: 'A-101', plan: 'Vacunación antiaftosa', dias: 200, producto: 'Aftogan bivalente', dosis: '5 ml' },
    { caravana: 'A-103', plan: 'Vacunación antiaftosa', dias: 165, producto: 'Aftogan bivalente', dosis: '5 ml' },
    { caravana: 'A-105', plan: 'Vacunación antiaftosa', dias: 40, producto: 'Aftogan bivalente', dosis: '5 ml' },
    { caravana: 'A-103', plan: 'Desparasitación interna', dias: 95, producto: 'Ivermectina 1%', dosis: '1 ml/50 kg' },
    { caravana: 'A-104', plan: 'Vacunación contra carbunclo sintomático', dias: 20, producto: 'Bacterina polivalente', dosis: '3 ml' },
  ];

  const veterinario = await prisma.usuario.findUniqueOrThrow({
    where: { email: 'veterinario@ganabol.bo' },
  });

  let eventosCargados = 0;
  for (const e of eventos) {
    const idAnimal = porCaravana.get(e.caravana);
    const idPlan = idsPlan.get(e.plan);
    if (!idAnimal || !idPlan) continue;

    const fecha = haceDias(e.dias);
    const yaEsta = await prisma.eventoSanitario.findFirst({
      where: { idAnimal, idPlan, fecha },
    });
    if (yaEsta) continue;

    await prisma.eventoSanitario.create({
      data: {
        idEvento: ulid(),
        idAnimal,
        idPlan,
        tipo: e.plan.startsWith('Desparasitación')
          ? TipoEventoSanitario.desparasitacion
          : TipoEventoSanitario.vacunacion,
        producto: e.producto,
        dosis: e.dosis,
        fecha,
        responsable: veterinario.nombre,
      },
    });
    eventosCargados += 1;
  }

  console.log(
    `Carga inicial completada: ${usuarios.length} usuarios, ` +
      `${potreros.length} potreros, ${hato.length} animales, ` +
      `${planes.length} protocolos, ${pesajesCargados} pesajes, ` +
      `${eventosCargados} eventos sanitarios.`,
  );
  console.log(
    'El calendario de alertas se genera con POST /sanidad/calendario.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
