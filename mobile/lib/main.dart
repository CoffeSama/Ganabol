import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'core/providers.dart';
import 'core/theme/app_theme.dart';
import 'presentation/auth/login_screen.dart';
import 'presentation/animales/lista_animales_screen.dart';
import 'presentation/animales/detalle_animal_screen.dart';
import 'presentation/animales/formulario_animal_screen.dart';
import 'presentation/pesaje/formulario_pesaje_screen.dart';
import 'presentation/sanidad/alertas_screen.dart';
import 'presentation/sanidad/formulario_evento_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es');
  runApp(const ProviderScope(child: GanaBolApp()));
}

class GanaBolApp extends ConsumerWidget {
  const GanaBolApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sesion = ref.watch(sesionProvider);

    if (sesion.cargando) {
      return MaterialApp(
        theme: AppTheme.claro,
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    return MaterialApp.router(
      title: 'GanaBol',
      theme: AppTheme.claro,
      debugShowCheckedModeBanner: false,
      locale: const Locale('es'),
      supportedLocales: const [Locale('es'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: _router(sesion.autenticado),
    );
  }

  GoRouter _router(bool autenticado) => GoRouter(
        initialLocation: autenticado ? '/animales' : '/login',
        redirect: (context, estado) {
          final enLogin = estado.matchedLocation == '/login';
          if (!autenticado) return enLogin ? null : '/login';
          if (enLogin) return '/animales';
          return null;
        },
        routes: [
          GoRoute(
            path: '/login',
            builder: (context, estado) => const LoginScreen(),
          ),
          GoRoute(
            path: '/animales',
            builder: (context, estado) => const ListaAnimalesScreen(),
            routes: [
              GoRoute(
                path: 'nuevo',
                builder: (context, estado) => const FormularioAnimalScreen(),
              ),
              GoRoute(
                path: 'alertas',
                builder: (context, estado) => const AlertasScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, estado) => DetalleAnimalScreen(
                  animalId: estado.pathParameters['id']!,
                ),
                routes: [
                  GoRoute(
                    path: 'editar',
                    builder: (context, estado) => FormularioAnimalScreen(
                      animalId: estado.pathParameters['id']!,
                    ),
                  ),
                  GoRoute(
                    path: 'pesaje/nuevo',
                    builder: (context, estado) => FormularioPesajeScreen(
                      animalId: estado.pathParameters['id']!,
                    ),
                  ),
                  GoRoute(
                    path: 'sanidad/nuevo',
                    builder: (context, estado) => FormularioEventoScreen(
                      animalId: estado.pathParameters['id']!,
                      // La bandeja de alertas llega con el protocolo ya
                      // elegido, para que el personal no tenga que volver a
                      // indicar qué venía a aplicar.
                      idPlanSugerido: estado.uri.queryParameters['plan'],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      );
}
