import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../local/database.dart';
import '../remote/api_client.dart';
import '../../domain/identificadores.dart';
import '../../domain/fechas.dart';
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
/// a la red. La consolidación con el servidor ocurre aparte, cuando hay
/// conexión, y los cambios que trae se reflejan solos en la pantalla porque
/// las consultas locales son flujos observables.
class AnimalesRepository {
  AnimalesRepository(this._db, this._api);

  final BaseDatosLocal _db;
  final ApiClient _api;

  static const _entidad = 'animal';

  Stream<List<Animal>> observar({String? busqueda, String? fase}) =>
      _db.observarAnimales(busqueda: busqueda, fase: fase);

  Stream<List<Potrero>> observarPotreros() => _db.observarPotreros();

  Future<Animal?> obtener(String idAnimal) => _db.obtenerAnimal(idAnimal);

  Future<int> contarPendientes() => _db.contarPendientes();

  /// Da de alta un animal. El identificador se genera aquí, en el dispositivo,
  /// antes de cualquier contacto con el servidor.
  Future<String> registrar({
    required String caravana,
    required Sexo sexo,
    required CategoriaAnimal categoria,
    required FaseManejo fase,
    required String idUsuario,
    String? raza,
    DateTime? fechaNacimiento,
    String? idPotrero,
  }) async {
    final idAnimal = nuevoIdentificador();

    await _db.guardarAnimal(
      AnimalesCompanion.insert(
        idAnimal: idAnimal,
        idUsuario: idUsuario,
        caravana: caravana,
        categoria: categoria.valor,
        sexo: sexo.valor,
        fase: fase.valor,
        raza: Value(raza),
        fechaNacimiento: Value(fechaNacimiento),
        idPotrero: Value(idPotrero),
      ),
    );

    // Intento oportunista: con señal el animal sube enseguida; sin ella queda
    // pendiente para la próxima pasada.
    unawaited(sincronizar());
    return idAnimal;
  }

  Future<void> actualizar(
    String idAnimal, {
    String? caravana,
    Sexo? sexo,
    String? raza,
    DateTime? fechaNacimiento,
    CategoriaAnimal? categoria,
    FaseManejo? fase,
    EstadoAnimal? estado,
    String? idPotrero,
  }) async {
    await (_db.update(_db.animales)
          ..where((a) => a.idAnimal.equals(idAnimal)))
        .write(
      AnimalesCompanion(
        caravana: caravana == null ? const Value.absent() : Value(caravana),
        sexo: sexo == null ? const Value.absent() : Value(sexo.valor),
        raza: raza == null ? const Value.absent() : Value(raza),
        fechaNacimiento: fechaNacimiento == null
            ? const Value.absent()
            : Value(fechaNacimiento),
        categoria:
            categoria == null ? const Value.absent() : Value(categoria.valor),
        fase: fase == null ? const Value.absent() : Value(fase.valor),
        estado: estado == null ? const Value.absent() : Value(estado.valor),
        idPotrero: idPotrero == null ? const Value.absent() : Value(idPotrero),
        actualizadoEn: Value(DateTime.now()),
        estadoSync: const Value('pendiente'),
      ),
    );
    unawaited(sincronizar());
  }

  Future<void> eliminar(String idAnimal) async {
    await _db.eliminarAnimal(idAnimal);
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
  /// el panel web, conviene que el servidor conozca ambos cambios antes de que
  /// el dispositivo se quede con una sola versión.
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
      return ResultadoSync(enviados: 0, recibidos: 0, error: _mensaje(e));
    }
  }

  Future<int> _enviarPendientes() async {
    final pendientes = await _db.animalesPendientes();
    var enviados = 0;

    for (final animal in pendientes) {
      final esAlta = animal.creadoEn == animal.actualizadoEn;

      final respuesta = esAlta
          ? await _api.dio.post<Map<String, dynamic>>(
              '/animales',
              data: _aJson(animal, incluirId: true),
            )
          : await _api.dio.patch<Map<String, dynamic>>(
              '/animales/${animal.idAnimal}',
              data: _aJson(animal, incluirId: false),
            );

      final codigo = respuesta.statusCode ?? 0;

      if (esSatisfactoria(codigo)) {
        await _db.marcarSincronizado(animal.idAnimal);
        enviados++;
      } else if (codigo == 409) {
        // La caravana ya existe en el servidor con otro identificador: el
        // usuario tiene que decidir, de modo que se marca y se deja de
        // reintentar en cada pasada.
        await _db.marcarConflicto(animal.idAnimal);
      }
    }

    return enviados;
  }

  Future<int> _traerCambios() async {
    final desde = await _db.ultimaSync(_entidad) ?? DateTime.utc(2000);

    final respuesta = await _api.dio.get<Map<String, dynamic>>(
      '/animales/cambios',
      queryParameters: {'desde': desde.toUtc().toIso8601String()},
    );

    if (!esSatisfactoria(respuesta.statusCode) || respuesta.data == null) return 0;

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
        if (incluirId) 'idAnimal': a.idAnimal,
        'caravana': a.caravana,
        'categoria': a.categoria,
        if (a.raza != null) 'raza': a.raza,
        'sexo': a.sexo,
        if (a.fechaNacimiento != null)
          'fechaNacimiento': diaAJson(a.fechaNacimiento!),
        'fase': a.fase,
        'estado': a.estado,
        if (a.idPotrero != null) 'idPotrero': a.idPotrero,
      };

  AnimalesCompanion _desdeJson(Map<String, dynamic> json) =>
      AnimalesCompanion.insert(
        idAnimal: json['idAnimal'] as String,
        idUsuario: json['idUsuario'] as String,
        caravana: json['caravana'] as String,
        categoria: json['categoria'] as String,
        sexo: json['sexo'] as String,
        fase: json['fase'] as String,
        raza: Value(json['raza'] as String?),
        idPotrero: Value(json['idPotrero'] as String?),
        fechaNacimiento: Value(diaDesdeJsonONulo(json['fechaNacimiento'])),
        estado: Value(json['estado'] as String? ?? 'activo'),
        creadoEn: Value(DateTime.parse(json['creadoEn'] as String)),
        actualizadoEn: Value(DateTime.parse(json['actualizadoEn'] as String)),
        eliminado: Value(json['eliminado'] as bool? ?? false),
        // Viene del servidor, de modo que ya está consolidado.
        estadoSync: const Value('sincronizado'),
      );

  String _mensaje(DioException e) => switch (e.type) {
        DioExceptionType.connectionTimeout ||
        DioExceptionType.receiveTimeout =>
          'El servidor tardó demasiado en responder',
        DioExceptionType.connectionError => 'No se pudo contactar al servidor',
        _ => 'Error de sincronización',
      };
}
