import 'dart:async';

import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../local/database.dart';
import '../remote/api_client.dart';
import '../../domain/identificadores.dart';
import 'animales_repository.dart' show AnimalesRepository, ResultadoSync;
import '../../domain/fechas.dart';
import '../../domain/models/enums.dart';

/// Días de anticipación con que una tarea se considera próxima.
///
/// Debe coincidir con la ventana del servidor: es la misma regla del mismo
/// calendario, aplicada en los dos extremos para que el cierre de una alerta
/// hecho sin conexión produzca el mismo resultado que el del servidor.
const int ventanaAnticipacionDias = 30;

/// Acceso al historial sanitario y al calendario de alertas (RF5 y RF13).
///
/// Los eventos se registran en el dispositivo, donde ocurren. Los protocolos y
/// las alertas los calcula el servidor y el dispositivo los recibe, con una
/// excepción: al registrar un evento sin conexión, la alerta que ese evento
/// cumple se marca atendida localmente de inmediato. Si hubiera que esperar al
/// servidor, el personal seguiría viendo pendiente una tarea que acaba de
/// hacer, y la volvería a hacer.
class SanidadRepository {
  SanidadRepository(this._db, this._api, this._animales);

  final BaseDatosLocal _db;
  final ApiClient _api;
  final AnimalesRepository _animales;

  static const _entidad = 'sanidad';

  Stream<List<EventoSanitario>> observarEventos(String idAnimal) =>
      _db.observarEventos(idAnimal);

  Stream<List<PlanSanitario>> observarPlanes() => _db.observarPlanes();

  Stream<List<AlertaConAnimal>> observarAlertas() =>
      _db.observarAlertasAbiertas();

  /// Protocolos aplicables a un animal, para ofrecerlos al registrar el
  /// evento. Un protocolo sin categoría aplica a todo el hato.
  Stream<List<PlanSanitario>> observarPlanesPara(Animal animal) =>
      _db.observarPlanes().map((planes) => planes
          .where((p) => p.categoria == null || p.categoria == animal.categoria)
          .toList());

  /// Registra un evento sanitario y cierra las alertas que viene a cumplir.
  Future<String> registrarEvento({
    required String idAnimal,
    required TipoEventoSanitario tipo,
    required DateTime fecha,
    String? idPlan,
    String? producto,
    String? dosis,
    String? responsable,
  }) async {
    final idEvento = nuevoIdentificador();
    // Medianoche local: la base local devuelve las marcas en hora local y
    // una fecha fijada en UTC volvería corrida un día en Bolivia.
    final dia = DateTime(fecha.year, fecha.month, fecha.day);

    await _db.guardarEvento(
      EventosSanitariosCompanion.insert(
        idEvento: idEvento,
        idAnimal: idAnimal,
        tipo: tipo.valor,
        fecha: dia,
        idPlan: Value(idPlan),
        producto: Value(producto),
        dosis: Value(dosis),
        responsable: Value(responsable),
      ),
    );

    if (tipo.cumpleProtocolo) {
      await _db.atenderAlertasDe(
        idAnimal: idAnimal,
        idPlan: idPlan,
        tipoEvento: tipo.valor,
        fecha: dia,
        ventanaDias: ventanaAnticipacionDias,
      );
    }

    unawaited(sincronizar());
    return idEvento;
  }

  // --- Sincronización ------------------------------------------------------

  Future<ResultadoSync> sincronizar() async {
    if (!await _animales.hayConexion()) {
      return const ResultadoSync(enviados: 0, recibidos: 0, error: 'Sin conexión');
    }

    try {
      final enviados = await _enviarPendientes();
      final recibidos = await _traerCambios();
      return ResultadoSync(enviados: enviados, recibidos: recibidos);
    } on DioException catch (_) {
      return const ResultadoSync(
        enviados: 0,
        recibidos: 0,
        error: 'Error de sincronización',
      );
    }
  }

  Future<int> _enviarPendientes() async {
    final pendientes = await _db.eventosPendientes();
    var enviados = 0;

    for (final e in pendientes) {
      final respuesta = await _api.dio.post<Map<String, dynamic>>(
        '/sanidad/eventos',
        data: {
          'idEvento': e.idEvento,
          'idAnimal': e.idAnimal,
          if (e.idPlan != null) 'idPlan': e.idPlan,
          'tipo': e.tipo,
          if (e.producto != null) 'producto': e.producto,
          if (e.dosis != null) 'dosis': e.dosis,
          'fecha': diaAJson(e.fecha),
          if (e.responsable != null) 'responsable': e.responsable,
        },
      );

      final codigo = respuesta.statusCode ?? 0;
      if (esSatisfactoria(codigo)) {
        await _db.marcarEventoSincronizado(e.idEvento);
        enviados++;
      } else if (codigo == 400 || codigo == 404) {
        await _db.marcarEventoConflicto(e.idEvento);
      }
    }

    return enviados;
  }

  /// Trae protocolos, eventos y alertas en una sola pasada.
  ///
  /// Van juntos porque forman una unidad: una alerta sin su protocolo no se
  /// puede mostrar, y el cursor de sincronización es compartido para que las
  /// tres entidades avancen a la vez y la bandeja nunca quede incoherente.
  Future<int> _traerCambios() async {
    final desde = await _db.ultimaSync(_entidad) ?? DateTime.utc(2000);

    final respuesta = await _api.dio.get<Map<String, dynamic>>(
      '/sanidad/cambios',
      queryParameters: {'desde': desde.toUtc().toIso8601String()},
    );

    if (!esSatisfactoria(respuesta.statusCode) || respuesta.data == null) return 0;
    final datos = respuesta.data!;

    final planes = _lista(datos['planes']);
    final eventos = _lista(datos['eventos']);
    final alertas = _lista(datos['alertas']);

    // Los protocolos van primero: las alertas los referencian para mostrar de
    // qué tarea se trata.
    await _db.guardarPlanes(planes.map(_planDesdeJson).toList());
    await _db.guardarEventos(eventos.map(_eventoDesdeJson).toList());
    await _db.guardarAlertas(alertas.map(_alertaDesdeJson).toList());

    final hasta = datos['sincronizadoHasta'] as String?;
    if (hasta != null) await _db.registrarSync(_entidad, DateTime.parse(hasta));

    return planes.length + eventos.length + alertas.length;
  }

  static List<Map<String, dynamic>> _lista(dynamic valor) =>
      (valor as List<dynamic>? ?? []).cast<Map<String, dynamic>>();

  PlanesSanitariosCompanion _planDesdeJson(Map<String, dynamic> json) =>
      PlanesSanitariosCompanion.insert(
        idPlan: json['idPlan'] as String,
        nombre: json['nombre'] as String,
        tipoEvento: json['tipoEvento'] as String,
        periodicidadDias: json['periodicidadDias'] as int,
        categoria: Value(json['categoria'] as String?),
        descripcion: Value(json['descripcion'] as String?),
        actualizadoEn: Value(DateTime.parse(json['actualizadoEn'] as String)),
        eliminado: Value(json['eliminado'] as bool? ?? false),
      );

  EventosSanitariosCompanion _eventoDesdeJson(Map<String, dynamic> json) =>
      EventosSanitariosCompanion.insert(
        idEvento: json['idEvento'] as String,
        idAnimal: json['idAnimal'] as String,
        tipo: json['tipo'] as String,
        fecha: diaDesdeJson(json['fecha'] as String),
        idPlan: Value(json['idPlan'] as String?),
        producto: Value(json['producto'] as String?),
        dosis: Value(json['dosis'] as String?),
        responsable: Value(json['responsable'] as String?),
        actualizadoEn: Value(DateTime.parse(json['actualizadoEn'] as String)),
        eliminado: Value(json['eliminado'] as bool? ?? false),
        estadoSync: const Value('sincronizado'),
      );

  AlertasCompanion _alertaDesdeJson(Map<String, dynamic> json) =>
      AlertasCompanion.insert(
        idAlerta: json['idAlerta'] as String,
        idAnimal: json['idAnimal'] as String,
        tipo: json['tipo'] as String,
        fechaProgramada: diaDesdeJson(json['fechaProgramada'] as String),
        idPlan: Value(json['idPlan'] as String?),
        descripcion: Value(json['descripcion'] as String?),
        estado: Value(json['estado'] as String? ?? 'pendiente'),
        actualizadoEn: Value(DateTime.parse(json['actualizadoEn'] as String)),
        eliminado: Value(json['eliminado'] as bool? ?? false),
      );
}
