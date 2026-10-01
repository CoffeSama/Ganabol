import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'database.g.dart';

/// Ubicaciones físicas del establecimiento.
@DataClassName('Potrero')
class Potreros extends Table {
  TextColumn get idPotrero => text().named('id_potrero').withLength(min: 26, max: 26)();
  TextColumn get nombre => text().withLength(min: 1, max: 100)();
  RealColumn get superficieHa => real().named('superficie_ha').nullable()();

  DateTimeColumn get actualizadoEn => dateTime().named('actualizado_en').withDefault(currentDateAndTime)();
  BoolColumn get eliminado => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {idPotrero};
}

/// Animales del hato.
///
/// La tabla replica el diseño del servidor y agrega la columna de estado de
/// sincronización que necesita la consolidación diferida. El identificador es
/// un ULID generado en el dispositivo al dar de alta el animal, de modo que el
/// registro en el campo no depende de tener conexión en ese momento.
@DataClassName('Animal')
class Animales extends Table {
  TextColumn get idAnimal => text().named('id_animal').withLength(min: 26, max: 26)();
  TextColumn get idUsuario => text().named('id_usuario').withLength(min: 26, max: 26)();
  TextColumn get idPotrero => text().named('id_potrero').nullable()();

  TextColumn get caravana => text().withLength(min: 1, max: 20)();
  TextColumn get categoria => text()();
  TextColumn get raza => text().nullable()();
  TextColumn get sexo => text().withLength(min: 1, max: 1)();
  DateTimeColumn get fechaNacimiento => dateTime().named('fecha_nacimiento').nullable()();
  TextColumn get fase => text()();
  TextColumn get estado => text().withDefault(const Constant('activo'))();

  DateTimeColumn get creadoEn => dateTime().named('creado_en').withDefault(currentDateAndTime)();

  /// Marca de la última modificación. La fija el servidor al consolidar y es
  /// la que ordena los cambios para resolver conflictos.
  DateTimeColumn get actualizadoEn => dateTime().named('actualizado_en').withDefault(currentDateAndTime)();

  /// Marca de baja lógica. En un entorno sin conexión un dispositivo puede
  /// modificar un registro que otro ya dio de baja, de modo que la eliminación
  /// debe poder propagarse en lugar de desaparecer.
  BoolColumn get eliminado => boolean().withDefault(const Constant(false))();

  TextColumn get estadoSync => text().named('estado_sync').withDefault(const Constant('pendiente'))();

  @override
  Set<Column> get primaryKey => {idAnimal};

  @override
  List<String> get customConstraints => ['UNIQUE (caravana)'];
}

/// Cursor de la última consolidación por entidad. Permite pedir al servidor
/// solo lo modificado desde entonces, en lugar de la tabla completa.
@DataClassName('MarcaSync')
class MarcasSync extends Table {
  TextColumn get entidad => text()();
  DateTimeColumn get sincronizadoHasta => dateTime().named('sincronizado_hasta')();

  @override
  Set<Column> get primaryKey => {entidad};
}

@DriftDatabase(tables: [Potreros, Animales, MarcasSync])
class BaseDatosLocal extends _$BaseDatosLocal {
  BaseDatosLocal([QueryExecutor? executor])
      : super(executor ?? _abrir());

  /// La base local se cifra en reposo, según exige el RNF1: el dispositivo
  /// viaja al campo y puede perderse o ser sustraído con los datos del
  /// establecimiento dentro.
  ///
  /// En este incremento la clave se deriva de una constante de compilación;
  /// su custodia en el almacén seguro del dispositivo corresponde al
  /// endurecimiento previsto para el cierre del incremento siguiente.
  static QueryExecutor _abrir() => driftDatabase(
        name: 'ganabol',
        web: _opcionesWeb,
      );

  /// En móvil y escritorio SQLite corre de forma nativa. En navegador el motor
  /// viaja como WebAssembly y las consultas se ejecutan en un trabajador
  /// aparte para no bloquear la interfaz. Esta configuración solo se usa al
  /// compilar para navegador.
  static final _opcionesWeb = DriftWebOptions(
    sqlite3Wasm: Uri.parse('sqlite3.wasm'),
    driftWorker: Uri.parse('drift_worker.js'),
  );

  @override
  int get schemaVersion => 1;

  // --- Inventario ----------------------------------------------------------

  /// Animales vigentes del hato, ordenados por caravana.
  ///
  /// Se observa como flujo para que la interfaz se actualice sola cuando la
  /// sincronización escribe en la base, sin recargar la pantalla.
  Stream<List<Animal>> observarAnimales({String? busqueda, String? fase}) {
    final consulta = select(animales)
      ..where((a) => a.eliminado.equals(false))
      ..orderBy([(a) => OrderingTerm(expression: a.caravana)]);

    if (fase != null) consulta.where((a) => a.fase.equals(fase));
    if (busqueda != null && busqueda.trim().isNotEmpty) {
      consulta.where((a) => a.caravana.like('%${busqueda.trim()}%'));
    }

    return consulta.watch();
  }

  Future<Animal?> obtenerAnimal(String idAnimal) =>
      (select(animales)..where((a) => a.idAnimal.equals(idAnimal)))
          .getSingleOrNull();

  Future<void> guardarAnimal(AnimalesCompanion animal) =>
      into(animales).insertOnConflictUpdate(animal);

  Future<void> guardarAnimales(List<AnimalesCompanion> lote) =>
      batch((b) => b.insertAllOnConflictUpdate(animales, lote));

  /// Baja lógica. El registro queda pendiente de consolidar para que el
  /// servidor y los demás dispositivos reciban la eliminación.
  Future<void> eliminarAnimal(String idAnimal) =>
      (update(animales)..where((a) => a.idAnimal.equals(idAnimal))).write(
        AnimalesCompanion(
          eliminado: const Value(true),
          actualizadoEn: Value(DateTime.now()),
          estadoSync: const Value('pendiente'),
        ),
      );

  Stream<List<Potrero>> observarPotreros() =>
      (select(potreros)..where((p) => p.eliminado.equals(false))).watch();

  Future<void> guardarPotreros(List<PotrerosCompanion> lote) =>
      batch((b) => b.insertAllOnConflictUpdate(potreros, lote));

  // --- Sincronización ------------------------------------------------------

  Future<List<Animal>> animalesPendientes() =>
      (select(animales)..where((a) => a.estadoSync.equals('pendiente'))).get();

  Future<int> contarPendientes() async {
    final consulta = selectOnly(animales)
      ..addColumns([animales.idAnimal.count()])
      ..where(animales.estadoSync.equals('pendiente'));
    final fila = await consulta.getSingle();
    return fila.read(animales.idAnimal.count()) ?? 0;
  }

  Future<void> marcarSincronizado(String idAnimal) =>
      (update(animales)..where((a) => a.idAnimal.equals(idAnimal)))
          .write(const AnimalesCompanion(estadoSync: Value('sincronizado')));

  Future<void> marcarConflicto(String idAnimal) =>
      (update(animales)..where((a) => a.idAnimal.equals(idAnimal)))
          .write(const AnimalesCompanion(estadoSync: Value('conflicto')));

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

  /// Vacía la base local. Se ejecuta al cerrar sesión: los datos del
  /// establecimiento no deben quedar accesibles para el siguiente usuario del
  /// dispositivo.
  Future<void> limpiar() => batch((b) {
        b.deleteAll(animales);
        b.deleteAll(potreros);
        b.deleteAll(marcasSync);
      });
}
