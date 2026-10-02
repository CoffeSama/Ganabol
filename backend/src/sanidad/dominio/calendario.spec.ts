/**
 * Pruebas del calendario sanitario (RF13).
 *
 * Todas pasan la fecha de referencia como parámetro, de modo que el resultado
 * no depende del día en que se ejecuten. Un calendario que se comprobara
 * contra la fecha del sistema pasaría hoy y fallaría en seis meses sin que el
 * código hubiera cambiado.
 */
import { EstadoAlerta, TipoEventoPlan, TipoEventoSanitario } from '@prisma/client';
import {
  AnimalProgramable,
  ProtocoloProgramable,
  VENTANA_ANTICIPACION_DIAS,
  aDiaUtc,
  aplicaAlAnimal,
  fechaDeReferencia,
  limiteDeCierre,
  noAntesDelAlta,
  programar,
  protocoloQueCumple,
  sumarDias,
} from './calendario';

const HOY = new Date('2026-10-02T15:00:00Z');

const animal = (
  parcial: Partial<AnimalProgramable> = {},
): AnimalProgramable => ({
  idAnimal: '01AAAAAAAAAAAAAAAAAAAAAAAA',
  categoria: 'novillo',
  fechaNacimiento: new Date('2024-03-15'),
  creadoEn: new Date('2026-01-10'),
  ...parcial,
});

const protocolo = (
  parcial: Partial<ProtocoloProgramable> = {},
): ProtocoloProgramable => ({
  idPlan: '01PLANAFTOSAAFTOSAAFTOSAAA',
  nombre: 'Vacunación antiaftosa',
  categoria: null,
  periodicidadDias: 180,
  ...parcial,
});

describe('aritmética de fechas', () => {
  it('normaliza una marca temporal al día que representa', () => {
    expect(aDiaUtc(new Date('2026-10-02T23:45:00Z')).toISOString()).toBe(
      '2026-10-02T00:00:00.000Z',
    );
  });

  it('suma días conservando el día del almanaque', () => {
    expect(sumarDias(new Date('2026-03-16'), 180).toISOString()).toBe(
      '2026-09-12T00:00:00.000Z',
    );
  });

  it('atraviesa un cambio de año', () => {
    expect(sumarDias(new Date('2026-12-20'), 30).toISOString()).toBe(
      '2027-01-19T00:00:00.000Z',
    );
  });
});

describe('correspondencia entre evento y protocolo', () => {
  it('una vacunación cumple un protocolo de vacunación', () => {
    expect(protocoloQueCumple(TipoEventoSanitario.vacunacion)).toBe(
      TipoEventoPlan.vacunacion,
    );
  });

  it('un diagnóstico no cumple ningún protocolo', () => {
    // Se registra porque ocurrió, no porque estuviera previsto.
    expect(protocoloQueCumple(TipoEventoSanitario.diagnostico)).toBeNull();
  });
});

describe('alcance del protocolo', () => {
  it('un protocolo sin categoría aplica a todo el hato', () => {
    expect(aplicaAlAnimal(protocolo({ categoria: null }), animal())).toBe(true);
  });

  it('un protocolo de categoría aplica solo a esa categoría', () => {
    expect(
      aplicaAlAnimal(protocolo({ categoria: 'ternero' }), animal({ categoria: 'novillo' })),
    ).toBe(false);
    expect(
      aplicaAlAnimal(protocolo({ categoria: 'ternero' }), animal({ categoria: 'ternero' })),
    ).toBe(true);
  });

  it('no programa un protocolo que no aplica al animal', () => {
    expect(
      programar(
        animal({ categoria: 'novillo' }),
        protocolo({ categoria: 'vaquillona' }),
        null,
        HOY,
      ),
    ).toBeNull();
  });
});

describe('fecha de referencia', () => {
  it('parte del último evento cuando el protocolo ya se aplicó', () => {
    const referencia = fechaDeReferencia(animal(), new Date('2026-03-16'));
    expect(referencia.toISOString()).toBe('2026-03-16T00:00:00.000Z');
  });

  it('parte del nacimiento cuando nunca se aplicó', () => {
    const referencia = fechaDeReferencia(animal(), null);
    expect(referencia.toISOString()).toBe('2024-03-15T00:00:00.000Z');
  });

  it('parte del alta cuando no se conoce el nacimiento', () => {
    // Habitual en animales comprados: el alta es el primer momento del que
    // hay constancia.
    const referencia = fechaDeReferencia(
      animal({ fechaNacimiento: null }),
      null,
    );
    expect(referencia.toISOString()).toBe('2026-01-10T00:00:00.000Z');
  });
});

describe('programación', () => {
  it('suma la periodicidad a la fecha del último evento', () => {
    const tarea = programar(animal(), protocolo(), new Date('2026-03-16'), HOY);
    expect(tarea!.fechaProgramada.toISOString()).toBe(
      '2026-09-12T00:00:00.000Z',
    );
  });

  it('marca como vencida la tarea cuyo plazo ya pasó', () => {
    const tarea = programar(animal(), protocolo(), new Date('2026-03-16'), HOY);
    expect(tarea!.estado).toBe(EstadoAlerta.vencida);
  });

  it('marca como pendiente la tarea que todavía no vence', () => {
    const tarea = programar(animal(), protocolo(), new Date('2026-04-20'), HOY);
    expect(tarea!.fechaProgramada.toISOString()).toBe(
      '2026-10-17T00:00:00.000Z',
    );
    expect(tarea!.estado).toBe(EstadoAlerta.pendiente);
  });

  it('descarta la tarea que vence más allá de la ventana de anticipación', () => {
    // Un aviso con un año de antelación no es información útil: llena la
    // bandeja y el productor deja de mirarla.
    const tarea = programar(
      animal({ categoria: 'ternero' }),
      protocolo({ periodicidadDias: 365, categoria: 'ternero' }),
      new Date('2026-09-12'),
      HOY,
    );
    expect(tarea).toBeNull();
  });

  it('incluye la tarea que vence justo en el límite de la ventana', () => {
    const limite = sumarDias(aDiaUtc(HOY), VENTANA_ANTICIPACION_DIAS);
    const ultimoEvento = sumarDias(limite, -protocolo().periodicidadDias);

    const tarea = programar(animal(), protocolo(), ultimoEvento, HOY);
    expect(tarea).not.toBeNull();
    expect(tarea!.fechaProgramada.toISOString()).toBe(limite.toISOString());
  });

  it('una tarea que vence hoy está pendiente, no vencida', () => {
    const hoyDia = aDiaUtc(HOY);
    const ultimoEvento = sumarDias(hoyDia, -protocolo().periodicidadDias);

    const tarea = programar(animal(), protocolo(), ultimoEvento, HOY);
    expect(tarea!.estado).toBe(EstadoAlerta.pendiente);
  });
});

describe('piso en la fecha de alta', () => {
  it('adelanta hasta el alta un vencimiento inferido anterior a ella', () => {
    const viejo = animal({
      fechaNacimiento: new Date('2020-11-03'),
      creadoEn: new Date('2026-10-02'),
    });
    expect(noAntesDelAlta(new Date('2021-05-02'), viejo).toISOString()).toBe(
      '2026-10-02T00:00:00.000Z',
    );
  });

  it('no altera un vencimiento posterior al alta', () => {
    expect(noAntesDelAlta(new Date('2026-10-17'), animal()).toISOString()).toBe(
      '2026-10-17T00:00:00.000Z',
    );
  });

  it('un animal adulto recién cargado no arrastra un atraso de años', () => {
    // Sin historial, el nacimiento más la periodicidad caería en 2021. Esa
    // fecha afirma algo que el sistema no sabe: la falta de registro no prueba
    // que el protocolo nunca se aplicara, sino que el sistema no estaba en uso.
    const tarea = programar(
      animal({
        fechaNacimiento: new Date('2020-11-03'),
        creadoEn: new Date('2026-10-02'),
      }),
      protocolo({ periodicidadDias: 120 }),
      null,
      HOY,
    );

    expect(tarea!.fechaProgramada.toISOString()).toBe(
      '2026-10-02T00:00:00.000Z',
    );
    expect(tarea!.estado).toBe(EstadoAlerta.pendiente);
  });

  it('no aplica el piso cuando hay un evento registrado', () => {
    // La fecha de un evento es evidencia real: el atraso que de ella se
    // deriva debe mostrarse tal cual, aunque incomode.
    const tarea = programar(
      animal({ creadoEn: new Date('2026-10-02') }),
      protocolo(),
      new Date('2026-03-16'),
      HOY,
    );

    expect(tarea!.fechaProgramada.toISOString()).toBe(
      '2026-09-12T00:00:00.000Z',
    );
    expect(tarea!.estado).toBe(EstadoAlerta.vencida);
  });
});

describe('límite de cierre', () => {
  it('alcanza los vencimientos de la ventana contada desde el evento', () => {
    // El productor que vacuna una semana antes de la fecha no quiere seguir
    // viendo el aviso.
    expect(limiteDeCierre(new Date('2026-10-02')).toISOString()).toBe(
      '2026-11-01T00:00:00.000Z',
    );
  });

  it('no alcanza el vencimiento del ciclo siguiente', () => {
    const limite = limiteDeCierre(new Date('2026-10-02'));
    const cicloSiguiente = sumarDias(new Date('2026-10-02'), 180);
    expect(limite.getTime()).toBeLessThan(cicloSiguiente.getTime());
  });
});
