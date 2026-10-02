/**
 * Estimación morfométrica del peso vivo bovino (RF4).
 *
 * El peso se estima con la fórmula de Schaeffer, que relaciona el perímetro
 * torácico y el largo corporal con el peso vivo:
 *
 *     PV = (PT² × LC) / k
 *
 * donde PT es el perímetro torácico en centímetros, LC el largo corporal en
 * centímetros, PV el peso vivo en kilogramos y k la constante de ajuste.
 *
 * El módulo no depende del framework ni de la base de datos: es una función
 * del dominio y se comprueba como tal. La misma expresión está implementada en
 * el cliente móvil, que necesita calcular el peso sin conexión; que ambas
 * implementaciones coincidan se verifica con los mismos casos de prueba.
 */

/**
 * Constante de la fórmula para medidas en centímetros y peso en kilogramos,
 * según la formulación clásica recogida por Wangchuk et al. (2018).
 *
 * Las fórmulas morfométricas clásicas se derivaron en razas europeas, de
 * conformación distinta a la del ganado cebú predominante en el Chaco cruceño,
 * de modo que esta constante es el punto de partida y no el valor definitivo:
 * el diseño prevé calibrarla contra una muestra de referencia pesada. Por eso
 * la constante es un parámetro de la función y se almacena junto a cada pesaje,
 * en lugar de estar fijada en el cálculo.
 */
export const CONSTANTE_BIBLIOGRAFICA = 10838;

/**
 * Rangos de medida considerados plausibles para ganado bovino.
 *
 * El flujo del caso de uso CU-04 rechaza las medidas fuera de rango y pide
 * repetir la medición, porque un error de transcripción en el campo —una cinta
 * mal leída, un dígito de más— produce un peso absurdo que luego contamina el
 * historial de crecimiento del animal. Los límites cubren desde un ternero
 * recién nacido hasta un toro adulto de la zona, con holgura.
 */
export const RANGOS = {
  perimetroToracico: { min: 60, max: 250 },
  largoCorporal: { min: 50, max: 200 },
  pesoEstimado: { min: 20, max: 1200 },
} as const;

export type CampoMedida = keyof typeof RANGOS;

export class MedidaFueraDeRangoError extends Error {
  constructor(
    readonly campo: CampoMedida,
    readonly valor: number,
  ) {
    const { min, max } = RANGOS[campo];
    super(
      `El valor ${valor} de ${ETIQUETAS[campo]} está fuera del rango plausible ` +
        `(${min} a ${max} ${campo === 'pesoEstimado' ? 'kg' : 'cm'}). ` +
        'Repita la medición.',
    );
    this.name = 'MedidaFueraDeRangoError';
  }
}

const ETIQUETAS: Record<CampoMedida, string> = {
  perimetroToracico: 'perímetro torácico',
  largoCorporal: 'largo corporal',
  pesoEstimado: 'peso estimado',
};

export interface MedidasMorfometricas {
  /** Perímetro torácico en centímetros, medido justo detrás de la paleta. */
  perimetroToracico: number;
  /** Largo corporal en centímetros. */
  largoCorporal: number;
}

export interface PesoEstimado {
  /** Peso vivo en kilogramos, redondeado a dos decimales. */
  pesoEstimado: number;
  /** Constante con la que se obtuvo el valor. */
  constante: number;
}

/**
 * Estima el peso vivo a partir de las medidas corporales.
 *
 * Valida los rangos antes de calcular y también el resultado: una combinación
 * de medidas individualmente plausibles puede arrojar un peso que no lo es.
 *
 * @throws {MedidaFueraDeRangoError} si una medida o el resultado salen de rango.
 */
export function estimarPeso(
  medidas: MedidasMorfometricas,
  constante: number = CONSTANTE_BIBLIOGRAFICA,
): PesoEstimado {
  if (!(constante > 0)) {
    throw new RangeError('La constante de la fórmula debe ser positiva');
  }

  verificarRango('perimetroToracico', medidas.perimetroToracico);
  verificarRango('largoCorporal', medidas.largoCorporal);

  const bruto =
    (medidas.perimetroToracico * medidas.perimetroToracico * medidas.largoCorporal) /
    constante;
  const pesoEstimado = redondear(bruto);

  verificarRango('pesoEstimado', pesoEstimado);

  return { pesoEstimado, constante };
}

/**
 * Constante que mejor ajusta la fórmula a una muestra de animales pesados.
 *
 * Es el procedimiento de calibración que el diseño exige antes de dar el peso
 * estimado por válido para el ganado de la zona.
 *
 * La fórmula afirma que el producto PT² × LC es proporcional al peso vivo, con
 * k como factor de proporcionalidad. Ajustar k es entonces una regresión lineal
 * sin término constante del producto sobre el peso real, cuyo estimador de
 * mínimos cuadrados es:
 *
 *     k = Σ(PT² × LC × PR) / Σ(PR²)
 *
 * Se obliga a que la recta pase por el origen porque un animal de peso nulo no
 * tiene medidas: un término constante ajustaría mejor la muestra a costa de
 * describir algo que no existe.
 *
 * @param muestra medidas corporales de cada animal junto a su peso real pesado.
 */
export function calibrarConstante(
  muestra: ReadonlyArray<MedidasMorfometricas & { pesoReal: number }>,
): number {
  if (muestra.length === 0) {
    throw new RangeError('La calibración requiere al menos un animal pesado');
  }

  let sumaProductoPeso = 0;
  let sumaPesoCuadrado = 0;

  for (const animal of muestra) {
    if (!(animal.pesoReal > 0)) {
      throw new RangeError('El peso real de referencia debe ser positivo');
    }
    const producto =
      animal.perimetroToracico * animal.perimetroToracico * animal.largoCorporal;
    sumaProductoPeso += producto * animal.pesoReal;
    sumaPesoCuadrado += animal.pesoReal * animal.pesoReal;
  }

  return redondear(sumaProductoPeso / sumaPesoCuadrado);
}

/**
 * Error medio absoluto porcentual de la fórmula frente a una muestra pesada.
 *
 * Es la medida con la que el criterio de aceptación del sistema se declara
 * cumplido o incumplido: el objetivo es un error no mayor al ocho por ciento.
 */
export function errorMedioAbsoluto(
  muestra: ReadonlyArray<MedidasMorfometricas & { pesoReal: number }>,
  constante: number = CONSTANTE_BIBLIOGRAFICA,
): number {
  if (muestra.length === 0) {
    throw new RangeError('El cálculo del error requiere al menos un animal pesado');
  }

  const suma = muestra.reduce((acumulado, animal) => {
    const { pesoEstimado } = estimarPeso(animal, constante);
    return acumulado + Math.abs(pesoEstimado - animal.pesoReal) / animal.pesoReal;
  }, 0);

  return redondear((suma / muestra.length) * 100);
}

/**
 * Ganancia media diaria entre dos pesajes, en kilogramos por día.
 *
 * Es el indicador que permite seguir la curva de crecimiento durante el
 * engorde. Devuelve null cuando las dos mediciones son del mismo día, porque
 * entonces el dato no existe en lugar de valer cero.
 */
export function gananciaMediaDiaria(
  anterior: { fecha: Date; pesoEstimado: number },
  actual: { fecha: Date; pesoEstimado: number },
): number | null {
  const dias =
    (actual.fecha.getTime() - anterior.fecha.getTime()) / (1000 * 60 * 60 * 24);
  if (dias <= 0) return null;

  return redondear((actual.pesoEstimado - anterior.pesoEstimado) / dias);
}

function verificarRango(campo: CampoMedida, valor: number): void {
  const { min, max } = RANGOS[campo];
  if (!Number.isFinite(valor) || valor < min || valor > max) {
    throw new MedidaFueraDeRangoError(campo, valor);
  }
}

/** Redondeo a dos decimales, la precisión con que la base almacena el valor. */
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
