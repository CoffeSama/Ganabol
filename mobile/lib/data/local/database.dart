import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'database.g.dart';

/// Inventario bovino almacenado en el dispositivo.
///
/// La tabla replica la del servidor y agrega los campos que necesita la
/// sincronización diferida. El identificador es un ULID generado en el
/// dispositivo al crear el animal, de modo que el registro en campo no
/// depende de tener conexión en ese momento.
@DataClassName('Animal')
class Animales extends Table {
  TextColumn get id => text().withLength(min: 26, max: 26)();

  TextColumn get caravana => text().withLength(min: 1, max: 30)();
  TextColumn get nombre => text().nullable()();

  TextColumn get sexo => text()();
  TextColumn get raza => text().nullable()();
  DateTimeColumn get fechaNacimiento => dateTime().nullable()();
  TextColumn get categoria => text()();
  TextColumn get fase => text().withDefault(const Constant('CRIANZA'))();
  TextColumn get estado => text().withDefault(const Constant('ACTIVO'))();

  TextColumn get madreId => text().nullable()();
  TextColumn get predioId => text()();
  TextColumn get observaciones => text().nullable()();

  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get deletedAt => dateTime().nullable()();

  /// Estado de sincronización del registro. No se envía al servidor.
  TextColumn get estadoSync =>
      text().withDefault(const Constant('PENDIENTE'))();

  @override
  Set<Column> get primaryKey => {id};

  @override
  List<String> get customConstraints => [
        // La numeración de manejo se repite entre establecimientos, así que
        // la unicidad es por predio y no global.
        'UNIQUE (predio_id, caravana)',
      ];
}

/// Marca temporal del último cambio recibido del servidor, por entidad.
/// Permite pedir solo lo modificado desde entonces en vez de traer el hato
/// completo en cada sincronización.
@DataClassName('MarcaSync')
class MarcasSync extends Table {
  TextColumn get entidad => text()();
  DateTimeColumn get sincronizadoHasta => dateTime()();

  @override
  Set<Column> get primaryKey => {entidad};
}

@DriftDatabase(tables: [Animales, MarcasSync])
class BaseDatosLocal extends _$BaseDatosLocal {
  BaseDatosLocal([QueryExecutor? executor])
      : super(executor ?? driftDatabase(name: 'ganabol'));

  @override
  int get schemaVersion => 1;

  // --- Consultas del inventario -------------------------------------------

  /// Animales visibles del predio, ordenados por caravana.
  /// Se observan como stream para que la interfaz se actualice sola cuando la
  /// sincronización escribe en la base.
  Stream<List<Animal>> observarAnimales({String? busqueda, String? fase}) {
    final consulta = select(animales)
      ..where((a) => a.deletedAt.isNull())
      ..orderBy([(a) => OrderingTerm(expression: a.caravana)]);

    if (fase != null) {
      consulta.where((a) => a.fase.equals(fase));
    }
    if (busqueda != null && busqueda.trim().isNotEmpty) {
      final patron = '%${busqueda.trim()}%';
      consulta.where((a) => a.caravana.like(patron) | a.nombre.like(patron));
    }

    return consulta.watch();
  }

  Future<Animal?> obtenerAnimal(String id) =>
      (select(animales)..where((a) => a.id.equals(id))).getSingleOrNull();

  Future<void> guardarAnimal(AnimalesCompanion animal) =>
      into(animales).insertOnConflictUpdate(animal);

  Future<void> guardarAnimales(List<AnimalesCompanion> lote) async {
    await batch((b) => b.insertAllOnConflictUpdate(animales, lote));
  }

  /// Baja lógica. El registro queda pendiente de sincronizar para que el
  /// servidor y los demás dispositivos reciban la eliminación.
  Future<void> eliminarAnimal(String id) =>
      (update(animales)..where((a) => a.id.equals(id))).write(
        AnimalesCompanion(
          deletedAt: Value(DateTime.now()),
          updatedAt: Value(DateTime.now()),
          estadoSync: const Value('PENDIENTE'),
        ),
      );

  // --- Sincronización ------------------------------------------------------

  Future<List<Animal>> animalesPendientes() =>
      (select(animales)..where((a) => a.estadoSync.equals('PENDIENTE'))).get();

  Future<int> contarPendientes() async {
    final consulta = selectOnly(animales)
      ..addColumns([animales.id.count()])
      ..where(animales.estadoSync.equals('PENDIENTE'));
    final fila = await consulta.getSingle();
    return fila.read(animales.id.count()) ?? 0;
  }

  Future<void> marcarSincronizado(String id) =>
      (update(animales)..where((a) => a.id.equals(id)))
          .write(const AnimalesCompanion(estadoSync: Value('SINCRONIZADO')));

  Future<DateTime?> ultimaSync(String entidad) async {
    final fila = await (select(marcasSync)
          ..where((m) => m.entidad.equals(entidad)))
        .getSingleOrNull();
    return fila?.sincronizadoHasta;
  }

  Future<void> registrarSync(String entidad, DateTime hasta) =>
      into(marcasSync).insertOnConflictUpdate(
        MarcasSyncCompanion(
          entidad: Value(entidad),
          sincronizadoHasta: Value(hasta),
        ),
      );

  /// Vacía la base local. Se usa al cerrar sesión: los datos del predio no
  /// deben quedar accesibles para el siguiente usuario del dispositivo.
  Future<void> limpiar() async {
    await batch((b) {
      b.deleteAll(animales);
      b.deleteAll(marcasSync);
    });
  }
}
