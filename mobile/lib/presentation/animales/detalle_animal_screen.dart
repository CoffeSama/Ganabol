import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../data/local/database.dart';
import '../../data/repositories/pesajes_repository.dart';
import '../../domain/fechas.dart';
import '../../domain/models/enums.dart';
import '../shared/etiqueta_estado.dart';

/// Ficha del animal.
///
/// Se organiza en tres pestañas porque las tres cosas que el productor
/// consulta de un animal son distintas y se consultan en momentos distintos:
/// sus datos de identificación, su evolución de peso y su historial sanitario.
/// Apilarlas en una sola lista obligaría a desplazarse para llegar a lo que se
/// vino a ver.
class DetalleAnimalScreen extends ConsumerStatefulWidget {
  const DetalleAnimalScreen({required this.animalId, super.key});

  final String animalId;

  @override
  ConsumerState<DetalleAnimalScreen> createState() =>
      _DetalleAnimalScreenState();
}

class _DetalleAnimalScreenState extends ConsumerState<DetalleAnimalScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _pestanas =
      TabController(length: 3, vsync: this)..addListener(_alCambiarPestana);

  @override
  void dispose() {
    _pestanas.dispose();
    super.dispose();
  }

  /// El botón de acción cambia según la pestaña, de modo que hay que
  /// redibujar al moverse entre ellas.
  void _alCambiarPestana() {
    if (!_pestanas.indexIsChanging) setState(() {});
  }

  Future<void> _confirmarBaja(Animal animal) async {
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

    if (confirmado != true || !mounted) return;
    await ref.read(animalesRepositoryProvider).eliminar(animal.idAnimal);
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final animalAsync = ref.watch(animalProvider(widget.animalId));
    final rol = ref.watch(sesionProvider).usuario?.rol;
    final id = widget.animalId;

    return Scaffold(
      appBar: AppBar(
        title: Text(animalAsync.valueOrNull?.caravana ?? 'Animal'),
        actions: [
          if ((rol?.puedeEditarAnimales ?? false) &&
              animalAsync.valueOrNull != null) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Editar',
              onPressed: () => context.push('/animales/$id/editar'),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: 'Dar de baja',
              onPressed: () => _confirmarBaja(animalAsync.value!),
            ),
          ],
        ],
        bottom: TabBar(
          controller: _pestanas,
          labelColor: Theme.of(context).colorScheme.onPrimary,
          unselectedLabelColor:
              Theme.of(context).colorScheme.onPrimary.withValues(alpha: 0.7),
          indicatorColor: Theme.of(context).colorScheme.onPrimary,
          tabs: const [
            Tab(text: 'Datos', icon: Icon(Icons.badge_outlined, size: 20)),
            Tab(text: 'Pesos', icon: Icon(Icons.monitor_weight_outlined, size: 20)),
            Tab(text: 'Sanidad', icon: Icon(Icons.medical_services_outlined, size: 20)),
          ],
        ),
      ),
      body: animalAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('No se pudo cargar: $e')),
        data: (animal) {
          if (animal == null) {
            return const Center(child: Text('El animal ya no existe'));
          }

          return TabBarView(
            controller: _pestanas,
            children: [
              _PestanaDatos(animal: animal),
              _PestanaPesos(animalId: id),
              _PestanaSanidad(animalId: id),
            ],
          );
        },
      ),
      floatingActionButton: switch (_pestanas.index) {
        1 when rol?.puedeRegistrarPesajes ?? false =>
          FloatingActionButton.extended(
            onPressed: () => context.push('/animales/$id/pesaje/nuevo'),
            icon: const Icon(Icons.straighten),
            label: const Text('Pesar'),
          ),
        2 when rol?.puedeRegistrarSanidad ?? false =>
          FloatingActionButton.extended(
            onPressed: () => context.push('/animales/$id/sanidad/nuevo'),
            icon: const Icon(Icons.vaccines_outlined),
            label: const Text('Registrar'),
          ),
        _ => null,
      },
    );
  }
}

// --- Datos -------------------------------------------------------------------

class _PestanaDatos extends StatelessWidget {
  const _PestanaDatos({required this.animal});

  final Animal animal;

  /// Edad expresada como la diría el productor, no en días.
  static String _edad(DateTime nacimiento) {
    final dias = diasEntre(nacimiento, DateTime.now());
    if (dias < 60) return '$dias días';
    final meses = (dias / 30.44).floor();
    if (meses < 24) return '$meses meses';
    final anios = (dias / 365.25).floor();
    final restantes = ((dias - anios * 365.25) / 30.44).floor();
    return restantes == 0 ? '$anios años' : '$anios años y $restantes meses';
  }

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;

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
                  animal.sexo == 'M' ? Icons.male : Icons.female,
                  size: 46,
                  color: AppTheme.colorFase(animal.fase),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                animal.caravana,
                style:
                    const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: [
                  EtiquetaEstado(
                    texto: FaseManejo.desde(animal.fase).etiqueta,
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
        const Divider(height: 40),
        _Dato(
          icono: animal.estadoSync == 'sincronizado'
              ? Icons.cloud_done_outlined
              : Icons.cloud_queue,
          etiqueta: 'Sincronización',
          valor: switch (animal.estadoSync) {
            'sincronizado' => 'Guardado en el servidor',
            'conflicto' => 'Conflicto: requiere revisión',
            _ => 'Pendiente de enviar',
          },
        ),
        _Dato(
          icono: Icons.schedule,
          etiqueta: 'Registrado',
          valor: DateFormat('d MMM yyyy, HH:mm', 'es').format(animal.creadoEn),
        ),
      ],
    );
  }
}

// --- Pesos -------------------------------------------------------------------

class _PestanaPesos extends ConsumerWidget {
  const _PestanaPesos({required this.animalId});

  final String animalId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historialAsync = ref.watch(pesajesProvider(animalId));

    return historialAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('No se pudo cargar: $e')),
      data: (historial) {
        if (historial.isEmpty) {
          return const _Vacio(
            icono: Icons.monitor_weight_outlined,
            titulo: 'Sin pesajes registrados',
            detalle: 'Medí el perímetro torácico y el largo corporal para '
                'estimar el peso sin báscula.',
          );
        }

        final ultimo = historial.first;

        return ListView(
          padding: const EdgeInsets.only(bottom: 90),
          children: [
            _ResumenPeso(historial: historial),
            const Divider(height: 8),
            for (final entrada in historial)
              _FilaPesaje(
                entrada: entrada,
                esUltimo: entrada.pesaje.idPesaje == ultimo.pesaje.idPesaje,
              ),
          ],
        );
      },
    );
  }
}

/// Peso actual y evolución desde la primera medición.
class _ResumenPeso extends StatelessWidget {
  const _ResumenPeso({required this.historial});

  final List<PesajeConGanancia> historial;

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    final actual = historial.first.pesaje;
    final primero = historial.last.pesaje;

    final dias = diasEntre(primero.fecha, actual.fecha);
    final total = actual.pesoEstimado - primero.pesoEstimado;
    final promedio = dias > 0 ? total / dias : null;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
      child: Column(
        children: [
          Text(
            'PESO ACTUAL ESTIMADO',
            style: TextStyle(
              fontSize: 11.5,
              letterSpacing: 1.1,
              fontWeight: FontWeight.w600,
              color: esquema.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 8),
          Text.rich(
            TextSpan(children: [
              TextSpan(
                text: actual.pesoEstimado.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: 44,
                  fontWeight: FontWeight.bold,
                  color: esquema.primary,
                  height: 1,
                ),
              ),
              TextSpan(
                text: '  kg',
                style: TextStyle(fontSize: 20, color: esquema.primary),
              ),
            ]),
          ),
          const SizedBox(height: 6),
          Text(
            DateFormat('d MMMM yyyy', 'es').format(actual.fecha),
            style: TextStyle(color: esquema.onSurfaceVariant, fontSize: 13),
          ),
          if (promedio != null) ...[
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _Metrica(
                    etiqueta: 'Ganancia total',
                    valor: '${total >= 0 ? '+' : ''}'
                        '${total.toStringAsFixed(1)} kg',
                    detalle: 'en $dias días',
                  ),
                ),
                Container(width: 1, height: 44, color: esquema.outlineVariant),
                Expanded(
                  child: _Metrica(
                    etiqueta: 'Ganancia diaria',
                    valor: '${promedio >= 0 ? '+' : ''}'
                        '${promedio.toStringAsFixed(2)} kg',
                    detalle: 'promedio del período',
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _Metrica extends StatelessWidget {
  const _Metrica({
    required this.etiqueta,
    required this.valor,
    required this.detalle,
  });

  final String etiqueta;
  final String valor;
  final String detalle;

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    return Column(
      children: [
        Text(
          etiqueta,
          style: TextStyle(fontSize: 11.5, color: esquema.onSurfaceVariant),
        ),
        const SizedBox(height: 4),
        Text(valor,
            style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w700)),
        const SizedBox(height: 2),
        Text(detalle,
            style: TextStyle(fontSize: 11, color: esquema.outline)),
      ],
    );
  }
}

class _FilaPesaje extends StatelessWidget {
  const _FilaPesaje({required this.entrada, required this.esUltimo});

  final PesajeConGanancia entrada;
  final bool esUltimo;

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    final p = entrada.pesaje;
    final ganancia = entrada.gananciaDiaria;

    return ListTile(
      leading: Container(
        height: 44,
        width: 44,
        decoration: BoxDecoration(
          color: esUltimo
              ? esquema.primary.withValues(alpha: 0.13)
              : esquema.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(11),
        ),
        child: Icon(
          Icons.straighten,
          size: 21,
          color: esUltimo ? esquema.primary : esquema.outline,
        ),
      ),
      title: Row(
        children: [
          Text(
            '${p.pesoEstimado.toStringAsFixed(1)} kg',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
          ),
          if (ganancia != null) ...[
            const SizedBox(width: 10),
            EtiquetaEstado(
              texto: '${ganancia >= 0 ? '+' : ''}'
                  '${ganancia.toStringAsFixed(2)} kg/día',
              color: ganancia >= 0
                  ? const Color(0xFF2E7D32)
                  : esquema.error,
            ),
          ],
        ],
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 3),
        child: Text(
          '${DateFormat('d MMM yyyy', 'es').format(p.fecha)}'
          '  ·  PT ${p.perimetroToracico.toStringAsFixed(0)} cm'
          '  ·  LC ${p.largoCorporal.toStringAsFixed(0)} cm',
          style: const TextStyle(fontSize: 13),
        ),
      ),
      trailing: p.estadoSync == 'sincronizado'
          ? null
          : Icon(
              p.estadoSync == 'conflicto'
                  ? Icons.error_outline
                  : Icons.cloud_queue,
              size: 20,
              color: p.estadoSync == 'conflicto'
                  ? esquema.error
                  : esquema.outline,
            ),
    );
  }
}

// --- Sanidad -----------------------------------------------------------------

class _PestanaSanidad extends ConsumerWidget {
  const _PestanaSanidad({required this.animalId});

  final String animalId;

  static IconData _icono(String tipo) => switch (tipo) {
        'vacunacion' => Icons.vaccines_outlined,
        'desparasitacion' => Icons.bug_report_outlined,
        'tratamiento' => Icons.healing_outlined,
        _ => Icons.fact_check_outlined,
      };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventosAsync = ref.watch(eventosProvider(animalId));
    final esquema = Theme.of(context).colorScheme;

    return eventosAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('No se pudo cargar: $e')),
      data: (eventos) {
        if (eventos.isEmpty) {
          return const _Vacio(
            icono: Icons.medical_services_outlined,
            titulo: 'Sin historial sanitario',
            detalle: 'Registrá las vacunas, desparasitaciones y tratamientos '
                'para tener la trazabilidad del animal.',
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.only(top: 8, bottom: 90),
          itemCount: eventos.length,
          separatorBuilder: (_, __) =>
              const Divider(height: 1, indent: 76, endIndent: 16),
          itemBuilder: (context, i) {
            final e = eventos[i];
            final detalles = [
              if (e.dosis != null) e.dosis!,
              if (e.responsable != null) e.responsable!,
            ].join('  ·  ');

            return ListTile(
              leading: Container(
                height: 44,
                width: 44,
                decoration: BoxDecoration(
                  color: esquema.primary.withValues(alpha: 0.11),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(_icono(e.tipo), size: 21, color: esquema.primary),
              ),
              title: Text(
                e.producto ?? TipoEventoSanitario.desde(e.tipo).etiqueta,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 3),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${TipoEventoSanitario.desde(e.tipo).etiqueta}'
                      '  ·  ${DateFormat('d MMM yyyy', 'es').format(e.fecha)}',
                      style: const TextStyle(fontSize: 13),
                    ),
                    if (detalles.isNotEmpty)
                      Text(
                        detalles,
                        style: TextStyle(
                            fontSize: 12.5, color: esquema.onSurfaceVariant),
                      ),
                  ],
                ),
              ),
              trailing: e.estadoSync == 'sincronizado'
                  ? null
                  : Icon(
                      e.estadoSync == 'conflicto'
                          ? Icons.error_outline
                          : Icons.cloud_queue,
                      size: 20,
                      color: e.estadoSync == 'conflicto'
                          ? esquema.error
                          : esquema.outline,
                    ),
            );
          },
        );
      },
    );
  }
}

// --- Compartido --------------------------------------------------------------

class _Vacio extends StatelessWidget {
  const _Vacio({
    required this.icono,
    required this.titulo,
    required this.detalle,
  });

  final IconData icono;
  final String titulo;
  final String detalle;

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icono, size: 64, color: esquema.outlineVariant),
            const SizedBox(height: 16),
            Text(titulo,
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(
              detalle,
              textAlign: TextAlign.center,
              style: TextStyle(color: esquema.onSurfaceVariant),
            ),
          ],
        ),
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
