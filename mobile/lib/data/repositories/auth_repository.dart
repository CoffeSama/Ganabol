import 'package:dio/dio.dart';

import '../local/database.dart';
import '../remote/api_client.dart';
import '../../domain/models/enums.dart';

class ResultadoLogin {
  const ResultadoLogin({this.usuario, this.error});

  final Usuario? usuario;
  final String? error;

  bool get exitoso => usuario != null;
}

class AuthRepository {
  AuthRepository(this._api, this._db);

  final ApiClient _api;
  final BaseDatosLocal _db;

  Future<bool> haySesionActiva() => _api.haySesion();

  Future<ResultadoLogin> iniciarSesion(String email, String password) async {
    try {
      final respuesta = await _api.dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'email': email.trim().toLowerCase(), 'password': password},
      );

      if (respuesta.statusCode == 401) {
        return const ResultadoLogin(error: 'Correo o contraseña incorrectos');
      }
      if (respuesta.statusCode != 200 || respuesta.data == null) {
        return const ResultadoLogin(error: 'No se pudo iniciar sesión');
      }

      final datos = respuesta.data!;
      await _api.guardarTokens(
        datos['accessToken'] as String,
        datos['refreshToken'] as String,
      );

      return ResultadoLogin(
        usuario: Usuario.desdeJson(datos['usuario'] as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ResultadoLogin(error: switch (e.type) {
        DioExceptionType.connectionTimeout ||
        DioExceptionType.receiveTimeout =>
          'El servidor no respondió a tiempo',
        DioExceptionType.connectionError =>
          'No se pudo contactar al servidor. Revisá la conexión.',
        _ => 'Ocurrió un error al iniciar sesión',
      });
    }
  }

  Future<Usuario?> perfil() async {
    try {
      final respuesta =
          await _api.dio.get<Map<String, dynamic>>('/auth/perfil');
      if (respuesta.statusCode != 200 || respuesta.data == null) return null;
      return Usuario.desdeJson(respuesta.data!);
    } on DioException catch (_) {
      return null;
    }
  }

  /// Cierra la sesión y vacía la base local: los datos del predio no deben
  /// quedar al alcance del siguiente usuario del dispositivo.
  Future<void> cerrarSesion() async {
    await _api.borrarTokens();
    await _db.limpiar();
  }
}
