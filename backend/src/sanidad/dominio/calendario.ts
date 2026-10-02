/**
 * Calendario sanitario: cálculo de las fechas en que vence cada protocolo
 * (RF13).
 *
 * El cálculo es una función de la fecha del último evento, de la periodicidad
 * del protocolo y de la fecha actual. No consulta la base ni depende del
 * framework, de modo que puede comprobarse con fechas fijas en lugar de
 * depender del día en que se ejecuten las pruebas.
 */

import {
  EstadoAlerta,
  TipoEventoPlan,
  TipoEventoSanitario,
} from '@prisma/client';

/**
 * Protocolo que cumple un evento sanitario, si alguno.
 *
 * Los tipos de evento y los tipos de protocolo son dominios distintos: todo
 * protocolo se cumple con un evento, pero no todo evento cumple un protocolo.
 * El diagnóstico se registra porque ocurrió, no porque estuviera previsto, de
 * modo que no cierra ninguna tarea del calendario.
 */
export function protocoloQueCumple(
  tipo: TipoEventoSanitario,
): TipoEventoPlan | null {
  switch (tipo) {
    case TipoEventoSanitario.vacunacion:
      return TipoEventoPlan.vacunacion;
    case TipoEventoSanitario.desparasitacion:
      return TipoEventoPlan.desparasitacion;
    case TipoEventoSanitario.tratamiento:
      return TipoEventoPlan.tratamiento;
    case TipoEventoSanitario.diagnostico:
      return null;
  }
}

/**
 * Días de anticipación con que una tarea se considera próxima.
 *
 * Una alerta que apareciera el mismo día del vencimiento sería inútil en el
 * campo: el productor necesita margen para conseguir el producto y organizar
 * el encierro de los animales.
 */
export const VENTANA_ANTICIPACION_DIAS = 30;

export const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

/** Datos mínimos de un animal para programarle un protocolo. */
export interface AnimalProgramable {
  idAnimal: string;
  categoria: string;
  fechaNacimiento: Date | null;
  creadoEn: Date;
}

/** Datos mínimos de un protocolo sanitario. */
export interface ProtocoloProgramable {
  idPlan: string;
  nombre: string;
  /** Categoría a la que aplica; null significa que aplica a todo el hato. */
  categoria: string | null;
  periodicidadDias: number;
}

export interface TareaProgramada {
  idAnimal: string;
  idPlan: string;
  descripcion: string;
  fechaProgramada: Date;
  estado: EstadoAlerta;
}

/** Suma días a una fecha, normalizando a medianoche UTC. */
export function sumarDias(fecha: Date, dias: number): Date {
  return aDiaUtc(new Date(fecha.getTime() + dias * MILISEGUNDOS_POR_DIA));
}

/**
 * Normaliza una marca temporal al día que representa, en UTC.
 *
 * Las fechas del calendario son días del almanaque, no instantes: un protocolo
 * vence «el 15 de octubre», no «el 15 de octubre a las 14:32». Fijarlas a
 * medianoche UTC evita que el desplazamiento horario del dispositivo corra un
 * vencimiento un día hacia atrás o hacia adelante.
 */
export function aDiaUtc(fecha: Date): Date {
  return new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()),
  );
}

/**
 * Fecha a partir de la cual se cuenta la periodicidad de un protocolo para un
 * animal.
 *
 * Si el protocolo ya se le aplicó, la cuenta parte del último evento. Si no, el
 * animal nunca lo recibió y la referencia es su nacimiento, que es cuando
 * empieza su calendario sanitario. Para un animal cuya fecha de nacimiento no
 * se conoce —habitual en animales comprados— se recurre a la fecha de alta en
 * el sistema, que es el primer momento del que hay constancia.
 */
export function fechaDeReferencia(
  animal: AnimalProgramable,
  ultimoEvento: Date | null,
): Date {
  return aDiaUtc(ultimoEvento ?? animal.fechaNacimiento ?? animal.creadoEn);
}

/**
 * Adelanta un vencimiento inferido hasta la fecha de alta del animal, si
 * quedaba antes.
 *
 * Un animal adulto dado de alta hoy, sin historial cargado, arrojaría de otro
 * modo un vencimiento situado años atrás: su nacimiento más la periodicidad del
 * protocolo. Esa fecha afirma algo que el sistema no sabe. La falta de registro
 * no prueba que el protocolo nunca se aplicara, sino que el sistema no estaba
 * en uso, y una alerta «vencida hace cinco años» sobre un animal recién
 * cargado es ruido que el productor aprende a ignorar.
 *
 * El vencimiento se sitúa entonces en el alta: a partir de ahí el sistema sí
 * responde por el animal, y la tarea aparece como pendiente del día en lugar
 * de como un descuido antiguo.
 *
 * Solo corresponde aplicarlo a una referencia inferida del nacimiento o del
 * alta. Un vencimiento derivado de un evento registrado se muestra tal cual,
 * porque ahí sí hay constancia de lo que ocurrió y cuándo.
 */
export function noAntesDelAlta(
  fechaProgramada: Date,
  animal: AnimalProgramable,
): Date {
  const alta = aDiaUtc(animal.creadoEn);
  return fechaProgramada < alta ? alta : fechaProgramada;
}

/** Indica si un protocolo aplica a la categoría de un animal. */
export function aplicaAlAnimal(
  protocolo: ProtocoloProgramable,
  animal: AnimalProgramable,
): boolean {
  return protocolo.categoria === null || protocolo.categoria === animal.categoria;
}

/**
 * Programa un protocolo para un animal.
 *
 * Devuelve null cuando el vencimiento queda más allá de la ventana de
 * anticipación: la tarea existe, pero todavía no es asunto del productor y
 * llenar la bandeja de avisos lejanos la vuelve inservible.
 */
export function programar(
  animal: AnimalProgramable,
  protocolo: ProtocoloProgramable,
  ultimoEvento: Date | null,
  hoy: Date,
): TareaProgramada | null {
  if (!aplicaAlAnimal(protocolo, animal)) return null;

  const referencia = fechaDeReferencia(animal, ultimoEvento);
  const vencimiento = sumarDias(referencia, protocolo.periodicidadDias);

  // El piso se aplica solo cuando la referencia es inferida. Si hay un evento
  // registrado, su fecha es evidencia real y el vencimiento que de ella se
  // deriva debe mostrarse tal cual, aunque haya quedado atrás.
  const fechaProgramada =
    ultimoEvento === null ? noAntesDelAlta(vencimiento, animal) : vencimiento;

  const dia = aDiaUtc(hoy);

  const diasRestantes =
    (fechaProgramada.getTime() - dia.getTime()) / MILISEGUNDOS_POR_DIA;
  if (diasRestantes > VENTANA_ANTICIPACION_DIAS) return null;

  return {
    idAnimal: animal.idAnimal,
    idPlan: protocolo.idPlan,
    descripcion: protocolo.nombre,
    fechaProgramada,
    estado: diasRestantes < 0 ? EstadoAlerta.vencida : EstadoAlerta.pendiente,
  };
}

/**
 * Fecha límite hasta la que un evento cierra las alertas de su mismo tipo.
 *
 * Un evento registrado antes del vencimiento debe cerrar la tarea que venía a
 * cumplir: el productor que vacuna una semana antes de la fecha no quiere
 * seguir viendo el aviso. El límite es el de la propia ventana de anticipación,
 * para no cerrar de paso un vencimiento del ciclo siguiente.
 */
export function limiteDeCierre(fechaEvento: Date): Date {
  return sumarDias(fechaEvento, VENTANA_ANTICIPACION_DIAS);
}
