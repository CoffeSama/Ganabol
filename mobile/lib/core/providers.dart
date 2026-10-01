import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/local/database.dart';
import '../../data/remote/api_client.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/repositories/animales_repository.dart';
import '../../domain/models/enums.dart';

// --- Infraestructura --------------------------------------------------------

final baseDatosProvider = Provider<BaseDatosLocal>((ref) {
  final db = BaseDatosLocal();
  ref.onDispose(db.close);
  return db;
});

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(
    ref.watch(apiClientProvider),
    ref.watch(baseDatosProvider),
  ),
);

final animalesRepositoryProvider = Provider<AnimalesRepository>(
  (ref) => AnimalesRepository(
    ref.watch(baseDatosProvider),
    ref.watch(apiClientProvider),
  ),
);

// --- Sesión -----------------------------------------------------------------

class SesionState {
  const SesionState({this.usuario, this.cargando = false});

  final Usuario? usuario;
  final bool cargando;

  bool get autenticado => usuario != null;
}

class SesionNotifier extends StateNotifier<SesionState> {
  SesionNotifier(this._auth) : super(const SesionState(cargando: true)) {
    _restaurar();
  }

  final AuthRepository _auth;

  /// Al abrir la app se intenta recuperar la sesión guardada. Si no hay red,
  /// el perfil no se puede confirmar contra el servidor; en ese caso se
  /// mantiene la sesión local, porque exigir conexión para entrar rompería
  /// el uso en campo.
  Future<void> _restaurar() async {
    if (!await _auth.haySesionActiva()) {
      state = const SesionState();
      return;
    }

    final usuario = await _auth.perfil();
    state = SesionState(usuario: usuario);
  }

  Future<String?> iniciarSesion(String email, String password) async {
    state = const SesionState(cargando: true);
    final resultado = await _auth.iniciarSesion(email, password);

    if (!resultado.exitoso) {
      state = const SesionState();
      return resultado.error;
    }

    state = SesionState(usuario: resultado.usuario);
    return null;
  }

  Future<void> cerrarSesion() async {
    await _auth.cerrarSesion();
    state = const SesionState();
  }
}

final sesionProvider =
    StateNotifierProvider<SesionNotifier, SesionState>(
  (ref) => SesionNotifier(ref.watch(authRepositoryProvider)),
);

// --- Inventario -------------------------------------------------------------

/// Filtros activos en la lista de animales.
class FiltrosAnimales {
  const FiltrosAnimales({this.busqueda, this.fase});

  final String? busqueda;
  final FaseManejo? fase;

  FiltrosAnimales copiarCon({
    String? busqueda,
    FaseManejo? fase,
    bool limpiarFase = false,
  }) =>
      FiltrosAnimales(
        busqueda: busqueda ?? this.busqueda,
        fase: limpiarFase ? null : (fase ?? this.fase),
      );
}

final filtrosProvider =
    StateProvider<FiltrosAnimales>((ref) => const FiltrosAnimales());

final potrerosProvider = StreamProvider<List<Potrero>>(
  (ref) => ref.watch(animalesRepositoryProvider).observarPotreros(),
);

final animalesProvider = StreamProvider<List<Animal>>((ref) {
  final filtros = ref.watch(filtrosProvider);
  return ref.watch(animalesRepositoryProvider).observar(
        busqueda: filtros.busqueda,
        fase: filtros.fase?.valor,
      );
});

final animalProvider = FutureProvider.family<Animal?, String>(
  (ref, id) => ref.watch(animalesRepositoryProvider).obtener(id),
);

/// Cantidad de registros esperando sincronización, para el indicador de la
/// barra superior.
final pendientesProvider = StreamProvider<int>((ref) async* {
  final repo = ref.watch(animalesRepositoryProvider);
  // Se recalcula cada vez que cambia el inventario local.
  await for (final _ in repo.observar()) {
    yield await repo.contarPendientes();
  }
});
