import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:ulid/ulid.dart';

import '../local/database.dart';
import '../remote/api_client.dart';
import '../../domain/models/enums.dart';

/// Resultado de una pasada de sincronización, para informar al usuario.
class ResultadoSync {
  const ResultadoSync({
    required this.enviados,
    required this.recibidos,
    this.error,
  });

  final int enviados;
  final int recibidos;
  final String? error;

  bool get exitoso => error == null;
}

/// Acceso al inventario bovino.
///
/// Toda lectura y escritura va contra la base local: la interfaz nunca espera
/// a la red. La sincronización con el servidor ocurre aparte, cuando hay
/// conexión, y los cambios que trae se reflejan solos en la pantalla porque
/// las consultas locales son streams.
class AnimalesRepository {
  AnimalesRepository(this._db, this._api);

  final BaseDatosLocal _db;
  final ApiClient _api;

  static const _entidad = 'animales';

  Stream<List<Animal>> observar({String? busqueda, String? fase}) =>
      _db.observarAnimales(busqueda: busqueda, fase: fase);

  Future<Animal?> obtener(String id) => _db.obtenerAnimal(id);

  Future<int> contarPendientes() => _db.contarPendientes();

  /// Registra un animal. El identificador se genera aquí, en el dispositivo,
  /// antes de cualquier contacto con el servidor.
  Future<String> registrar({
    required String caravana,
    required Sexo sexo,
    required CategoriaAnimal categoria,
    required String predioId,
    String? nombre,
    String? raza,
    DateTime? fechaNacimiento,
    FaseProductiva fase = FaseProductiva.crianza,
    String? observaciones,
  }) async {
    final id = Ulid().toString();

    await _db.guardarAnimal(
      AnimalesCompanion.insert(
        id: id,
        caravana: caravana,
        sexo: sexo.valor,
        categoria: categoria.valor,
        predioId: predioId,
        nombre: Value(nombre),
        raza: Value(raza),
        fechaNacimiento: Value(fechaNacimiento),
        fase: Value(fase.valor),
        observaciones: Value(observaciones),
      ),
    );

    // Intento oportunista: si hay señal el animal sube enseguida, y si no,
    // queda pendiente para la próxima pasada.
    unawaited(sincronizar());
    return id;
  }

  Future<void> actualizar(
    String id, {
    String? caravana,
    String? nombre,
    Sexo? sexo,
    String? raza,
    DateTime? fechaNacimiento,
    CategoriaAnimal? categoria,
    FaseProductiva? fase,
    EstadoAnimal? estado,
    String? observaciones,
  }) async {
    await (_db.update(_db.animales)..where((a) => a.id.equals(id))).write(
      AnimalesCompanion(
        caravana: caravana == null ? const Value.absent() : Value(caravana),
        nombre: nombre == null ? const Value.absent() : Value(nombre),
        sexo: sexo == null ? const Value.absent() : Value(sexo.valor),
        raza: raza == null ? const Value.absent() : Value(raza),
        fechaNacimiento: fechaNacimiento == null
            ? const Value.absent()
            : Value(fechaNacimiento),
        categoria:
            categoria == null ? const Value.absent() : Value(categoria.valor),
        fase: fase == null ? const Value.absent() : Value(fase.valor),
        estado: estado == null ? const Value.absent() : Value(estado.valor),
        observaciones:
            observaciones == null ? const Value.absent() : Value(observaciones),
        updatedAt: Value(DateTime.now()),
        estadoSync: const Value('PENDIENTE'),
      ),
    );
    unawaited(sincronizar());
  }

  Future<void> eliminar(String id) async {
    await _db.eliminarAnimal(id);
    unawaited(sincronizar());
  }

  // --- Sincronización ------------------------------------------------------

  Future<bool> hayConexion() async {
    final estado = await Connectivity().checkConnectivity();
    return !estado.contains(ConnectivityResult.none);
  }

  /// Envía lo pendiente y trae lo que cambió en el servidor.
  ///
  /// El envío va primero: si un animal se creó aquí y también se modificó en
  /// el panel web, conviene que el servidor conozca ambos cambios antes de
  /// que el dispositivo se quede con una versión sola.
  Future<ResultadoSync> sincronizar() async {
    if (!await hayConexion()) {
      return const ResultadoSync(
        enviados: 0,
        recibidos: 0,
        error: 'Sin conexión',
      );
    }

    try {
      final enviados = await _enviarPendientes();
      final recibidos = await _traerCambios();
      return ResultadoSync(enviados: enviados, recibidos: recibidos);
    } on DioException catch (e) {
      return ResultadoSync(
        enviados: 0,
        recibidos: 0,
        error: _mensajeDeError(e),
      );
    }
  }

  Future<int> _enviarPendientes() async {
    final pendientes = await _db.animalesPendientes();
    var enviados = 0;

    for (final animal in pendientes) {
      final esNuevo = animal.createdAt == animal.updatedAt;

      final respuesta = esNuevo
          ? await _api.dio.post<Map<String, dynamic>>(
              '/animales',
              data: _aJson(animal, incluirId: true),
            )
          : await _api.dio.patch<Map<String, dynamic>>(
              '/animales/${animal.id}',
              data: _aJson(animal, incluirId: false),
            );

      final codigo = respuesta.statusCode ?? 0;

      if (codigo >= 200 && codigo < 300) {
        await _db.marcarSincronizado(animal.id);
        enviados++;
      } else if (codigo == 409) {
        // Caravana duplicada en el servidor: el usuario tiene que decidir,
        // así que se marca y se deja de reintentar en cada pasada.
        await (_db.update(_db.animales)..where((a) => a.id.equals(animal.id)))
            .write(const AnimalesCompanion(estadoSync: Value('CONFLICTO')));
      }
    }

    return enviados;
  }

  Future<int> _traerCambios() async {
    final desde =
        await _db.ultimaSync(_entidad) ?? DateTime.utc(2000);

    final respuesta = await _api.dio.get<Map<String, dynamic>>(
      '/animales/cambios',
      queryParameters: {'desde': desde.toUtc().toIso8601String()},
    );

    if (respuesta.statusCode != 200 || respuesta.data == null) return 0;

    final lista = (respuesta.data!['animales'] as List<dynamic>? ?? [])
        .cast<Map<String, dynamic>>();

    await _db.guardarAnimales(lista.map(_desdeJson).toList());

    final hasta = respuesta.data!['sincronizadoHasta'] as String?;
    if (hasta != null) {
      await _db.registrarSync(_entidad, DateTime.parse(hasta));
    }

    return lista.length;
  }

  Map<String, dynamic> _aJson(Animal a, {required bool incluirId}) => {
        if (incluirId) 'id': a.id,
        'caravana': a.caravana,
        if (a.nombre != null) 'nombre': a.nombre,
        'sexo': a.sexo,
        if (a.raza != null) 'raza': a.raza,
        if (a.fechaNacimiento != null)
          'fechaNacimiento':
              a.fechaNacimiento!.toIso8601String().split('T').first,
        'categoria': a.categoria,
        'fase': a.fase,
        'estado': a.estado,
        if (a.madreId != null) 'madreId': a.madreId,
        if (a.observaciones != null) 'observaciones': a.observaciones,
      };

  AnimalesCompanion _desdeJson(Map<String, dynamic> json) =>
      AnimalesCompanion.insert(
        id: json['id'] as String,
        caravana: json['caravana'] as String,
        sexo: json['sexo'] as String,
        categoria: json['categoria'] as String,
        predioId: json['predioId'] as String,
        nombre: Value(json['nombre'] as String?),
        raza: Value(json['raza'] as String?),
        fechaNacimiento: Value(json['fechaNacimiento'] == null
            ? null
            : DateTime.parse(json['fechaNacimiento'] as String)),
        fase: Value(json['fase'] as String? ?? 'CRIANZA'),
        estado: Value(json['estado'] as String? ?? 'ACTIVO'),
        madreId: Value(json['madreId'] as String?),
        observaciones: Value(json['observaciones'] as String?),
        createdAt: Value(DateTime.parse(json['createdAt'] as String)),
        updatedAt: Value(DateTime.parse(json['updatedAt'] as String)),
        deletedAt: Value(json['deletedAt'] == null
            ? null
            : DateTime.parse(json['deletedAt'] as String)),
        // Viene del servidor, así que ya está sincronizado.
        estadoSync: const Value('SINCRONIZADO'),
      );

  String _mensajeDeError(DioException e) => switch (e.type) {
        DioExceptionType.connectionTimeout ||
        DioExceptionType.receiveTimeout =>
          'El servidor tardó demasiado en responder',
        DioExceptionType.connectionError =>
          'No se pudo contactar al servidor',
        _ => 'Error de sincronización',
      };
}
