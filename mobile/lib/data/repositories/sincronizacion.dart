import 'animales_repository.dart';
import 'pesajes_repository.dart';
import 'sanidad_repository.dart';

/// Resultado agregado de una consolidación completa.
class ResultadoSincronizacion {
  const ResultadoSincronizacion({
    required this.enviados,
    required this.recibidos,
    this.error,
  });

  final int enviados;
  final int recibidos;
  final String? error;

  bool get exitoso => error == null;

  String get resumen => exitoso
      ? 'Sincronizado: $enviados enviados, $recibidos recibidos'
      : error!;
}

/// Coordina la consolidación de todas las entidades.
///
/// Cada repositorio sabe sincronizar lo suyo, pero el orden entre ellos no es
/// indiferente y ninguno puede imponerlo por su cuenta: un pesaje o un evento
/// se refieren a un animal, y una alerta se muestra junto a la caravana del
/// animal al que corresponde. Si la sanidad llegara antes que el inventario,
/// la bandeja quedaría momentáneamente con tareas de animales que el
/// dispositivo todavía no conoce.
///
/// Que el usuario pulse un solo botón y se consolide todo es además lo que
/// espera: para él «sincronizar» es una sola cosa, no tres.
class Sincronizacion {
  Sincronizacion(this._animales, this._pesajes, this._sanidad);

  final AnimalesRepository _animales;
  final PesajesRepository _pesajes;
  final SanidadRepository _sanidad;

  Future<ResultadoSincronizacion> ejecutar() async {
    // El inventario primero: es la entidad de la que dependen las demás.
    final inventario = await _animales.sincronizar();
    if (!inventario.exitoso) {
      return ResultadoSincronizacion(
        enviados: 0,
        recibidos: 0,
        error: inventario.error,
      );
    }

    // Las dos restantes no dependen entre sí, de modo que van a la par.
    final otras = await Future.wait([
      _pesajes.sincronizar(),
      _sanidad.sincronizar(),
    ]);

    final todas = [inventario, ...otras];

    // Un fallo parcial se informa, pero lo que sí se consolidó se conserva:
    // en el campo la conexión aparece y desaparece, y perder el avance de una
    // pasada porque la última entidad falló obligaría a repetirlo todo.
    final fallida = todas.where((r) => !r.exitoso).firstOrNull;

    return ResultadoSincronizacion(
      enviados: todas.fold(0, (suma, r) => suma + r.enviados),
      recibidos: todas.fold(0, (suma, r) => suma + r.recibidos),
      error: fallida?.error,
    );
  }
}
