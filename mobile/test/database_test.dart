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

  const usuario = '01USUARIOUSUARIOUSUARIOUS';

  AnimalesCompanion animal(
    String idAnimal,
    String caravana, {
    String fase = 'crianza',
    String categoria = 'ternero',
    String sexo = 'M',
    String? raza,
  }) =>
      AnimalesCompanion.insert(
        idAnimal: idAnimal,
        idUsuario: '${usuario}1',
        caravana: caravana,
        categoria: categoria,
        sexo: sexo,
        fase: fase,
        raza: Value(raza),
      );

  setUp(() => db = BaseDatosLocal(NativeDatabase.memory()));
  tearDown(() => db.close());

  group('Registro local', () {
    test('un animal registrado queda pendiente de sincronizar', () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));

      final guardado = await db.obtenerAnimal('01AAAAAAAAAAAAAAAAAAAAAAAA');

      expect(guardado, isNotNull);
      expect(guardado!.caravana, 'A-101');
      expect(guardado.estadoSync, 'pendiente');
      expect(guardado.estado, 'activo');
      expect(guardado.eliminado, isFalse);
    });

    test('no admite dos animales con la misma caravana', () async {
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
        animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101', raza: 'Nelore'),
      );

      final todos = await db.select(db.animales).get();

      expect(todos, hasLength(1));
      expect(todos.single.raza, 'Nelore');
    });
  });

  group('Baja lógica', () {
    test('el animal dado de baja sale del hato pero sigue en la base',
        () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));
      await db.marcarSincronizado('01AAAAAAAAAAAAAAAAAAAAAAAA');

      await db.eliminarAnimal('01AAAAAAAAAAAAAAAAAAAAAAAA');

      final visibles = await db.observarAnimales().first;
      final enBase = await db.obtenerAnimal('01AAAAAAAAAAAAAAAAAAAAAAAA');

      expect(visibles, isEmpty);
      expect(enBase, isNotNull);
      expect(enBase!.eliminado, isTrue);
      // Debe volver a consolidarse para propagar la baja al servidor.
      expect(enBase.estadoSync, 'pendiente');
    });
  });

  group('Consultas del hato', () {
    setUp(() async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101',
          fase: 'engorde', categoria: 'vaca', sexo: 'H'));
      await db.guardarAnimal(animal('01BBBBBBBBBBBBBBBBBBBBBBBB', 'A-102',
          fase: 'crianza'));
      await db.guardarAnimal(animal('01CCCCCCCCCCCCCCCCCCCCCCCC', 'B-201',
          fase: 'engorde', categoria: 'novillo'));
    });

    test('devuelve el hato ordenado por caravana', () async {
      final lista = await db.observarAnimales().first;
      expect(lista.map((a) => a.caravana), ['A-101', 'A-102', 'B-201']);
    });

    test('filtra por fase de manejo', () async {
      final engorde = await db.observarAnimales(fase: 'engorde').first;
      expect(engorde, hasLength(2));
    });

    test('busca por número de caravana', () async {
      final resultado = await db.observarAnimales(busqueda: 'B-2').first;
      expect(resultado.single.caravana, 'B-201');
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

    test('un conflicto deja de reintentarse en cada pasada', () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));
      await db.marcarConflicto('01AAAAAAAAAAAAAAAAAAAAAAAA');

      final enBase = await db.obtenerAnimal('01AAAAAAAAAAAAAAAAAAAAAAAA');

      expect(enBase!.estadoSync, 'conflicto');
      expect(await db.animalesPendientes(), isEmpty);
    });

    test('guarda y recupera el cursor de sincronización', () async {
      final momento = DateTime.utc(2026, 9, 29, 12, 30);
      await db.registrarSync('animal', momento);

      // Drift persiste la fecha como marca de tiempo Unix, de modo que vuelve
      // en hora local. Lo que debe conservarse es el instante, no la zona: la
      // consulta de cambios convierte a UTC antes de enviarla al servidor.
      final recuperado = await db.ultimaSync('animal');
      expect(recuperado!.isAtSameMomentAs(momento), isTrue);
      expect(await db.ultimaSync('evento_sanitario'), isNull);
    });

    test('cerrar sesión vacía los datos del establecimiento', () async {
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));
      await db.registrarSync('animal', DateTime.utc(2026, 9, 29));

      await db.limpiar();

      expect(await db.select(db.animales).get(), isEmpty);
      expect(await db.ultimaSync('animal'), isNull);
    });
  });

  group('Potreros', () {
    test('un animal puede quedar sin potrero asignado', () async {
      await db.guardarPotreros([
        PotrerosCompanion.insert(
          idPotrero: '01POTREROPOTREROPOTREROPOT',
          nombre: 'Potrero Norte',
          superficieHa: const Value(120.5),
        ),
      ]);
      await db.guardarAnimal(animal('01AAAAAAAAAAAAAAAAAAAAAAAA', 'A-101'));

      final potreros = await db.observarPotreros().first;
      final guardado = await db.obtenerAnimal('01AAAAAAAAAAAAAAAAAAAAAAAA');

      expect(potreros.single.nombre, 'Potrero Norte');
      expect(guardado!.idPotrero, isNull);
    });
  });
}
