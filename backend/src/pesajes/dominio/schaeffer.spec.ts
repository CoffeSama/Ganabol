/**
 * Pruebas de la estimación morfométrica del peso (RF4).
 *
 * El grupo «coincidencia con la implementación del cliente» es el que sostiene
 * a los demás: la fórmula está escrita dos veces, en TypeScript para la
 * consolidación y en Dart para el cálculo en el campo, y si no coinciden al
 * decimal el peso que el productor vio cambiaría al sincronizar. Los valores
 * esperados son los mismos que afirma la prueba del cliente, escritos como
 * constantes, de modo que una desviación en cualquiera de los dos lados falla.
 */
import {
  CONSTANTE_BIBLIOGRAFICA,
  MedidaFueraDeRangoError,
  RANGOS,
  calibrarConstante,
  errorMedioAbsoluto,
  estimarPeso,
  gananciaMediaDiaria,
} from './schaeffer';

describe('coincidencia con la implementación del cliente', () => {
  const casos: Array<[number, number, number]> = [
    [180, 150, 448.42],
    [176, 143, 408.71],
    [168, 138, 359.38],
    [158, 131, 301.74],
    [186, 152, 485.2],
    [214, 176, 743.69],
    [94, 78, 63.59],
  ];

  it.each(casos)(
    'PT %p cm y LC %p cm estiman %p kg',
    (perimetroToracico, largoCorporal, esperado) => {
      const { pesoEstimado } = estimarPeso({ perimetroToracico, largoCorporal });
      expect(pesoEstimado).toBe(esperado);
    },
  );
});

describe('fórmula de Schaeffer', () => {
  it('aplica PV = (PT² × LC) / k', () => {
    const { pesoEstimado } = estimarPeso({
      perimetroToracico: 180,
      largoCorporal: 150,
    });
    expect(pesoEstimado).toBeCloseTo((180 * 180 * 150) / 10838, 2);
  });

  it('devuelve la constante con que se calculó', () => {
    const { constante } = estimarPeso({
      perimetroToracico: 180,
      largoCorporal: 150,
    });
    expect(constante).toBe(CONSTANTE_BIBLIOGRAFICA);
  });

  it('una constante menor estima un peso mayor', () => {
    const biblio = estimarPeso({ perimetroToracico: 180, largoCorporal: 150 });
    const menor = estimarPeso(
      { perimetroToracico: 180, largoCorporal: 150 },
      10000,
    );
    expect(menor.pesoEstimado).toBeGreaterThan(biblio.pesoEstimado);
  });

  it('rechaza una constante no positiva', () => {
    expect(() =>
      estimarPeso({ perimetroToracico: 180, largoCorporal: 150 }, 0),
    ).toThrow(RangeError);
  });
});

describe('rangos plausibles', () => {
  it('rechaza un perímetro torácico por encima del máximo', () => {
    expect(() =>
      estimarPeso({ perimetroToracico: 400, largoCorporal: 150 }),
    ).toThrow(MedidaFueraDeRangoError);
  });

  it('rechaza un largo corporal por debajo del mínimo', () => {
    expect(() =>
      estimarPeso({ perimetroToracico: 180, largoCorporal: 10 }),
    ).toThrow(MedidaFueraDeRangoError);
  });

  it('rechaza medidas válidas que producen un peso implausible', () => {
    // Ambas medidas están dentro de su rango, pero su combinación arroja
    // 16,61 kg: menos que un ternero recién nacido. Por este caso se valida
    // también el resultado y no solo las entradas.
    expect(() =>
      estimarPeso({ perimetroToracico: 60, largoCorporal: 50 }),
    ).toThrow(/peso estimado/);
  });

  it('el error identifica el campo y pide repetir la medición', () => {
    try {
      estimarPeso({ perimetroToracico: 400, largoCorporal: 150 });
      fail('Debió rechazar la medida');
    } catch (error) {
      expect(error).toBeInstanceOf(MedidaFueraDeRangoError);
      const e = error as MedidaFueraDeRangoError;
      expect(e.campo).toBe('perimetroToracico');
      expect(e.valor).toBe(400);
      expect(e.message).toContain('Repita la medición');
    }
  });

  it('acepta los extremos del rango', () => {
    expect(() =>
      estimarPeso({
        perimetroToracico: RANGOS.perimetroToracico.max,
        largoCorporal: RANGOS.largoCorporal.max,
      }),
    ).not.toThrow();
  });
});

describe('calibración contra una muestra pesada', () => {
  /**
   * Muestra sintética generada con una constante conocida.
   *
   * Se construye a partir de k = 10200 para poder comprobar que la calibración
   * la recupera. Con medidas reales no hay un valor verdadero contra el que
   * contrastar, de modo que una muestra inventada es la única forma de
   * verificar que el ajuste funciona y no solo que devuelve algún número.
   */
  const K_VERDADERA = 10200;

  const muestra = [
    [158, 131],
    [168, 138],
    [176, 143],
    [186, 152],
    [214, 176],
    [94, 78],
  ].map(([perimetroToracico, largoCorporal]) => ({
    perimetroToracico,
    largoCorporal,
    pesoReal:
      Math.round(
        ((perimetroToracico * perimetroToracico * largoCorporal) /
          K_VERDADERA) *
          100,
      ) / 100,
  }));

  it('recupera la constante con que se generó la muestra', () => {
    expect(calibrarConstante(muestra)).toBeCloseTo(K_VERDADERA, 0);
  });

  it('el error de la constante calibrada es prácticamente nulo', () => {
    const calibrada = calibrarConstante(muestra);
    expect(errorMedioAbsoluto(muestra, calibrada)).toBeLessThan(0.1);
  });

  it('la constante calibrada mejora el error de la bibliográfica', () => {
    // Es la razón de ser del procedimiento: si calibrar no redujera el error,
    // no habría motivo para apartarse del valor de la bibliografía.
    const calibrada = calibrarConstante(muestra);
    expect(errorMedioAbsoluto(muestra, calibrada)).toBeLessThan(
      errorMedioAbsoluto(muestra, CONSTANTE_BIBLIOGRAFICA),
    );
  });

  it('expresa el error en puntos porcentuales', () => {
    // Una muestra con un sesgo del diez por ciento debe dar diez, no 0,1: el
    // criterio de aceptación está expresado en porcentaje.
    const sesgada = [{ perimetroToracico: 180, largoCorporal: 150, pesoReal: 0 }];
    sesgada[0].pesoReal =
      estimarPeso(sesgada[0]).pesoEstimado / 1.1;
    expect(errorMedioAbsoluto(sesgada)).toBeCloseTo(10, 0);
  });

  it('rechaza una muestra vacía', () => {
    expect(() => calibrarConstante([])).toThrow(RangeError);
  });

  it('rechaza un peso de referencia no positivo', () => {
    expect(() =>
      calibrarConstante([
        { perimetroToracico: 180, largoCorporal: 150, pesoReal: 0 },
      ]),
    ).toThrow(RangeError);
  });
});

describe('ganancia media diaria', () => {
  it('calcula la ganancia entre dos pesajes', () => {
    const ganancia = gananciaMediaDiaria(
      { fecha: new Date('2026-08-03'), pesoEstimado: 359.38 },
      { fecha: new Date('2026-09-27'), pesoEstimado: 408.71 },
    );
    // 49,33 kg en 55 días.
    expect(ganancia).toBeCloseTo(0.9, 2);
  });

  it('devuelve null para dos mediciones del mismo día', () => {
    // La ganancia no vale cero: no existe. Devolver cero afirmaría que el
    // animal no creció, cuando lo que ocurre es que no hay período.
    const ganancia = gananciaMediaDiaria(
      { fecha: new Date('2026-09-27'), pesoEstimado: 400 },
      { fecha: new Date('2026-09-27'), pesoEstimado: 408 },
    );
    expect(ganancia).toBeNull();
  });

  it('devuelve negativo cuando el animal perdió peso', () => {
    const ganancia = gananciaMediaDiaria(
      { fecha: new Date('2026-09-01'), pesoEstimado: 420 },
      { fecha: new Date('2026-10-01'), pesoEstimado: 405 },
    );
    expect(ganancia).toBeCloseTo(-0.5, 2);
  });
});
