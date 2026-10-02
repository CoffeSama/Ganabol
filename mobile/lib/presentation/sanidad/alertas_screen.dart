import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../data/local/database.dart';
import '../../domain/fechas.dart';
import '../../domain/models/enums.dart';
import '../shared/etiqueta_estado.dart';

/// Bandeja de tareas del calendario sanitario (RF13, CU-13).
///
/// Es la pantalla con que el personal empieza la jornada: qué animales hay que
/// atender hoy y qué quedó atrasado. Las vencidas van primero porque son las
/// que ya tienen consecuencias.
class AlertasScreen extends ConsumerWidget {
  const AlertasScreen({super.key});

  /// Vencimiento expresado como lo diría una persona, no como una fecha.
  ///
  /// «Vence en 3 días» se entiende sin hacer la cuenta; «17 de octubre»
  /// obliga a recordar qué día es hoy.
  static String _plazo(DateTime programada) {
    final dias = diasEntre(DateTime.now(), programada);

    return switch (dias) {
      0 => 'Vence hoy',
      1 => 'Vence mañana',
      -1 => 'Venció ayer',
      < 0 => 'Venció hace ${-dias} días',
      _ => 'Vence en $dias días',
    };
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertasAsync = ref.watch(alertasProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendario sanitario'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            tooltip: 'Sincronizar',
            onPressed: () async {
              final resultado =
                  await ref.read(sincronizacionProvider).ejecutar();
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    resultado.exitoso
                        ? 'Calendario actualizado'
                        : resultado.error!,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: alertasAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('No se pudo cargar: $e')),
        data: (alertas) {
          if (alertas.isEmpty) return const _SinTareas();

          final vencidas =
              alertas.where((a) => a.alerta.estado == 'vencida').toList();
          final proximas =
              alertas.where((a) => a.alerta.estado != 'vencida').toList();

          return ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              if (vencidas.isNotEmpty) ...[
                _Encabezado(
                  texto: 'Atrasadas',
                  cantidad: vencidas.length,
                  color: Theme.of(context).colorScheme.error,
                ),
                for (final a in vencidas) _FilaAlerta(entrada: a),
              ],
              if (proximas.isNotEmpty) ...[
                _Encabezado(
                  texto: 'Próximas',
                  cantidad: proximas.length,
                  color: const Color(0xFFEF6C00),
                ),
                for (final a in proximas) _FilaAlerta(entrada: a),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _SinTareas extends StatelessWidget {
  const _SinTareas();

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.task_alt, size: 72, color: esquema.primary),
            const SizedBox(height: 18),
            const Text(
              'No hay tareas pendientes',
              style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Text(
              'El calendario no tiene vencimientos en los próximos 30 días.',
              textAlign: TextAlign.center,
              style: TextStyle(color: esquema.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}

class _Encabezado extends StatelessWidget {
  const _Encabezado({
    required this.texto,
    required this.cantidad,
    required this.color,
  });

  final String texto;
  final int cantidad;
  final Color color;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(left: 20, right: 20, top: 22, bottom: 6),
        child: Row(
          children: [
            Text(
              texto.toUpperCase(),
              style: TextStyle(
                fontSize: 12.5,
                letterSpacing: 1,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            const SizedBox(width: 8),
            EtiquetaEstado(texto: '$cantidad', color: color),
          ],
        ),
      );
}

class _FilaAlerta extends ConsumerWidget {
  const _FilaAlerta({required this.entrada});

  final AlertaConAnimal entrada;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final esquema = Theme.of(context).colorScheme;
    final alerta = entrada.alerta;
    final animal = entrada.animal;
    final color = AppTheme.colorAlerta(alerta.estado, esquema);

    return Card(
      child: ListTile(
        leading: Container(
          height: 46,
          width: 46,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.13),
            borderRadius: BorderRadius.circular(11),
          ),
          child: Icon(
            alerta.estado == 'vencida'
                ? Icons.warning_amber_rounded
                : Icons.event_outlined,
            color: color,
          ),
        ),
        title: Text(
          alerta.descripcion ?? 'Tarea sanitaria',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${animal.caravana}  ·  '
                '${CategoriaAnimal.desde(animal.categoria).etiqueta}',
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Text(
                    AlertasScreen._plazo(alerta.fechaProgramada),
                    style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                  Text(
                    '  ·  ${DateFormat('d MMM', 'es').format(alerta.fechaProgramada)}',
                    style: TextStyle(
                      fontSize: 13,
                      color: esquema.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        trailing: FilledButton.tonal(
          // El botón lleva directamente al registro del evento con el
          // protocolo ya elegido: desde la bandeja, la única acción que tiene
          // sentido es anotar que la tarea se hizo.
          onPressed: () => context.push(
            '/animales/${animal.idAnimal}/sanidad/nuevo'
            '${alerta.idPlan == null ? '' : '?plan=${alerta.idPlan}'}',
          ),
          style: FilledButton.styleFrom(
            minimumSize: const Size(0, 42),
            padding: const EdgeInsets.symmetric(horizontal: 14),
          ),
          child: const Text('Registrar'),
        ),
      ),
    );
  }
}
