import 'package:flutter_test/flutter_test.dart';
import 'package:ganabol/domain/pesaje/schaeffer.dart';

/// Pruebas de la estimación morfométrica del peso (RF4).
///
/// El grupo «coincidencia con el servidor» es el que da sentido a los demás: la
/// fórmula está implementada dos veces, en Dart para el campo y en TypeScript
/// para la consolidación, y si las dos no coinciden al decimal el peso que el
/// productor ve cambiaría al sincronizar. Los valores esperados no se calculan
/// aquí: se tomaron de la respuesta real del servidor y se escribieron como
/// constantes, de modo que la prueba falla si cualquiera de las dos
/// implementaciones se desvía.
void main() {
  group('coincidencia con la implementación del servidor', () {
    // Pares de medidas con el peso que devolvió POST /api/pesajes.
    const casos = <(double, double, double)>[
      (180, 150, 448.42),
      (176, 143, 408.71),
      (168, 138, 359.38),
      (158, 131, 301.74),
      (186, 152, 485.20),
      (214, 176, 743.69),
      (94, 78, 63.59),
    ];

    for (final (pt, lc, esperado) in casos) {
      test('PT $pt cm y LC $lc cm estiman $esperado kg', () {
        final peso = estimarPeso(perimetroToracico: pt, largoCorporal: lc);
        expect(peso.kilogramos, esperado);
      });
    }
  });

  group('fórmula', () {
    test('aplica PV = (PT² × LC) / k', () {
      final peso = estimarPeso(perimetroToracico: 180, largoCorporal: 150);
      expect(peso.kilogramos, closeTo((180 * 180 * 150) / 10838, 0.01));
    });

    test('registra la constante con que se calculó', () {
      final peso = estimarPeso(perimetroToracico: 180, largoCorporal: 150);
      expect(peso.constante, constanteBibliografica);
    });

    test('una constante menor estima un peso mayor', () {
      // Es la relación que hace útil la calibración: si el ganado cebú pesa
      // más de lo que predice la constante bibliográfica, calibrar significa
      // bajarla.
      final conBiblio = estimarPeso(perimetroToracico: 180, largoCorporal: 150);
      final conMenor = estimarPeso(
        perimetroToracico: 180,
        largoCorporal: 150,
        constante: 10000,
      );
      expect(conMenor.kilogramos, greaterThan(conBiblio.kilogramos));
    });

    test('redondea a dos decimales, la precisión que almacena la base', () {
      final peso = estimarPeso(perimetroToracico: 177, largoCorporal: 139);
      final decimales =
          peso.kilogramos.toString().split('.').elementAtOrNull(1) ?? '';
      expect(decimales.length, lessThanOrEqualTo(2));
    });

    test('rechaza una constante no positiva', () {
      expect(
        () => estimarPeso(
          perimetroToracico: 180,
          largoCorporal: 150,
          constante: 0,
        ),
        throwsArgumentError,
      );
    });
  });

  group('rangos plausibles', () {
    test('rechaza un perímetro torácico por encima del máximo', () {
      expect(
        () => estimarPeso(perimetroToracico: 400, largoCorporal: 150),
        throwsA(isA<MedidaFueraDeRango>()),
      );
    });

    test('rechaza un perímetro torácico por debajo del mínimo', () {
      expect(
        () => estimarPeso(perimetroToracico: 30, largoCorporal: 150),
        throwsA(isA<MedidaFueraDeRango>()),
      );
    });

    test('rechaza un largo corporal fuera de rango', () {
      expect(
        () => estimarPeso(perimetroToracico: 180, largoCorporal: 300),
        throwsA(isA<MedidaFueraDeRango>()),
      );
    });

    test('rechaza medidas válidas que producen un peso implausible', () {
      // Ambas medidas están dentro de su rango, pero su combinación arroja
      // 16,6 kg: menos que un ternero recién nacido. El resultado se valida
      // además de las entradas, justamente por este caso.
      expect(
        () => estimarPeso(perimetroToracico: 60, largoCorporal: 50),
        throwsA(isA<MedidaFueraDeRango>()),
      );
    });

    test('el mensaje de error indica el rango esperado', () {
      try {
        estimarPeso(perimetroToracico: 400, largoCorporal: 150);
        fail('Debió rechazar la medida');
      } on MedidaFueraDeRango catch (e) {
        expect(e.mensaje, contains('60.0 a 250.0 cm'));
        expect(e.mensaje, contains('Repita la medición'));
      }
    });

    test('acepta los extremos del rango', () {
      // El límite pertenece al rango: una medida de exactamente 250 cm es
      // plausible y rechazarla obligaría a falsear el dato.
      expect(
        () => estimarPeso(perimetroToracico: 250, largoCorporal: 200),
        returnsNormally,
      );
    });
  });

  group('estimación tolerante para el formulario', () {
    test('devuelve null mientras falta una medida', () {
      expect(
        estimarPesoONulo(perimetroToracico: 180, largoCorporal: null),
        isNull,
      );
    });

    test('devuelve null con medidas fuera de rango en lugar de lanzar', () {
      // Mientras el usuario escribe «1», «18», «180», los valores intermedios
      // no son errores que anunciar: simplemente aún no permiten calcular.
      expect(
        estimarPesoONulo(perimetroToracico: 1, largoCorporal: 150),
        isNull,
      );
    });

    test('calcula cuando las dos medidas son válidas', () {
      final peso =
          estimarPesoONulo(perimetroToracico: 180, largoCorporal: 150);
      expect(peso?.kilogramos, 448.42);
    });
  });

  group('ganancia media diaria', () {
    test('calcula la ganancia entre dos pesajes', () {
      final ganancia = gananciaMediaDiaria(
        fechaAnterior: DateTime.utc(2026, 8, 3),
        pesoAnterior: 359.38,
        fechaActual: DateTime.utc(2026, 9, 27),
        pesoActual: 408.71,
      );
      // 49,33 kg en 55 días.
      expect(ganancia, closeTo(0.90, 0.01));
    });

    test('devuelve null para dos mediciones del mismo día', () {
      // La ganancia no vale cero: no existe. Devolver cero afirmaría que el
      // animal no creció, cuando lo que ocurre es que no hay período.
      final ganancia = gananciaMediaDiaria(
        fechaAnterior: DateTime.utc(2026, 9, 27),
        pesoAnterior: 400,
        fechaActual: DateTime.utc(2026, 9, 27),
        pesoActual: 408,
      );
      expect(ganancia, isNull);
    });

    test('devuelve negativo cuando el animal perdió peso', () {
      final ganancia = gananciaMediaDiaria(
        fechaAnterior: DateTime.utc(2026, 9, 1),
        pesoAnterior: 420,
        fechaActual: DateTime.utc(2026, 10, 1),
        pesoActual: 405,
      );
      expect(ganancia, closeTo(-0.5, 0.01));
    });

    test('ignora la hora y compara días del almanaque', () {
      // El dispositivo registra la fecha con la hora local. Dos mediciones
      // separadas por un día deben dar un día de diferencia, sin importar a
      // qué hora se tomaron.
      final ganancia = gananciaMediaDiaria(
        fechaAnterior: DateTime.utc(2026, 9, 1, 23, 50),
        pesoAnterior: 400,
        fechaActual: DateTime.utc(2026, 9, 2, 0, 10),
        pesoActual: 401,
      );
      expect(ganancia, 1.0);
    });
  });
}
