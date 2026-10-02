import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/config/app_config.dart';

/// Indica si un código de estado representa una respuesta satisfactoria.
///
/// Comprobar el rango y no un código concreto evita un error sutil: el marco
/// del servidor responde 201 a las peticiones POST por omisión, de modo que
/// exigir un 200 exacto descarta como fallida una operación que sí ocurrió.
bool esSatisfactoria(int? codigo) =>
    codigo != null && codigo >= 200 && codigo < 300;

/// Cliente HTTP de la aplicación.
///
/// Adjunta el token de acceso a cada petición y, cuando el servidor responde
/// 401, intenta renovarlo una sola vez con el refresh token antes de dar la
/// sesión por terminada. El refresh dura 60 días porque el productor puede
/// pasar semanas sin conectividad y no debe quedar fuera del sistema al
/// volver a tener señal.
class ApiClient {
  ApiClient({FlutterSecureStorage? almacen})
      : _almacen = almacen ?? const FlutterSecureStorage() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiUrl,
        connectTimeout: AppConfig.timeoutConexion,
        receiveTimeout: AppConfig.timeoutRespuesta,
        headers: {'Content-Type': 'application/json'},
        // El cliente decide qué hacer con cada código; no se lanza excepción
        // por 4xx, que en este dominio son respuestas esperables.
        validateStatus: (codigo) => codigo != null && codigo < 500,
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (opciones, handler) async {
          final token = await _almacen.read(key: _claveAcceso);
          if (token != null) {
            opciones.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(opciones);
        },
        onResponse: (respuesta, handler) async {
          if (respuesta.statusCode == 401 &&
              !respuesta.requestOptions.path.contains('/auth/')) {
            final renovado = await _renovarToken();
            if (renovado) {
              try {
                final reintento = await _dio.fetch(respuesta.requestOptions);
                return handler.resolve(reintento);
              } on DioException catch (_) {
                // El reintento también falló: se deja pasar el 401 original.
              }
            }
          }
          handler.next(respuesta);
        },
      ),
    );
  }

  static const _claveAcceso = 'token_acceso';
  static const _claveRefresh = 'token_refresh';

  final FlutterSecureStorage _almacen;
  late final Dio _dio;

  Dio get dio => _dio;

  Future<void> guardarTokens(String acceso, String refresh) async {
    await _almacen.write(key: _claveAcceso, value: acceso);
    await _almacen.write(key: _claveRefresh, value: refresh);
  }

  Future<void> borrarTokens() async {
    await _almacen.delete(key: _claveAcceso);
    await _almacen.delete(key: _claveRefresh);
  }

  Future<bool> haySesion() async =>
      await _almacen.read(key: _claveRefresh) != null;

  Future<bool> _renovarToken() async {
    final refresh = await _almacen.read(key: _claveRefresh);
    if (refresh == null) return false;

    try {
      // Cliente aparte: este no lleva el interceptor, para no entrar en un
      // ciclo de renovación si el propio refresh devuelve 401.
      final limpio = Dio(BaseOptions(baseUrl: AppConfig.apiUrl));
      final respuesta = await limpio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refresh},
      );

      final nuevo = respuesta.data?['accessToken'] as String?;
      if (nuevo == null) return false;

      await _almacen.write(key: _claveAcceso, value: nuevo);
      return true;
    } on DioException catch (_) {
      return false;
    }
  }
}
