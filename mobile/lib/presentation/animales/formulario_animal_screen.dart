import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../domain/models/enums.dart';

/// Formulario de alta y edición de animales.
///
/// Solo la caravana, el sexo y la categoría son obligatorios: en campo el
/// productor rara vez tiene todos los datos a mano, y exigirlos empujaría a
/// cargar información inventada o a no registrar el animal.
class FormularioAnimalScreen extends ConsumerStatefulWidget {
  const FormularioAnimalScreen({this.animalId, super.key});

  /// Nulo cuando se está registrando un animal nuevo.
  final String? animalId;

  @override
  ConsumerState<FormularioAnimalScreen> createState() =>
      _FormularioAnimalScreenState();
}

class _FormularioAnimalScreenState
    extends ConsumerState<FormularioAnimalScreen> {
  final _formKey = GlobalKey<FormState>();
  final _caravana = TextEditingController();
  final _nombre = TextEditingController();
  final _raza = TextEditingController();
  final _observaciones = TextEditingController();

  Sexo _sexo = Sexo.macho;
  CategoriaAnimal _categoria = CategoriaAnimal.ternero;
  FaseProductiva _fase = FaseProductiva.crianza;
  EstadoAnimal _estado = EstadoAnimal.activo;
  DateTime? _fechaNacimiento;

  bool _guardando = false;
  bool _cargado = false;

  bool get _esEdicion => widget.animalId != null;

  /// Razas frecuentes en la zona, precargadas para evitar tipeo en campo.
  static const _razasFrecuentes = [
    'Nelore',
    'Brahman',
    'Criollo',
    'Santa Gertrudis',
    'Gyr',
    'Girolando',
  ];

  @override
  void dispose() {
    _caravana.dispose();
    _nombre.dispose();
    _raza.dispose();
    _observaciones.dispose();
    super.dispose();
  }

  void _precargar() {
    if (_cargado || !_esEdicion) return;
    final animal = ref.read(animalProvider(widget.animalId!)).valueOrNull;
    if (animal == null) return;

    _caravana.text = animal.caravana;
    _nombre.text = animal.nombre ?? '';
    _raza.text = animal.raza ?? '';
    _observaciones.text = animal.observaciones ?? '';
    _sexo = Sexo.desde(animal.sexo);
    _categoria = CategoriaAnimal.desde(animal.categoria);
    _fase = FaseProductiva.desde(animal.fase);
    _estado = EstadoAnimal.desde(animal.estado);
    _fechaNacimiento = animal.fechaNacimiento;
    _cargado = true;
  }

  Future<void> _elegirFecha() async {
    final hoy = DateTime.now();
    final fecha = await showDatePicker(
      context: context,
      initialDate: _fechaNacimiento ?? hoy,
      // Un bovino de más de 25 años es un dato erróneo, no un caso real.
      firstDate: DateTime(hoy.year - 25),
      lastDate: hoy,
      helpText: 'Fecha de nacimiento',
      locale: const Locale('es'),
    );
    if (fecha != null) setState(() => _fechaNacimiento = fecha);
  }

  Future<void> _guardar() async {
    if (!_formKey.currentState!.validate()) return;

    final predioId = ref.read(sesionProvider).usuario?.predioId;
    if (predioId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tu usuario no tiene un predio asignado')),
      );
      return;
    }

    setState(() => _guardando = true);
    final repo = ref.read(animalesRepositoryProvider);

    try {
      if (_esEdicion) {
        await repo.actualizar(
          widget.animalId!,
          caravana: _caravana.text.trim(),
          nombre: _nombre.text.trim().isEmpty ? null : _nombre.text.trim(),
          sexo: _sexo,
          raza: _raza.text.trim().isEmpty ? null : _raza.text.trim(),
          fechaNacimiento: _fechaNacimiento,
          categoria: _categoria,
          fase: _fase,
          estado: _estado,
          observaciones: _observaciones.text.trim().isEmpty
              ? null
              : _observaciones.text.trim(),
        );
      } else {
        await repo.registrar(
          caravana: _caravana.text.trim(),
          sexo: _sexo,
          categoria: _categoria,
          predioId: predioId,
          nombre: _nombre.text.trim().isEmpty ? null : _nombre.text.trim(),
          raza: _raza.text.trim().isEmpty ? null : _raza.text.trim(),
          fechaNacimiento: _fechaNacimiento,
          fase: _fase,
          observaciones: _observaciones.text.trim().isEmpty
              ? null
              : _observaciones.text.trim(),
        );
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_esEdicion ? 'Animal actualizado' : 'Animal registrado'),
        ),
      );
      context.pop();
    } catch (e) {
      if (!mounted) return;
      setState(() => _guardando = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '$e'.contains('UNIQUE')
                ? 'Ya existe un animal con esa caravana'
                : 'No se pudo guardar el animal',
          ),
          backgroundColor: Theme.of(context).colorScheme.errorContainer,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_esEdicion) {
      ref.watch(animalProvider(widget.animalId!));
      _precargar();
    }

    final categorias = CategoriaAnimal.segunSexo(_sexo);
    if (!categorias.contains(_categoria)) _categoria = categorias.first;

    return Scaffold(
      appBar: AppBar(
        title: Text(_esEdicion ? 'Editar animal' : 'Registrar animal'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 110),
          children: [
            TextFormField(
              controller: _caravana,
              decoration: const InputDecoration(
                labelText: 'Caravana *',
                hintText: 'Ej.: A-104',
                prefixIcon: Icon(Icons.tag),
              ),
              textCapitalization: TextCapitalization.characters,
              autofocus: !_esEdicion,
              validator: (v) => (v == null || v.trim().isEmpty)
                  ? 'La caravana es obligatoria'
                  : null,
            ),
            const SizedBox(height: 16),
            SegmentedButton<Sexo>(
              segments: [
                for (final s in Sexo.values)
                  ButtonSegment(
                    value: s,
                    label: Text(s.etiqueta),
                    icon: Icon(s == Sexo.macho ? Icons.male : Icons.female),
                  ),
              ],
              selected: {_sexo},
              onSelectionChanged: (sel) => setState(() => _sexo = sel.first),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<CategoriaAnimal>(
              initialValue: _categoria,
              decoration: const InputDecoration(
                labelText: 'Categoría *',
                prefixIcon: Icon(Icons.category_outlined),
              ),
              items: [
                for (final c in categorias)
                  DropdownMenuItem(value: c, child: Text(c.etiqueta)),
              ],
              onChanged: (v) => setState(() => _categoria = v!),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<FaseProductiva>(
              initialValue: _fase,
              decoration: const InputDecoration(
                labelText: 'Fase productiva',
                prefixIcon: Icon(Icons.timeline),
              ),
              items: [
                for (final f in FaseProductiva.values)
                  DropdownMenuItem(value: f, child: Text(f.etiqueta)),
              ],
              onChanged: (v) => setState(() => _fase = v!),
            ),
            if (_esEdicion) ...[
              const SizedBox(height: 16),
              DropdownButtonFormField<EstadoAnimal>(
                initialValue: _estado,
                decoration: const InputDecoration(
                  labelText: 'Estado',
                  prefixIcon: Icon(Icons.flag_outlined),
                ),
                items: [
                  for (final e in EstadoAnimal.values)
                    DropdownMenuItem(value: e, child: Text(e.etiqueta)),
                ],
                onChanged: (v) => setState(() => _estado = v!),
              ),
            ],
            const SizedBox(height: 26),
            Text(
              'Datos opcionales',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _nombre,
              decoration: const InputDecoration(
                labelText: 'Nombre',
                prefixIcon: Icon(Icons.badge_outlined),
              ),
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 16),
            Autocomplete<String>(
              initialValue: TextEditingValue(text: _raza.text),
              optionsBuilder: (valor) => valor.text.isEmpty
                  ? _razasFrecuentes
                  : _razasFrecuentes.where((r) =>
                      r.toLowerCase().contains(valor.text.toLowerCase())),
              onSelected: (r) => _raza.text = r,
              fieldViewBuilder: (context, controlador, foco, alEnviar) {
                controlador.addListener(() => _raza.text = controlador.text);
                return TextFormField(
                  controller: controlador,
                  focusNode: foco,
                  decoration: const InputDecoration(
                    labelText: 'Raza',
                    prefixIcon: Icon(Icons.pets_outlined),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: _elegirFecha,
              borderRadius: BorderRadius.circular(12),
              child: InputDecorator(
                decoration: InputDecoration(
                  labelText: 'Fecha de nacimiento',
                  prefixIcon: const Icon(Icons.cake_outlined),
                  suffixIcon: _fechaNacimiento == null
                      ? const Icon(Icons.calendar_today, size: 20)
                      : IconButton(
                          icon: const Icon(Icons.clear, size: 20),
                          onPressed: () =>
                              setState(() => _fechaNacimiento = null),
                        ),
                ),
                child: Text(
                  _fechaNacimiento == null
                      ? 'Sin especificar'
                      : DateFormat('d MMM yyyy', 'es')
                          .format(_fechaNacimiento!),
                  style: TextStyle(
                    fontSize: 16,
                    color: _fechaNacimiento == null
                        ? Theme.of(context).colorScheme.outline
                        : null,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _observaciones,
              decoration: const InputDecoration(
                labelText: 'Observaciones',
                alignLabelWithHint: true,
                prefixIcon: Icon(Icons.notes),
              ),
              maxLines: 3,
              maxLength: 500,
            ),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: EdgeInsets.fromLTRB(
          20,
          10,
          20,
          20 + MediaQuery.of(context).viewInsets.bottom,
        ),
        child: FilledButton.icon(
          onPressed: _guardando ? null : _guardar,
          icon: _guardando
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2.4),
                )
              : const Icon(Icons.check),
          label: Text(_esEdicion ? 'Guardar cambios' : 'Registrar animal'),
        ),
      ),
    );
  }
}
