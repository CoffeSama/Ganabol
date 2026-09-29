/// Configuración del entorno.
///
/// La URL de la API se inyecta en tiempo de compilación para que la misma
/// base de código sirva a los tres sabores (dev, staging, producción) sin
/// recompilar con constantes distintas escritas a mano.
///
///   flutter run --dart-define=API_URL=http://192.168.1.10:3000/api
class AppConfig {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    // 10.0.2.2 es el alias del host desde el emulador de Android.
    // Con un teléfono físico hay que pasar la IP de la máquina en la red local.
    defaultValue: 'http://10.0.2.2:3000/api',
  );

  static const Duration timeoutConexion = Duration(seconds: 10);
  static const Duration timeoutRespuesta = Duration(seconds: 15);
}
