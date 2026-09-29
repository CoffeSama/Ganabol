import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../data/local/database.dart';
import '../../domain/models/enums.dart';
import '../shared/etiqueta_estado.dart';

class DetalleAnimalScreen extends ConsumerWidget {
  const DetalleAnimalScreen({required this.animalId, super.key});

  final String animalId;

  /// Edad expresada como la diría el productor, no en días.
  static String _edad(DateTime nacimiento) {
    final dias = DateTime.now().difference(nacimiento).inDays;
    if (dias < 60) return '$dias días';
    final meses = (dias / 30.44).floor();
    if (meses < 24) return '$meses meses';
    final anios = (dias / 365.25).floor();
    final restantes = ((dias - anios * 365.25) / 30.44).floor();
    return restantes == 0 ? '$anios años' : '$anios años y $restantes meses';
  }

  Future<void> _confirmarBaja(
    BuildContext context,
    WidgetRef ref,
    Animal animal,
  ) async {
    final confirmado = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Dar de baja'),
        content: Text(
          '¿Querés dar de baja a ${animal.caravana}? '
          'Dejará de aparecer en el hato.',
        ),
        actions: [
          TextButton(
            onPressed: () => context.pop(false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => context.pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Dar de baja'),
          ),
        ],
      ),
    );

    if (confirmado != true || !context.mounted) return;
    await ref.read(animalesRepositoryProvider).eliminar(animal.id);
    if (context.mounted) context.pop();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final animalAsync = ref.watch(animalProvider(animalId));
    final esquema = Theme.of(context).colorScheme;
    final puedeEditar =
        ref.watch(sesionProvider).usuario?.rol.puedeEditarAnimales ?? false;

    return Scaffold(
      appBar: AppBar(
        title: Text(animalAsync.valueOrNull?.caravana ?? 'Animal'),
        actions: [
          if (puedeEditar && animalAsync.valueOrNull != null) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Editar',
              onPressed: () => context.push('/animales/$animalId/editar'),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: 'Dar de baja',
              onPressed: () =>
                  _confirmarBaja(context, ref, animalAsync.value!),
            ),
          ],
        ],
      ),
      body: animalAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('No se pudo cargar: $e')),
        data: (animal) {
          if (animal == null) {
            return const Center(child: Text('El animal ya no existe'));
          }

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Center(
                child: Column(
                  children: [
                    Container(
                      height: 92,
                      width: 92,
                      decoration: BoxDecoration(
                        color: AppTheme.colorFase(animal.fase)
                            .withValues(alpha: 0.14),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        animal.sexo == 'MACHO' ? Icons.male : Icons.female,
                        size: 46,
                        color: AppTheme.colorFase(animal.fase),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      animal.caravana,
                      style: const TextStyle(
                          fontSize: 26, fontWeight: FontWeight.bold),
                    ),
                    if (animal.nombre != null)
                      Text(
                        animal.nombre!,
                        style: TextStyle(
                            fontSize: 17, color: esquema.onSurfaceVariant),
                      ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      children: [
                        EtiquetaEstado(
                          texto:
                              FaseProductiva.desde(animal.fase).etiqueta,
                          color: AppTheme.colorFase(animal.fase),
                        ),
                        EtiquetaEstado(
                          texto: EstadoAnimal.desde(animal.estado).etiqueta,
                          color: AppTheme.colorEstado(animal.estado, esquema),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              _Dato(
                icono: Icons.category_outlined,
                etiqueta: 'Categoría',
                valor: CategoriaAnimal.desde(animal.categoria).etiqueta,
              ),
              _Dato(
                icono: Icons.transgender,
                etiqueta: 'Sexo',
                valor: Sexo.desde(animal.sexo).etiqueta,
              ),
              _Dato(
                icono: Icons.pets_outlined,
                etiqueta: 'Raza',
                valor: animal.raza ?? 'Sin especificar',
                atenuado: animal.raza == null,
              ),
              _Dato(
                icono: Icons.cake_outlined,
                etiqueta: 'Nacimiento',
                valor: animal.fechaNacimiento == null
                    ? 'Sin especificar'
                    : '${DateFormat('d MMM yyyy', 'es').format(animal.fechaNacimiento!)}'
                        '  ·  ${_edad(animal.fechaNacimiento!)}',
                atenuado: animal.fechaNacimiento == null,
              ),
              if (animal.observaciones != null)
                _Dato(
                  icono: Icons.notes,
                  etiqueta: 'Observaciones',
                  valor: animal.observaciones!,
                ),
              const Divider(height: 40),
              _Dato(
                icono: animal.estadoSync == 'SINCRONIZADO'
                    ? Icons.cloud_done_outlined
                    : Icons.cloud_queue,
                etiqueta: 'Sincronización',
                valor: switch (animal.estadoSync) {
                  'SINCRONIZADO' => 'Guardado en el servidor',
                  'CONFLICTO' => 'Conflicto: requiere revisión',
                  _ => 'Pendiente de enviar',
                },
              ),
              _Dato(
                icono: Icons.schedule,
                etiqueta: 'Registrado',
                valor:
                    DateFormat('d MMM yyyy, HH:mm', 'es').format(animal.createdAt),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _Dato extends StatelessWidget {
  const _Dato({
    required this.icono,
    required this.etiqueta,
    required this.valor,
    this.atenuado = false,
  });

  final IconData icono;
  final String etiqueta;
  final String valor;
  final bool atenuado;

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 11),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icono, size: 21, color: esquema.outline),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  etiqueta,
                  style: TextStyle(
                      fontSize: 12.5, color: esquema.onSurfaceVariant),
                ),
                const SizedBox(height: 3),
                Text(
                  valor,
                  style: TextStyle(
                    fontSize: 16,
                    color: atenuado ? esquema.outline : null,
                    fontStyle: atenuado ? FontStyle.italic : null,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
