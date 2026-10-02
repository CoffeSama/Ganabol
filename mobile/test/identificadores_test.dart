import 'package:flutter_test/flutter_test.dart';
import 'package:ganabol/domain/identificadores.dart';

/// Pruebas de los identificadores de registro.
///
/// Cubren un defecto detectado al sincronizar desde la aplicación: la
/// biblioteca que genera los ULID los devuelve en minúsculas, mientras que el
/// alfabeto canónico de Crockford —y la validación del servidor— es en
/// mayúsculas. El resultado era que todo registro creado en el dispositivo se
/// rechazaba al consolidar, y la captura sin conexión, que es la razón de ser
/// del sistema, no llegaba nunca al servidor.
///
/// La expresión con que se comprueba es la misma que aplica el servidor, de
/// modo que esta prueba falla si cualquiera de los dos lados se desvía.
void main() {
  group('forma canónica', () {
    test('un identificador nuevo pasa la validación del servidor', () {
      expect(esUlidValido(nuevoIdentificador()), isTrue);
    });

    test('se emite en mayúsculas', () {
      final id = nuevoIdentificador();
      expect(id, id.toUpperCase());
    });

    test('mide veintiséis caracteres', () {
      expect(nuevoIdentificador().length, 26);
    });

    test('cien identificadores seguidos son todos válidos', () {
      // La parte aleatoria cambia en cada generación; una sola muestra podría
      // no contener ninguna letra y pasar por casualidad.
      final generados = List.generate(100, (_) => nuevoIdentificador());
      expect(generados.where(esUlidValido), hasLength(100));
    });

    test('cien identificadores seguidos son todos distintos', () {
      final generados = List.generate(100, (_) => nuevoIdentificador());
      expect(generados.toSet(), hasLength(100));
    });
  });

  group('validación', () {
    test('rechaza la forma en minúsculas', () {
      // Es exactamente lo que el servidor devolvía como petición inválida.
      expect(esUlidValido('0003ypmfrr00f6qvh703n434d0'), isFalse);
    });

    test('rechaza las letras excluidas del alfabeto de Crockford', () {
      // I, L, O y U se omiten por confundirse con 1 y 0 al leerlas o
      // dictarlas, que en el campo ocurre.
      for (final letra in ['I', 'L', 'O', 'U']) {
        expect(
          esUlidValido('01$letra${'A' * 23}'),
          isFalse,
          reason: 'La letra $letra no pertenece al alfabeto',
        );
      }
    });

    test('rechaza una longitud distinta de veintiséis', () {
      expect(esUlidValido('A' * 25), isFalse);
      expect(esUlidValido('A' * 27), isFalse);
    });

    test('rechaza una cadena vacía', () {
      expect(esUlidValido(''), isFalse);
    });
  });

  group('ordenamiento', () {
    test('un identificador posterior ordena después que uno anterior', () async {
      // La primera parte del ULID es la marca temporal, lo que hace que el
      // orden lexicográfico coincida con el cronológico. De eso depende que el
      // historial se pueda recorrer sin consultar la fecha.
      final primero = nuevoIdentificador();
      await Future<void>.delayed(const Duration(milliseconds: 5));
      final segundo = nuevoIdentificador();

      expect(primero.compareTo(segundo), lessThan(0));
    });
  });
}
