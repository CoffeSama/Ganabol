import 'package:flutter/material.dart';

/// Tema de la aplicación.
///
/// Los criterios vienen del análisis de contexto: la app se usa a la
/// intemperie, con sol directo y frecuentemente con las manos sucias o
/// mojadas. De ahí el contraste alto, la tipografía grande y los objetivos
/// táctiles amplios.
class AppTheme {
  /// Verde del pastizal. Funciona como color de marca sin competir con los
  /// indicadores de estado, que son los que el productor necesita distinguir.
  static const Color _semilla = Color(0xFF2E6B3E);

  /// Altura mínima de los controles táctiles. Material recomienda 48;
  /// se sube a 56 porque el uso en campo es con la mano ocupada.
  static const double alturaObjetivoTactil = 56;

  static ThemeData get claro {
    final esquema = ColorScheme.fromSeed(
      seedColor: _semilla,
      brightness: Brightness.light,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: esquema,
      scaffoldBackgroundColor: esquema.surface,
      appBarTheme: AppBarTheme(
        backgroundColor: esquema.primary,
        foregroundColor: esquema.onPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: esquema.onPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(alturaObjetivoTactil),
          textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(alturaObjetivoTactil),
          textStyle: const TextStyle(fontSize: 17),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: esquema.surfaceContainerHighest.withValues(alpha: 0.4),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        labelStyle: const TextStyle(fontSize: 16),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: esquema.surfaceContainerLow,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      ),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        extendedSizeConstraints: BoxConstraints.tightFor(height: 60),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  /// Colores de los indicadores de estado del animal. Se definen aparte del
  /// esquema de marca porque su función es discriminar, no decorar.
  static Color colorEstado(String estado, ColorScheme esquema) =>
      switch (estado) {
        'ACTIVO' => const Color(0xFF2E7D32),
        'VENDIDO' => const Color(0xFF1565C0),
        'MUERTO' => esquema.error,
        'EXTRAVIADO' => const Color(0xFFE65100),
        _ => esquema.outline,
      };

  static Color colorFase(String fase) => switch (fase) {
        'CRIANZA' => const Color(0xFF7B1FA2),
        'DESTETE' => const Color(0xFF00838F),
        'ENGORDE' => const Color(0xFFEF6C00),
        _ => const Color(0xFF616161),
      };
}
