import 'package:drift/drift.dart' hide isNull, isNotNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ganabol/data/local/database.dart';

/// Pruebas de la base de datos local.
///
/// Se ejecutan contra SQLite en memoria, de modo que cada prueba parte de un
/// estado limpio sin depender del dispositivo ni del servidor.
void main() {
  late BaseDatosLocal db;

  const predio = '01JGKQZ8XW4P7N2M5R8T3V6Y00';

  AnimalesCompanion animal(
    String id,
    String caravana, {
    String fase = 'CRIANZA',
    String? nombre,
  }) =>
      AnimalesCompanion.insert(
        id: id,
        caravana: caravana,
        sexo: 'MACHO',
        categoria: 'TERNERO',
        predioId: predio,
        fase: Value(fase),
        nombre: Value(nombre),
      );

  setUp(() => db = BaseDatosLocal(NativeDatabase.memory()));
  tearDown(() => db.close());

  group('Registro local', () {
    test('un animal registrado queda pendiente de sincronizar', () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));

      final guardado = await db.obtenerAnimal('01AAAAAAAAAAAAAAAAAAAAAAAA');

      expect(guardado, isNotNull);
      expect(guardado!.caravana, 'A-101');
      expect(guardado.estadoSync, 'PENDIENTE');
    });

    test('no admite dos animales con la misma caravana en el predio',
        () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));

      expect(
        () => db.guardarAnimal(animal('01BBBBBBBBBBBBBBBBBBBBBBBB', 'A-101')),
        throwsA(isA<SqliteException>()),
      );
    });

    test('reenviar el mismo identificador actualiza en vez de duplicar',
        () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));
      await db.guardarAnimal(
        animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101', nombre: 'Manchado'),
      );

      final todos = await db.select(db.animales).get();

      expect(todos, hasLength(1));
      expect(todos.single.nombre, 'Manchado');
    });
  });

  group('Baja lógica', () {
    test('el animal dado de baja desaparece del hato pero sigue en la base',
        () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));
      await db.marcarSincronizado('01AAAAAAAAAAAAAAAAAAAAAAAA');

      await db.eliminarAnimal('01AAAAAAAAAAAAAAAAAAAAAAAA');

      final visibles = await db.observarAnimales().first;
      final enBase = await db.obtenerAnimal('01AAAAAAAAAAAAAAAAAAAAAAAA');

      expect(visibles, isEmpty);
      expect(enBase, isNotNull);
      expect(enBase!.deletedAt, isNotNull);
      // Debe volver a sincronizarse para propagar la baja al servidor.
      expect(enBase.estadoSync, 'PENDIENTE');
    });
  });

  group('Consultas del hato', () {
    setUp(() async {
      await db.guardarAnimal(
          animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101', fase: 'ENGORDE'));
      await db.guardarAnimal(animal('01BBBBBBBBBBBBBBBBBBBBBBBB', 'A-102',
          fase: 'CRIANZA', nombre: 'Manchado'));
      await db.guardarAnimal(
          animal('01CCCCCCCCCCCCCCCCCCCCCCCC', 'B-201', fase: 'ENGORDE'));
    });

    test('devuelve el hato ordenado por caravana', () async {
      final lista = await db.observarAnimales().first;
      expect(lista.map((a) => a.caravana), ['A-101', 'A-102', 'B-201']);
    });

    test('filtra por fase productiva', () async {
      final engorde = await db.observarAnimales(fase: 'ENGORDE').first;
      expect(engorde, hasLength(2));
    });

    test('busca por caravana', () async {
      final resultado = await db.observarAnimales(busqueda: 'B-2').first;
      expect(resultado.single.caravana, 'B-201');
    });

    test('busca por nombre', () async {
      final resultado = await db.observarAnimales(busqueda: 'Manch').first;
      expect(resultado.single.caravana, 'A-102');
    });
  });

  group('Control de sincronización', () {
    test('cuenta los registros pendientes de envío', () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));
      await db.guardarAnimal(animal('01BBBBBBBBBBBBBBBBBBBBBBBB', 'A-102'));
      await db.marcarSincronizado('01AAAAAAAAAAAAAAAAAAAAAAAA');

      expect(await db.contarPendientes(), 1);
      final pendientes = await db.animalesPendientes();
      expect(pendientes.single.caravana, 'A-102');
    });

    test('guarda y recupera la marca temporal de sincronización', () async {
      final momento = DateTime.utc(2026, 9, 29, 12, 30);
      await db.registrarSync('animales', momento);

      // Drift persiste la fecha como timestamp Unix, de modo que vuelve en
      // hora local. Lo que debe conservarse es el instante, no la zona: la
      // sincronización convierte a UTC antes de enviarla al servidor.
      final recuperado = await db.ultimaSync('animales');
      expect(recuperado!.isAtSameMomentAs(momento), isTrue);
      expect(await db.ultimaSync('salud'), isNull);
    });

    test('cerrar sesión vacía los datos del predio', () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));
      await db.registrarSync('animales', DateTime.utc(2026, 9, 29));

      await db.limpiar();

      expect(await db.select(db.animales).get(), isEmpty);
      expect(await db.ultimaSync('animales'), isNull);
    });
  });
}
