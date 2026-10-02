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

/// Mediciones morfométricas y peso estimado.
///
/// Se guardan las medidas y no solo el peso: si la constante de la fórmula se
/// recalibra, el historial completo puede recalcularse. Guardar únicamente el
/// resultado convertiría cada pesaje en un dato que ya no se puede revisar.
@DataClassName('Pesaje')
class Pesajes extends Table {
  TextColumn get idPesaje => text().named('id_pesaje').withLength(min: 26, max: 26)();
  TextColumn get idAnimal => text().named('id_animal').withLength(min: 26, max: 26)();

  DateTimeColumn get fecha => dateTime()();
  RealColumn get perimetroToracico => real().named('perimetro_toracico')();
  RealColumn get largoCorporal => real().named('largo_corporal')();
  RealColumn get pesoEstimado => real().named('peso_estimado')();

  /// Constante con la que se obtuvo este peso, para que una recalibración
  /// posterior no invalide la trazabilidad de los pesos ya estimados.
  RealColumn get constante => real()();

  DateTimeColumn get actualizadoEn =>
      dateTime().named('actualizado_en').withDefault(currentDateAndTime)();
  BoolColumn get eliminado => boolean().withDefault(const Constant(false))();
  TextColumn get estadoSync =>
      text().named('estado_sync').withDefault(const Constant('pendiente'))();

  @override
  Set<Column> get primaryKey => {idPesaje};
}

/// Eventos sanitarios del hato.
@DataClassName('EventoSanitario')
class EventosSanitarios extends Table {
  TextColumn get idEvento => text().named('id_evento').withLength(min: 26, max: 26)();
  TextColumn get idAnimal => text().named('id_animal').withLength(min: 26, max: 26)();

  /// Protocolo que este evento cumple, cuando responde a uno del calendario.
  TextColumn get idPlan => text().named('id_plan').nullable()();

  TextColumn get tipo => text()();
  TextColumn get producto => text().nullable()();
  TextColumn get dosis => text().nullable()();
  DateTimeColumn get fecha => dateTime()();
  TextColumn get responsable => text().nullable()();

  DateTimeColumn get actualizadoEn =>
      dateTime().named('actualizado_en').withDefault(currentDateAndTime)();
  BoolColumn get eliminado => boolean().withDefault(const Constant(false))();
  TextColumn get estadoSync =>
      text().named('estado_sync').withDefault(const Constant('pendiente'))();

  @override
  Set<Column> get primaryKey => {idEvento};
}

/// Protocolos sanitarios configurables que originan las alertas.
///
/// Los configura el servidor y el dispositivo los recibe al sincronizar: son
/// la definición del calendario, no un dato que se capture en el campo.
@DataClassName('PlanSanitario')
class PlanesSanitarios extends Table {
  TextColumn get idPlan => text().named('id_plan').withLength(min: 26, max: 26)();
  TextColumn get nombre => text().withLength(min: 1, max: 100)();
  TextColumn get categoria => text().nullable()();
  TextColumn get tipoEvento => text().named('tipo_evento')();
  IntColumn get periodicidadDias => integer().named('periodicidad_dias')();
  TextColumn get descripcion => text().nullable()();

  DateTimeColumn get actualizadoEn =>
      dateTime().named('actualizado_en').withDefault(currentDateAndTime)();
  BoolColumn get eliminado => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {idPlan};
}

/// Tareas sanitarias próximas o vencidas.
///
/// Las genera el servidor al regenerar el calendario y el dispositivo las
/// recibe al sincronizar. Localmente solo cambian de estado: al registrar un
/// evento sin conexión, la alerta correspondiente se marca atendida de
/// inmediato para que el personal no vuelva a aplicar lo que ya aplicó, y el
/// servidor confirma ese cierre al consolidar el evento.
@DataClassName('Alerta')
class Alertas extends Table {
  TextColumn get idAlerta => text().named('id_alerta').withLength(min: 26, max: 26)();
  TextColumn get idAnimal => text().named('id_animal').withLength(min: 26, max: 26)();
  TextColumn get idPlan => text().named('id_plan').nullable()();

  TextColumn get tipo => text()();
  TextColumn get descripcion => text().nullable()();
  DateTimeColumn get fechaProgramada => dateTime().named('fecha_programada')();
  TextColumn get estado => text().withDefault(const Constant('pendiente'))();

  DateTimeColumn get actualizadoEn =>
      dateTime().named('actualizado_en').withDefault(currentDateAndTime)();
  BoolColumn get eliminado => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {idAlerta};
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

@DriftDatabase(tables: [
  Potreros,
  Animales,
  Pesajes,
  EventosSanitarios,
  PlanesSanitarios,
  Alertas,
  MarcasSync,
])
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
  int get schemaVersion => 2;

  /// Migración entre versiones del esquema local.
  ///
  /// El dispositivo del productor conserva datos capturados sin conexión que
  /// todavía no se han consolidado. Una actualización de la aplicación no puede
  /// recrear la base: perdería justamente lo que el servidor aún no tiene. Las
  /// tablas nuevas se agregan sobre la base existente.
  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (m) => m.createAll(),
        onUpgrade: (m, desde, hasta) async {
          if (desde < 2) {
            await m.createTable(pesajes);
            await m.createTable(eventosSanitarios);
            await m.createTable(planesSanitarios);
            await m.createTable(alertas);
          }
        },
      );

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

  // --- Pesaje --------------------------------------------------------------

  /// Historial de pesos de un animal, del más reciente al más antiguo.
  Stream<List<Pesaje>> observarPesajes(String idAnimal) =>
      (select(pesajes)
            ..where((p) => p.idAnimal.equals(idAnimal) & p.eliminado.equals(false))
            ..orderBy([
              (p) => OrderingTerm(expression: p.fecha, mode: OrderingMode.desc),
            ]))
          .watch();

  Future<void> guardarPesaje(PesajesCompanion pesaje) =>
      into(pesajes).insertOnConflictUpdate(pesaje);

  Future<void> guardarPesajes(List<PesajesCompanion> lote) =>
      batch((b) => b.insertAllOnConflictUpdate(pesajes, lote));

  /// Último peso estimado de cada animal, para la lista del hato.
  ///
  /// Se resuelve con una sola consulta agrupada en lugar de una por animal: la
  /// lista se redibuja con cada cambio y una consulta por fila la volvería
  /// lenta en un hato de cientos de animales.
  Stream<Map<String, double>> observarUltimoPeso() {
    final maxFecha = pesajes.fecha.max();
    final consulta = selectOnly(pesajes)
      ..addColumns([pesajes.idAnimal, pesajes.pesoEstimado, maxFecha])
      ..where(pesajes.eliminado.equals(false))
      ..groupBy([pesajes.idAnimal]);

    return consulta.watch().map((filas) => {
          for (final f in filas)
            if (f.read(pesajes.idAnimal) != null &&
                f.read(pesajes.pesoEstimado) != null)
              f.read(pesajes.idAnimal)!: f.read(pesajes.pesoEstimado)!,
        });
  }

  // --- Sanidad -------------------------------------------------------------

  /// Historial sanitario de un animal, del evento más reciente al más antiguo.
  Stream<List<EventoSanitario>> observarEventos(String idAnimal) =>
      (select(eventosSanitarios)
            ..where((e) => e.idAnimal.equals(idAnimal) & e.eliminado.equals(false))
            ..orderBy([
              (e) => OrderingTerm(expression: e.fecha, mode: OrderingMode.desc),
            ]))
          .watch();

  Future<void> guardarEvento(EventosSanitariosCompanion evento) =>
      into(eventosSanitarios).insertOnConflictUpdate(evento);

  Future<void> guardarEventos(List<EventosSanitariosCompanion> lote) =>
      batch((b) => b.insertAllOnConflictUpdate(eventosSanitarios, lote));

  Stream<List<PlanSanitario>> observarPlanes() =>
      (select(planesSanitarios)
            ..where((p) => p.eliminado.equals(false))
            ..orderBy([(p) => OrderingTerm(expression: p.nombre)]))
          .watch();

  Future<void> guardarPlanes(List<PlanesSanitariosCompanion> lote) =>
      batch((b) => b.insertAllOnConflictUpdate(planesSanitarios, lote));

  /// Alertas abiertas con la caravana del animal, de la más urgente a la
  /// menos urgente.
  ///
  /// La bandeja necesita mostrar a qué animal corresponde cada tarea, de modo
  /// que la unión con el inventario se hace en la consulta y no recorriendo la
  /// lista para buscar cada animal por separado.
  Stream<List<AlertaConAnimal>> observarAlertasAbiertas() {
    final consulta = select(alertas).join([
      innerJoin(animales, animales.idAnimal.equalsExp(alertas.idAnimal)),
    ])
      ..where(alertas.eliminado.equals(false) &
          alertas.estado.isNotValue('atendida') &
          animales.eliminado.equals(false))
      ..orderBy([OrderingTerm(expression: alertas.fechaProgramada)]);

    return consulta.watch().map((filas) => filas
        .map((f) => AlertaConAnimal(
              alerta: f.readTable(alertas),
              animal: f.readTable(animales),
            ))
        .toList());
  }

  Future<void> guardarAlertas(List<AlertasCompanion> lote) =>
      batch((b) => b.insertAllOnConflictUpdate(alertas, lote));

  /// Marca como atendidas las alertas que un evento viene a cumplir.
  ///
  /// Se aplica en el dispositivo al registrar el evento, sin esperar al
  /// servidor: en el campo el personal necesita que la tarea desaparezca de la
  /// bandeja en el momento, o volverá a aplicar lo que ya aplicó. El servidor
  /// confirma el mismo cierre al consolidar.
  Future<int> atenderAlertasDe({
    required String idAnimal,
    String? idPlan,
    required String tipoEvento,
    required DateTime fecha,
    required int ventanaDias,
  }) async {
    final limite = fecha.add(Duration(days: ventanaDias));

    // Con protocolo declarado se cierra solo la alerta de ese protocolo. Sin
    // él, el criterio es el tipo, que es lo más fiel que puede inferirse.
    final planesDelTipo = idPlan != null
        ? [idPlan]
        : (await (select(planesSanitarios)
                  ..where((p) =>
                      p.tipoEvento.equals(tipoEvento) & p.eliminado.equals(false)))
                .get())
            .map((p) => p.idPlan)
            .toList();

    if (planesDelTipo.isEmpty) return 0;

    return (update(alertas)
          ..where((a) =>
              a.idAnimal.equals(idAnimal) &
              a.idPlan.isIn(planesDelTipo) &
              a.eliminado.equals(false) &
              a.estado.isNotValue('atendida') &
              a.fechaProgramada.isSmallerOrEqualValue(limite)))
        .write(const AlertasCompanion(estado: Value('atendida')));
  }

  // --- Sincronización ------------------------------------------------------

  Future<List<Animal>> animalesPendientes() =>
      (select(animales)..where((a) => a.estadoSync.equals('pendiente'))).get();

  Future<List<Pesaje>> pesajesPendientes() =>
      (select(pesajes)..where((p) => p.estadoSync.equals('pendiente'))).get();

  Future<List<EventoSanitario>> eventosPendientes() =>
      (select(eventosSanitarios)..where((e) => e.estadoSync.equals('pendiente')))
          .get();

  Future<void> marcarPesajeSincronizado(String idPesaje) =>
      (update(pesajes)..where((p) => p.idPesaje.equals(idPesaje)))
          .write(const PesajesCompanion(estadoSync: Value('sincronizado')));

  Future<void> marcarPesajeConflicto(String idPesaje) =>
      (update(pesajes)..where((p) => p.idPesaje.equals(idPesaje)))
          .write(const PesajesCompanion(estadoSync: Value('conflicto')));

  Future<void> marcarEventoSincronizado(String idEvento) =>
      (update(eventosSanitarios)..where((e) => e.idEvento.equals(idEvento)))
          .write(const EventosSanitariosCompanion(estadoSync: Value('sincronizado')));

  Future<void> marcarEventoConflicto(String idEvento) =>
      (update(eventosSanitarios)..where((e) => e.idEvento.equals(idEvento)))
          .write(const EventosSanitariosCompanion(estadoSync: Value('conflicto')));

  /// Total de registros pendientes de consolidar, de todas las entidades.
  ///
  /// Es el número que la interfaz muestra al usuario: lo que le importa es
  /// cuánto trabajo suyo todavía no llegó al servidor, no de qué tabla sale.
  Future<int> contarPendientes() async {
    Future<int> cuenta<T extends Table, D>(
      TableInfo<T, D> tabla,
      GeneratedColumn<String> clave,
      GeneratedColumn<String> estado,
    ) async {
      final consulta = selectOnly(tabla)
        ..addColumns([clave.count()])
        ..where(estado.equals('pendiente'));
      final fila = await consulta.getSingle();
      return fila.read(clave.count()) ?? 0;
    }

    final totales = await Future.wait([
      cuenta(animales, animales.idAnimal, animales.estadoSync),
      cuenta(pesajes, pesajes.idPesaje, pesajes.estadoSync),
      cuenta(eventosSanitarios, eventosSanitarios.idEvento,
          eventosSanitarios.estadoSync),
    ]);

    return totales.reduce((a, b) => a + b);
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
        b.deleteAll(alertas);
        b.deleteAll(eventosSanitarios);
        b.deleteAll(pesajes);
        b.deleteAll(planesSanitarios);
        b.deleteAll(animales);
        b.deleteAll(potreros);
        b.deleteAll(marcasSync);
      });
}

/// Una alerta del calendario junto al animal a que corresponde.
class AlertaConAnimal {
  const AlertaConAnimal({required this.alerta, required this.animal});

  final Alerta alerta;
  final Animal animal;
}
