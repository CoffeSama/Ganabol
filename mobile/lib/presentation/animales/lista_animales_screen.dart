import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../data/local/database.dart';
import '../../domain/models/enums.dart';
import '../shared/etiqueta_estado.dart';

class ListaAnimalesScreen extends ConsumerStatefulWidget {
  const ListaAnimalesScreen({super.key});

  @override
  ConsumerState<ListaAnimalesScreen> createState() =>
      _ListaAnimalesScreenState();
}

class _ListaAnimalesScreenState extends ConsumerState<ListaAnimalesScreen> {
  final _busqueda = TextEditingController();
  bool _sincronizando = false;

  @override
  void dispose() {
    _busqueda.dispose();
    super.dispose();
  }

  Future<void> _sincronizar() async {
    setState(() => _sincronizando = true);
    final resultado =
        await ref.read(animalesRepositoryProvider).sincronizar();
    if (!mounted) return;
    setState(() => _sincronizando = false);

    final mensaje = resultado.exitoso
        ? 'Sincronizado: ${resultado.enviados} enviados, '
            '${resultado.recibidos} recibidos'
        : resultado.error!;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensaje),
        backgroundColor: resultado.exitoso
            ? null
            : Theme.of(context).colorScheme.errorContainer,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final animales = ref.watch(animalesProvider);
    final filtros = ref.watch(filtrosProvider);
    final pendientes = ref.watch(pendientesProvider).valueOrNull ?? 0;
    final sesion = ref.watch(sesionProvider);
    final puedeEditar = sesion.usuario?.rol.puedeEditarAnimales ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi hato'),
        actions: [
          if (pendientes > 0)
            Padding(
              padding: const EdgeInsets.only(right: 4),
              child: Center(
                child: Tooltip(
                  message: '$pendientes registro(s) sin sincronizar',
                  child: Chip(
                    avatar: const Icon(Icons.cloud_upload_outlined, size: 17),
                    label: Text('$pendientes'),
                    visualDensity: VisualDensity.compact,
                  ),
                ),
              ),
            ),
          IconButton(
            icon: _sincronizando
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2.4, color: Colors.white),
                  )
                : const Icon(Icons.sync),
            onPressed: _sincronizando ? null : _sincronizar,
            tooltip: 'Sincronizar',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(sesionProvider.notifier).cerrarSesion(),
            tooltip: 'Cerrar sesión',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(118),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Column(
              children: [
                TextField(
                  controller: _busqueda,
                  decoration: InputDecoration(
                    hintText: 'Buscar por caravana o nombre',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: Theme.of(context).colorScheme.surface,
                    suffixIcon: _busqueda.text.isEmpty
                        ? null
                        : IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _busqueda.clear();
                              ref.read(filtrosProvider.notifier).state =
                                  filtros.copiarCon(busqueda: '');
                            },
                          ),
                  ),
                  onChanged: (v) => ref.read(filtrosProvider.notifier).state =
                      filtros.copiarCon(busqueda: v),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 38,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _ChipFase(
                        etiqueta: 'Todas',
                        activo: filtros.fase == null,
                        alTocar: () =>
                            ref.read(filtrosProvider.notifier).state =
                                filtros.copiarCon(limpiarFase: true),
                      ),
                      for (final fase in FaseProductiva.values)
                        _ChipFase(
                          etiqueta: fase.etiqueta,
                          activo: filtros.fase == fase,
                          color: AppTheme.colorFase(fase.valor),
                          alTocar: () =>
                              ref.read(filtrosProvider.notifier).state =
                                  filtros.copiarCon(fase: fase),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: animales.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _MensajeCentral(
          icono: Icons.error_outline,
          titulo: 'No se pudo cargar el hato',
          detalle: '$e',
        ),
        data: (lista) {
          if (lista.isEmpty) {
            return _MensajeCentral(
              icono: Icons.inbox_outlined,
              titulo: filtros.busqueda?.isNotEmpty == true ||
                      filtros.fase != null
                  ? 'Ningún animal coincide con el filtro'
                  : 'Todavía no registraste animales',
              detalle: puedeEditar
                  ? 'Tocá el botón de abajo para registrar el primero.'
                  : null,
            );
          }

          return RefreshIndicator(
            onRefresh: _sincronizar,
            child: ListView.builder(
              padding: const EdgeInsets.only(top: 8, bottom: 96),
              itemCount: lista.length,
              itemBuilder: (context, i) => _TarjetaAnimal(animal: lista[i]),
            ),
          );
        },
      ),
      floatingActionButton: puedeEditar
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/animales/nuevo'),
              icon: const Icon(Icons.add),
              label: const Text('Registrar'),
            )
          : null,
    );
  }
}

class _ChipFase extends StatelessWidget {
  const _ChipFase({
    required this.etiqueta,
    required this.activo,
    required this.alTocar,
    this.color,
  });

  final String etiqueta;
  final bool activo;
  final VoidCallback alTocar;
  final Color? color;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(right: 8),
        child: FilterChip(
          label: Text(etiqueta),
          selected: activo,
          onSelected: (_) => alTocar(),
          backgroundColor: Theme.of(context).colorScheme.surface,
          selectedColor: (color ?? Theme.of(context).colorScheme.primary)
              .withValues(alpha: 0.18),
          showCheckmark: false,
        ),
      );
}

class _TarjetaAnimal extends StatelessWidget {
  const _TarjetaAnimal({required this.animal});

  final Animal animal;

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    final pendiente = animal.estadoSync == 'PENDIENTE';
    final conflicto = animal.estadoSync == 'CONFLICTO';

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => context.push('/animales/${animal.id}'),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                height: 50,
                width: 50,
                decoration: BoxDecoration(
                  color: AppTheme.colorFase(animal.fase).withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  animal.sexo == 'MACHO' ? Icons.male : Icons.female,
                  color: AppTheme.colorFase(animal.fase),
                  size: 26,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          animal.caravana,
                          style: const TextStyle(
                              fontSize: 17, fontWeight: FontWeight.bold),
                        ),
                        if (animal.nombre != null) ...[
                          const SizedBox(width: 8),
                          Flexible(
                            child: Text(
                              animal.nombre!,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  fontSize: 15,
                                  color: esquema.onSurfaceVariant),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        EtiquetaEstado(
                          texto: CategoriaAnimal.desde(animal.categoria)
                              .etiqueta,
                          color: esquema.outline,
                        ),
                        EtiquetaEstado(
                          texto:
                              FaseProductiva.desde(animal.fase).etiqueta,
                          color: AppTheme.colorFase(animal.fase),
                        ),
                        if (animal.estado != 'ACTIVO')
                          EtiquetaEstado(
                            texto:
                                EstadoAnimal.desde(animal.estado).etiqueta,
                            color:
                                AppTheme.colorEstado(animal.estado, esquema),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              if (conflicto)
                Tooltip(
                  message: 'Conflicto al sincronizar',
                  child: Icon(Icons.warning_amber_rounded,
                      color: esquema.error, size: 22),
                )
              else if (pendiente)
                Tooltip(
                  message: 'Pendiente de sincronizar',
                  child: Icon(Icons.cloud_queue,
                      color: esquema.onSurfaceVariant, size: 22),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MensajeCentral extends StatelessWidget {
  const _MensajeCentral({
    required this.icono,
    required this.titulo,
    this.detalle,
  });

  final IconData icono;
  final String titulo;
  final String? detalle;

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(36),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icono, size: 56, color: esquema.outlineVariant),
            const SizedBox(height: 18),
            Text(
              titulo,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 17, color: esquema.onSurfaceVariant),
            ),
            if (detalle != null) ...[
              const SizedBox(height: 8),
              Text(
                detalle!,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: esquema.outline),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
