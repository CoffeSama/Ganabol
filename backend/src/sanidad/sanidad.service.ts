import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Alerta,
  EstadoAlerta,
  EventoSanitario,
  PlanSanitario,
  Prisma,
  TipoAlerta,
} from '@prisma/client';
import { ulid } from 'ulid';
import { PrismaService } from '../prisma/prisma.service';
import { CrearEventoDto } from './dto/crear-evento.dto';
import { CrearPlanDto } from './dto/crear-plan.dto';
import {
  AnimalProgramable,
  ProtocoloProgramable,
  TareaProgramada,
  aDiaUtc,
  limiteDeCierre,
  programar,
  protocoloQueCumple,
} from './dominio/calendario';

/** Conserva en el mapa la más reciente de las fechas vistas para una clave. */
function acumularMaximo(mapa: Map<string, Date>, clave: string, fecha: Date): void {
  const previa = mapa.get(clave);
  if (!previa || fecha > previa) mapa.set(clave, fecha);
}

/** Resultado de regenerar el calendario sanitario. */
export interface ResumenCalendario {
  alertasCreadas: number;
  alertasActualizadas: number;
  alertasRetiradas: number;
}

@Injectable()
export class SanidadService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Eventos sanitarios (RF5) ---------------------------------------------

  /**
   * Registra un evento sanitario y cierra las alertas que venía a cumplir.
   *
   * Las dos operaciones van en la misma transacción: si el cierre de la alerta
   * fallara después de registrar el evento, el productor seguiría viendo un
   * aviso pendiente de algo que ya aplicó, y volvería a aplicarlo.
   */
  async registrarEvento(dto: CrearEventoDto): Promise<EventoSanitario> {
    const existente = await this.prisma.eventoSanitario.findUnique({
      where: { idEvento: dto.idEvento },
    });
    if (existente) return existente;

    const animal = await this.prisma.animal.findFirst({
      where: { idAnimal: dto.idAnimal, eliminado: false },
    });
    if (!animal) throw new NotFoundException('Animal no encontrado');

    const fecha = aDiaUtc(new Date(dto.fecha));

    return this.prisma.$transaction(async (tx) => {
      const evento = await tx.eventoSanitario.create({
        data: {
          idEvento: dto.idEvento,
          idAnimal: dto.idAnimal,
          idPlan: dto.idPlan,
          tipo: dto.tipo,
          producto: dto.producto,
          dosis: dto.dosis,
          fecha,
          responsable: dto.responsable,
        },
      });

      await this.cerrarAlertasCumplidas(tx, evento);
      await this.registrarSync(tx, 'evento_sanitario', evento.idEvento, 'alta');
      return evento;
    });
  }

  /** Historial sanitario de un animal, del evento más reciente al más antiguo. */
  async historial(idAnimal: string): Promise<EventoSanitario[]> {
    const animal = await this.prisma.animal.findFirst({
      where: { idAnimal, eliminado: false },
    });
    if (!animal) throw new NotFoundException('Animal no encontrado');

    return this.prisma.eventoSanitario.findMany({
      where: { idAnimal, eliminado: false },
      orderBy: [{ fecha: 'desc' }, { actualizadoEn: 'desc' }],
    });
  }

  async eliminarEvento(idEvento: string): Promise<void> {
    const evento = await this.prisma.eventoSanitario.findFirst({
      where: { idEvento, eliminado: false },
    });
    if (!evento) throw new NotFoundException('Evento sanitario no encontrado');

    await this.prisma.$transaction(async (tx) => {
      await tx.eventoSanitario.update({
        where: { idEvento },
        data: { eliminado: true },
      });
      // Las alertas que este evento cerró vuelven a quedar pendientes: la
      // tarea no se cumplió, de modo que debe reaparecer en la bandeja.
      await tx.alerta.updateMany({
        where: { idEventoCierre: idEvento },
        data: { estado: EstadoAlerta.pendiente, idEventoCierre: null },
      });
      await this.registrarSync(tx, 'evento_sanitario', idEvento, 'baja');
    });
  }

  // --- Planes sanitarios ----------------------------------------------------

  async crearPlan(dto: CrearPlanDto): Promise<PlanSanitario> {
    const existente = await this.prisma.planSanitario.findUnique({
      where: { idPlan: dto.idPlan },
    });
    if (existente) return existente;

    return this.prisma.planSanitario.create({
      data: {
        idPlan: dto.idPlan,
        nombre: dto.nombre,
        categoria: dto.categoria,
        tipoEvento: dto.tipoEvento,
        periodicidadDias: dto.periodicidadDias,
        descripcion: dto.descripcion,
      },
    });
  }

  listarPlanes(): Promise<PlanSanitario[]> {
    return this.prisma.planSanitario.findMany({
      where: { eliminado: false },
      orderBy: { nombre: 'asc' },
    });
  }

  // --- Calendario de alertas (RF13) -----------------------------------------

  /**
   * Regenera el calendario de alertas de todo el hato.
   *
   * Es idempotente: ejecutarla dos veces seguidas no altera el resultado. Esa
   * propiedad es la que permite llamarla sin coordinación —al sincronizar, al
   * abrir la bandeja o desde una tarea programada— sin que las alertas se
   * acumulen por duplicado.
   *
   * @param hoy fecha de referencia; se recibe como parámetro para que el
   *   comportamiento sea comprobable con fechas fijas.
   */
  async regenerarCalendario(hoy: Date = new Date()): Promise<ResumenCalendario> {
    const [animales, protocolos] = await Promise.all([
      this.prisma.animal.findMany({
        where: { eliminado: false, estado: 'activo' },
        select: {
          idAnimal: true,
          categoria: true,
          fechaNacimiento: true,
          creadoEn: true,
        },
      }),
      this.prisma.planSanitario.findMany({ where: { eliminado: false } }),
    ]);

    if (protocolos.length === 0) {
      return { alertasCreadas: 0, alertasActualizadas: 0, alertasRetiradas: 0 };
    }

    const ultimos = await this.ultimoEventoPorProtocolo();

    const tareas: TareaProgramada[] = [];
    for (const animal of animales) {
      for (const protocolo of protocolos) {
        const tarea = programar(
          animal as AnimalProgramable,
          protocolo as ProtocoloProgramable,
          ultimos.anclaje(animal.idAnimal, protocolo),
          hoy,
        );
        if (tarea) tareas.push(tarea);
      }
    }

    return this.consolidarTareas(tareas);
  }

  /**
   * Alertas del calendario, de la más urgente a la menos urgente.
   *
   * Por omisión devuelve las abiertas —vencidas y pendientes—, que es lo que
   * el personal de campo necesita ver al empezar la jornada.
   */
  async listarAlertas(estado?: EstadoAlerta) {
    const alertas = await this.prisma.alerta.findMany({
      where: {
        eliminado: false,
        estado: estado ?? { in: [EstadoAlerta.vencida, EstadoAlerta.pendiente] },
      },
      orderBy: [{ fechaProgramada: 'asc' }],
      include: {
        animal: { select: { caravana: true, categoria: true, fase: true } },
        plan: { select: { nombre: true, tipoEvento: true } },
      },
    });

    return alertas;
  }

  /** Recuento de alertas abiertas por estado, para el resumen del hato. */
  async resumenAlertas() {
    const filas = await this.prisma.alerta.groupBy({
      by: ['estado'],
      where: { eliminado: false },
      _count: { idAlerta: true },
    });

    const recuento = { pendiente: 0, vencida: 0, atendida: 0 };
    for (const fila of filas) {
      recuento[fila.estado] = fila._count.idAlerta;
    }
    return recuento;
  }

  /** Cambios desde una marca temporal, para la sincronización incremental. */
  async cambiosDesde(desde: Date) {
    const [eventos, planes, alertas] = await Promise.all([
      this.prisma.eventoSanitario.findMany({
        where: { actualizadoEn: { gt: desde } },
        orderBy: { actualizadoEn: 'asc' },
      }),
      this.prisma.planSanitario.findMany({
        where: { actualizadoEn: { gt: desde } },
        orderBy: { actualizadoEn: 'asc' },
      }),
      this.prisma.alerta.findMany({
        where: { actualizadoEn: { gt: desde } },
        orderBy: { actualizadoEn: 'asc' },
      }),
    ]);

    return { eventos, planes, alertas, sincronizadoHasta: new Date() };
  }

  // --- Interno --------------------------------------------------------------

  /**
   * Fecha del último evento relevante para cada animal, consultable por
   * protocolo.
   *
   * Se resuelve en una sola consulta agrupada en lugar de una por animal y
   * protocolo: con un hato de varios cientos de animales y una docena de
   * protocolos, lo segundo serían miles de consultas por regeneración.
   */
  private async ultimoEventoPorProtocolo() {
    const filas = await this.prisma.eventoSanitario.groupBy({
      by: ['idAnimal', 'idPlan', 'tipo'],
      where: { eliminado: false },
      _max: { fecha: true },
    });

    // Dos índices sobre el mismo resultado: el que identifica el protocolo con
    // precisión, y el que agrupa por tipo los eventos registrados sin indicar
    // a qué protocolo responden.
    const porPlan = new Map<string, Date>();
    const porTipoSinPlan = new Map<string, Date>();

    for (const fila of filas) {
      const fecha = fila._max.fecha;
      if (!fecha) continue;

      if (fila.idPlan) {
        acumularMaximo(porPlan, `${fila.idAnimal}|${fila.idPlan}`, fecha);
      } else {
        acumularMaximo(porTipoSinPlan, `${fila.idAnimal}|${fila.tipo}`, fecha);
      }
    }

    return {
      /**
       * Fecha desde la que contar la periodicidad de un protocolo.
       *
       * Prevalece el evento que declara cumplir ese protocolo. A falta de uno,
       * se admite el evento del mismo tipo registrado sin protocolo: el
       * productor que anotó «vacuné a este animal» sin precisar contra qué
       * aportó información que conviene aprovechar antes que ignorarla.
       */
      anclaje(idAnimal: string, protocolo: { idPlan: string; tipoEvento: string }) {
        return (
          porPlan.get(`${idAnimal}|${protocolo.idPlan}`) ??
          porTipoSinPlan.get(`${idAnimal}|${protocolo.tipoEvento}`) ??
          null
        );
      },
    };
  }

  /**
   * Lleva el calendario calculado al estado almacenado.
   *
   * Una alerta abierta cuyo vencimiento se desplazó —porque el protocolo se
   * aplicó y la cuenta se reinició— se retira con baja lógica en lugar de
   * borrarse, para que la eliminación llegue a los dispositivos. Las alertas
   * ya atendidas no se tocan: son el historial del calendario.
   */
  private async consolidarTareas(
    tareas: TareaProgramada[],
  ): Promise<ResumenCalendario> {
    const abiertas = await this.prisma.alerta.findMany({
      where: {
        eliminado: false,
        estado: { in: [EstadoAlerta.pendiente, EstadoAlerta.vencida] },
        idPlan: { not: null },
      },
    });

    const vigentes = new Map(
      tareas.map((t) => [`${t.idAnimal}|${t.idPlan}`, t]),
    );

    const resumen: ResumenCalendario = {
      alertasCreadas: 0,
      alertasActualizadas: 0,
      alertasRetiradas: 0,
    };

    await this.prisma.$transaction(async (tx) => {
      const conservadas = new Set<string>();

      for (const alerta of abiertas) {
        const clave = `${alerta.idAnimal}|${alerta.idPlan}`;
        const tarea = vigentes.get(clave);

        const mismaFecha =
          tarea !== undefined &&
          alerta.fechaProgramada.getTime() === tarea.fechaProgramada.getTime();

        if (!mismaFecha) {
          await tx.alerta.update({
            where: { idAlerta: alerta.idAlerta },
            data: { eliminado: true },
          });
          resumen.alertasRetiradas += 1;
          continue;
        }

        conservadas.add(clave);
        if (alerta.estado !== tarea.estado) {
          await tx.alerta.update({
            where: { idAlerta: alerta.idAlerta },
            data: { estado: tarea.estado },
          });
          resumen.alertasActualizadas += 1;
        }
      }

      for (const [clave, tarea] of vigentes) {
        if (conservadas.has(clave)) continue;

        // La clave única (animal, plan, fecha) puede estar ocupada por una
        // alerta retirada o atendida de un ciclo anterior con el mismo
        // vencimiento. En ese caso se reactiva en lugar de insertar otra.
        await tx.alerta.upsert({
          where: {
            idAnimal_idPlan_fechaProgramada: {
              idAnimal: tarea.idAnimal,
              idPlan: tarea.idPlan,
              fechaProgramada: tarea.fechaProgramada,
            },
          },
          create: {
            idAlerta: ulid(),
            idAnimal: tarea.idAnimal,
            idPlan: tarea.idPlan,
            tipo: TipoAlerta.sanitaria,
            descripcion: tarea.descripcion,
            fechaProgramada: tarea.fechaProgramada,
            estado: tarea.estado,
          },
          update: {
            estado: tarea.estado,
            descripcion: tarea.descripcion,
            eliminado: false,
            idEventoCierre: null,
          },
        });
        resumen.alertasCreadas += 1;
      }
    });

    return resumen;
  }

  /**
   * Cierra las alertas que un evento sanitario viene a cumplir.
   *
   * Cuando el evento declara el protocolo que cumple, solo se cierra la alerta
   * de ese protocolo. Cuando no lo declara, el criterio es el tipo: un evento
   * de vacunación cierra las alertas de protocolos de vacunación del mismo
   * animal, que es lo más fiel que puede inferirse de lo registrado.
   *
   * En ambos casos solo se cierran las alertas que vencen dentro de la ventana
   * de anticipación contada desde el evento, para no arrastrar de paso el
   * vencimiento del ciclo siguiente.
   */
  private async cerrarAlertasCumplidas(
    tx: Prisma.TransactionClient,
    evento: EventoSanitario,
  ): Promise<void> {
    const protocolo = protocoloQueCumple(evento.tipo);
    if (protocolo === null) return;

    await tx.alerta.updateMany({
      where: {
        idAnimal: evento.idAnimal,
        eliminado: false,
        estado: { in: [EstadoAlerta.pendiente, EstadoAlerta.vencida] },
        fechaProgramada: { lte: limiteDeCierre(evento.fecha) },
        ...(evento.idPlan
          ? { idPlan: evento.idPlan }
          : { plan: { tipoEvento: protocolo } }),
      },
      data: { estado: EstadoAlerta.atendida, idEventoCierre: evento.idEvento },
    });
  }

  private async registrarSync(
    tx: Prisma.TransactionClient,
    entidad: string,
    idEntidad: string,
    operacion: 'alta' | 'modificacion' | 'baja',
  ): Promise<void> {
    await tx.registroSync.create({
      data: {
        idRegistro: ulid(),
        entidad,
        idEntidad,
        operacion,
        estado: 'sincronizado',
        marcaTiempo: new Date(),
      },
    });
  }
}
