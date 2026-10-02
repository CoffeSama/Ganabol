import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../data/local/database.dart';
import '../../domain/models/enums.dart';

/// Registro de un evento sanitario (RF5, CU-05).
///
/// Cuando el evento responde a un protocolo del calendario, indicarlo cierra
/// la alerta correspondiente. El campo es opcional porque el productor también
/// registra lo que no estaba previsto: una herida, un tratamiento puntual.
class FormularioEventoScreen extends ConsumerStatefulWidget {
  const FormularioEventoScreen({
    required this.animalId,
    this.idPlanSugerido,
    super.key,
  });

  final String animalId;

  /// Protocolo preseleccionado. Llega cuando se entra desde una alerta: el
  /// personal ya sabe qué venía a aplicar y no debería tener que elegirlo.
  final String? idPlanSugerido;

  @override
  ConsumerState<FormularioEventoScreen> createState() =>
      _FormularioEventoScreenState();
}

class _FormularioEventoScreenState
    extends ConsumerState<FormularioEventoScreen> {
  final _formulario = GlobalKey<FormState>();
  final _producto = TextEditingController();
  final _dosis = TextEditingController();
  final _responsable = TextEditingController();

  TipoEventoSanitario _tipo = TipoEventoSanitario.vacunacion;
  String? _idPlan;
  DateTime _fecha = DateTime.now();
  bool _guardando = false;
  bool _inicializado = false;

  @override
  void dispose() {
    _producto.dispose();
    _dosis.dispose();
    _responsable.dispose();
    super.dispose();
  }

  /// Toma el protocolo sugerido y deriva de él el tipo de evento, para que al
  /// entrar desde una alerta el formulario llegue ya resuelto.
  void _inicializarDesdeSugerencia(List<PlanSanitario> planes) {
    if (_inicializado) return;
    _inicializado = true;

    final sugerido = widget.idPlanSugerido;
    if (sugerido == null) return;

    final plan = planes.where((p) => p.idPlan == sugerido).firstOrNull;
    if (plan == null) return;

    _idPlan = plan.idPlan;
    _tipo = TipoEventoSanitario.desde(plan.tipoEvento);
    _producto.text = '';
  }

  Future<void> _elegirFecha() async {
    final elegida = await showDatePicker(
      context: context,
      initialDate: _fecha,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      locale: const Locale('es'),
      helpText: 'Fecha del evento',
    );
    if (elegida != null) setState(() => _fecha = elegida);
  }

  Future<void> _guardar() async {
    if (!_formulario.currentState!.validate()) return;

    setState(() => _guardando = true);

    await ref.read(sanidadRepositoryProvider).registrarEvento(
          idAnimal: widget.animalId,
          tipo: _tipo,
          fecha: _fecha,
          idPlan: _idPlan,
          producto: _texto(_producto),
          dosis: _texto(_dosis),
          responsable: _texto(_responsable),
        );

    if (!mounted) return;
    context.pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _idPlan == null
              ? '${_tipo.etiqueta} registrada'
              : '${_tipo.etiqueta} registrada y tarea marcada como atendida',
        ),
      ),
    );
  }

  static String? _texto(TextEditingController c) =>
      c.text.trim().isEmpty ? null : c.text.trim();

  @override
  Widget build(BuildContext context) {
    final animal = ref.watch(animalProvider(widget.animalId)).valueOrNull;
    final planesAsync = animal == null
        ? const AsyncValue<List<PlanSanitario>>.loading()
        : ref.watch(planesParaAnimalProvider(animal));

    final planes = planesAsync.valueOrNull ?? const <PlanSanitario>[];
    if (planes.isNotEmpty) _inicializarDesdeSugerencia(planes);

    // Solo los protocolos cuyo tipo coincide con el evento que se registra: un
    // tratamiento no puede cumplir un protocolo de vacunación.
    final aplicables =
        planes.where((p) => p.tipoEvento == _tipo.valor).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          animal == null ? 'Evento sanitario' : 'Sanidad · ${animal.caravana}',
        ),
      ),
      body: Form(
        key: _formulario,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            DropdownButtonFormField<TipoEventoSanitario>(
              initialValue: _tipo,
              decoration: const InputDecoration(
                labelText: 'Tipo de evento',
                prefixIcon: Icon(Icons.medical_services_outlined),
              ),
              items: [
                for (final t in TipoEventoSanitario.values)
                  DropdownMenuItem(value: t, child: Text(t.etiqueta)),
              ],
              onChanged: (t) => setState(() {
                if (t == null) return;
                _tipo = t;
                // El protocolo elegido puede no corresponder al nuevo tipo.
                _idPlan = null;
              }),
            ),
            const SizedBox(height: 18),
            if (aplicables.isNotEmpty) ...[
              DropdownButtonFormField<String?>(
                initialValue: _idPlan,
                isExpanded: true,
                decoration: const InputDecoration(
                  labelText: 'Protocolo del calendario (opcional)',
                  helperText: 'Si lo indicás, la tarea queda marcada como atendida',
                  helperMaxLines: 2,
                  prefixIcon: Icon(Icons.event_available_outlined),
                ),
                items: [
                  const DropdownMenuItem<String?>(
                    value: null,
                    child: Text('No responde a un protocolo'),
                  ),
                  for (final p in aplicables)
                    DropdownMenuItem(value: p.idPlan, child: Text(p.nombre)),
                ],
                onChanged: (v) => setState(() => _idPlan = v),
              ),
              const SizedBox(height: 18),
            ],
            TextFormField(
              controller: _producto,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                labelText: 'Producto aplicado',
                prefixIcon: Icon(Icons.vaccines_outlined),
              ),
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _dosis,
              decoration: const InputDecoration(
                labelText: 'Dosis',
                hintText: 'Por ejemplo, 5 ml',
                prefixIcon: Icon(Icons.science_outlined),
              ),
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _responsable,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(
                labelText: 'Responsable',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: 18),
            InkWell(
              onTap: _elegirFecha,
              borderRadius: BorderRadius.circular(12),
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Fecha del evento',
                  prefixIcon: Icon(Icons.event_outlined),
                ),
                child: Text(
                  DateFormat('d MMMM yyyy', 'es').format(_fecha),
                  style: const TextStyle(fontSize: 17),
                ),
              ),
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: _guardando ? null : _guardar,
              icon: _guardando
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.save_outlined),
              label: Text(_guardando ? 'Guardando…' : 'Registrar evento'),
            ),
          ],
        ),
      ),
    );
  }
}
