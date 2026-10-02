import 'package:flutter_test/flutter_test.dart';
import 'package:ganabol/domain/fechas.dart';

/// Pruebas del manejo de las fechas que son días del almanaque (RF4, RF5, RF13).
///
/// Cubren un defecto concreto detectado al recorrer la aplicación: el servidor
/// emite la fecha de vencimiento de una tarea como medianoche UTC y el
/// dispositivo la interpretaba como un instante. En Bolivia, cuatro horas al
/// oeste de Greenwich, esa conversión retrocede la fecha un día, y una tarea
/// programada para hoy aparecía vencida ayer.
void main() {
  group('lectura de una fecha emitida por el servidor', () {
    test('conserva el día aunque el huso local esté al oeste de Greenwich', () {
      final dia = diaDesdeJson('2026-10-02T00:00:00.000Z');

      expect(dia.year, 2026);
      expect(dia.month, 10);
      expect(dia.day, 2);
    });

    test('acepta la fecha sin componente horario', () {
      final dia = diaDesdeJson('2026-10-02');
      expect(dia.day, 2);
      expect(dia.month, 10);
    });

    test('devuelve medianoche local, que es como la leen las pantallas', () {
      final dia = diaDesdeJson('2026-10-02T00:00:00.000Z');
      expect(dia.hour, 0);
      expect(dia.minute, 0);
      expect(dia.isUtc, isFalse);
    });

    test('la variante tolerante devuelve null para un campo ausente', () {
      expect(diaDesdeJsonONulo(null), isNull);
      expect(diaDesdeJsonONulo('2026-10-02')!.day, 2);
    });
  });

  group('escritura de una fecha hacia el servidor', () {
    test('emite solo la parte de fecha', () {
      expect(diaAJson(DateTime(2026, 10, 2)), '2026-10-02');
    });

    test('completa con ceros el mes y el día', () {
      expect(diaAJson(DateTime(2026, 3, 7)), '2026-03-07');
    });

    test('toma el día del calendario del usuario, no el universal', () {
      // Una medición tomada a las once de la noche pertenece a ese día, no al
      // siguiente: es la fecha que el usuario eligió en el selector.
      expect(diaAJson(DateTime(2026, 10, 2, 23, 30)), '2026-10-02');
    });

    test('lo emitido vuelve a leerse como el mismo día', () {
      // Es la propiedad que sostiene toda la sincronización de fechas: lo que
      // el dispositivo envía y lo que recibe de vuelta deben coincidir.
      final original = DateTime(2026, 10, 2);
      final ida = diaAJson(original);
      final vuelta = diaDesdeJson('${ida}T00:00:00.000Z');

      expect(vuelta, original);
    });
  });

  group('días completos entre dos fechas', () {
    test('cuenta los días del almanaque', () {
      expect(diasEntre(DateTime(2026, 8, 3), DateTime(2026, 9, 27)), 55);
    });

    test('ignora la hora de cada extremo', () {
      // Dos mediciones separadas por veinte minutos pero en días distintos
      // valen un día, no cero.
      expect(
        diasEntre(DateTime(2026, 9, 1, 23, 50), DateTime(2026, 9, 2, 0, 10)),
        1,
      );
    });

    test('devuelve cero para dos momentos del mismo día', () {
      expect(
        diasEntre(DateTime(2026, 9, 1, 8), DateTime(2026, 9, 1, 20)),
        0,
      );
    });

    test('devuelve negativo para una fecha ya pasada', () {
      // Es el signo que distingue una tarea vencida de una próxima.
      expect(diasEntre(DateTime(2026, 10, 2), DateTime(2026, 9, 12)), -20);
    });

    test('atraviesa un cambio de año', () {
      expect(diasEntre(DateTime(2026, 12, 20), DateTime(2027, 1, 19)), 30);
    });
  });
}
