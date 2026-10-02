import 'dart:async';

import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../local/database.dart';
import '../remote/api_client.dart';
import '../../domain/identificadores.dart';
import 'animales_repository.dart' show AnimalesRepository, ResultadoSync;
import '../../domain/fechas.dart';
import '../../domain/pesaje/schaeffer.dart';

/// Un pesaje junto a la ganancia media diaria respecto del anterior.
class PesajeConGanancia {
  const PesajeConGanancia({required this.pesaje, this.gananciaDiaria});

  final Pesaje pesaje;
  final double? gananciaDiaria;
}

/// Acceso al historial de pesos (RF4).
///
/// El peso se calcula en el dispositivo en el momento de tomar la medida,
/// porque es ahí donde hace falta: el personal mide con la cinta en el corral,
/// sin señal, y necesita el resultado para decidir si el animal está listo. La
/// escritura es local y la consolidación con el servidor ocurre después.
class PesajesRepository {
  PesajesRepository(this._db, this._api, this._animales);

  final BaseDatosLocal _db;
  final ApiClient _api;

  /// Se reutiliza la detección de conectividad del repositorio de inventario
  /// en lugar de duplicarla: es la misma condición del mismo dispositivo.
  final AnimalesRepository _animales;

  static const _entidad = 'pesaje';

  Stream<List<Pesaje>> observar(String idAnimal) => _db.observarPesajes(idAnimal);

  Stream<Map<String, double>> observarUltimoPeso() => _db.observarUltimoPeso();

  /// Historial con la ganancia media diaria de cada medición respecto de la
  /// anterior, de la más reciente a la más antigua.
  Stream<List<PesajeConGanancia>> observarConGanancia(String idAnimal) =>
      _db.observarPesajes(idAnimal).map((lista) {
        // La consulta devuelve de la más reciente a la más antigua, de modo que
        // la medición anterior a cada una es la siguiente de la lista.
        return [
          for (var i = 0; i < lista.length; i++)
            PesajeConGanancia(
              pesaje: lista[i],
              gananciaDiaria: i + 1 < lista.length
                  ? gananciaMediaDiaria(
                      fechaAnterior: lista[i + 1].fecha,
                      pesoAnterior: lista[i + 1].pesoEstimado,
                      fechaActual: lista[i].fecha,
                      pesoActual: lista[i].pesoEstimado,
                    )
                  : null,
            ),
        ];
      });

  /// Registra un pesaje a partir de las medidas corporales.
  ///
  /// Lanza [MedidaFueraDeRango] si las medidas o el peso resultante no son
  /// plausibles, de modo que la pantalla pueda pedir repetir la medición en
  /// lugar de guardar un dato que contaminaría el historial.
  Future<String> registrar({
    required String idAnimal,
    required double perimetroToracico,
    required double largoCorporal,
    required DateTime fecha,
    double constante = constanteBibliografica,
  }) async {
    final peso = estimarPeso(
      perimetroToracico: perimetroToracico,
      largoCorporal: largoCorporal,
      constante: constante,
    );

    final idPesaje = nuevoIdentificador();

    await _db.guardarPesaje(
      PesajesCompanion.insert(
        idPesaje: idPesaje,
        idAnimal: idAnimal,
        // Medianoche local, no UTC: la base local guarda la marca como
        // instante y la devuelve en hora local, de modo que una fecha fijada
        // en UTC volvería corrida un día en un huso al oeste de Greenwich.
        fecha: DateTime(fecha.year, fecha.month, fecha.day),
        perimetroToracico: perimetroToracico,
        largoCorporal: largoCorporal,
        pesoEstimado: peso.kilogramos,
        constante: peso.constante,
      ),
    );

    unawaited(sincronizar());
    return idPesaje;
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
    final pendientes = await _db.pesajesPendientes();
    var enviados = 0;

    for (final p in pendientes) {
      // El peso no se envía: lo recalcula el servidor a partir de las medidas,
      // que es lo que permite que una recalibración de la constante corrija el
      // valor consolidado sin que el dispositivo intervenga.
      final respuesta = await _api.dio.post<Map<String, dynamic>>(
        '/pesajes',
        data: {
          'idPesaje': p.idPesaje,
          'idAnimal': p.idAnimal,
          'fecha': diaAJson(p.fecha),
          'perimetroToracico': p.perimetroToracico,
          'largoCorporal': p.largoCorporal,
        },
      );

      final codigo = respuesta.statusCode ?? 0;
      if (esSatisfactoria(codigo)) {
        await _db.marcarPesajeSincronizado(p.idPesaje);
        enviados++;
      } else if (codigo == 400 || codigo == 404) {
        // El servidor rechazó las medidas o no conoce al animal. Reintentar no
        // va a cambiar el resultado: requiere que el usuario intervenga.
        await _db.marcarPesajeConflicto(p.idPesaje);
      }
    }

    return enviados;
  }

  Future<int> _traerCambios() async {
    final desde = await _db.ultimaSync(_entidad) ?? DateTime.utc(2000);

    final respuesta = await _api.dio.get<Map<String, dynamic>>(
      '/pesajes/cambios',
      queryParameters: {'desde': desde.toUtc().toIso8601String()},
    );

    if (!esSatisfactoria(respuesta.statusCode) || respuesta.data == null) return 0;

    final lista = (respuesta.data!['pesajes'] as List<dynamic>? ?? [])
        .cast<Map<String, dynamic>>();

    await _db.guardarPesajes(lista.map(_desdeJson).toList());

    final hasta = respuesta.data!['sincronizadoHasta'] as String?;
    if (hasta != null) await _db.registrarSync(_entidad, DateTime.parse(hasta));

    return lista.length;
  }

  PesajesCompanion _desdeJson(Map<String, dynamic> json) =>
      PesajesCompanion.insert(
        idPesaje: json['idPesaje'] as String,
        idAnimal: json['idAnimal'] as String,
        fecha: diaDesdeJson(json['fecha'] as String),
        // El servidor devuelve los valores decimales como texto para no perder
        // precisión en el tránsito por JSON.
        perimetroToracico: _aDouble(json['perimetroToracico']),
        largoCorporal: _aDouble(json['largoCorporal']),
        pesoEstimado: _aDouble(json['pesoEstimado']),
        constante: _aDouble(json['constante']),
        actualizadoEn: Value(DateTime.parse(json['actualizadoEn'] as String)),
        eliminado: Value(json['eliminado'] as bool? ?? false),
        estadoSync: const Value('sincronizado'),
      );

  static double _aDouble(dynamic valor) => switch (valor) {
        num n => n.toDouble(),
        String s => double.parse(s),
        _ => throw FormatException('Valor numérico no reconocido: $valor'),
      };
}
