import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../domain/pesaje/schaeffer.dart';

/// Registro de un pesaje morfométrico (RF4, CU-04).
///
/// La pantalla está pensada para usarse en el corral, con el animal sujetado y
/// la cinta en la mano: dos campos numéricos grandes, el peso visible en todo
/// momento mientras se escribe, y un solo botón para guardar. El peso aparece
/// antes de guardar porque es el dato por el que el productor vino: si la
/// medición salió mal, quiere verlo y volver a medir, no guardar y después
/// descubrirlo.
class FormularioPesajeScreen extends ConsumerStatefulWidget {
  const FormularioPesajeScreen({required this.animalId, super.key});

  final String animalId;

  @override
  ConsumerState<FormularioPesajeScreen> createState() =>
      _FormularioPesajeScreenState();
}

class _FormularioPesajeScreenState
    extends ConsumerState<FormularioPesajeScreen> {
  final _formulario = GlobalKey<FormState>();
  final _perimetro = TextEditingController();
  final _largo = TextEditingController();

  DateTime _fecha = DateTime.now();
  bool _guardando = false;

  @override
  void dispose() {
    _perimetro.dispose();
    _largo.dispose();
    super.dispose();
  }

  double? get _valorPerimetro => double.tryParse(_perimetro.text.replaceAll(',', '.'));
  double? get _valorLargo => double.tryParse(_largo.text.replaceAll(',', '.'));

  PesoEstimado? get _peso => estimarPesoONulo(
        perimetroToracico: _valorPerimetro,
        largoCorporal: _valorLargo,
      );

  /// Validador de una medida contra su rango plausible.
  ///
  /// El mensaje dice qué rango se espera, no solo que el valor es inválido: en
  /// el campo, «repita la medición» sin más obliga a adivinar qué estuvo mal.
  String? _validarMedida(String? texto, RangoMedida rango) {
    if (texto == null || texto.trim().isEmpty) return 'Ingresá la medida';

    final valor = double.tryParse(texto.replaceAll(',', '.'));
    if (valor == null) return 'Ingresá un número';
    if (!rango.contiene(valor)) {
      return 'Fuera del rango plausible (${rango.descripcion})';
    }
    return null;
  }

  Future<void> _elegirFecha() async {
    final elegida = await showDatePicker(
      context: context,
      initialDate: _fecha,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
      locale: const Locale('es'),
      helpText: 'Fecha de la medición',
    );
    if (elegida != null) setState(() => _fecha = elegida);
  }

  Future<void> _guardar() async {
    if (!_formulario.currentState!.validate()) return;

    setState(() => _guardando = true);
    try {
      await ref.read(pesajesRepositoryProvider).registrar(
            idAnimal: widget.animalId,
            perimetroToracico: _valorPerimetro!,
            largoCorporal: _valorLargo!,
            fecha: _fecha,
          );

      if (!mounted) return;
      context.pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pesaje registrado')),
      );
    } on MedidaFueraDeRango catch (e) {
      if (!mounted) return;
      setState(() => _guardando = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.mensaje)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final animal = ref.watch(animalProvider(widget.animalId)).valueOrNull;
    final peso = _peso;

    return Scaffold(
      appBar: AppBar(
        title: Text(animal == null ? 'Pesaje' : 'Pesar ${animal.caravana}'),
      ),
      body: Form(
        key: _formulario,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _TarjetaPeso(peso: peso),
            const SizedBox(height: 28),
            TextFormField(
              controller: _perimetro,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]')),
              ],
              style: const TextStyle(fontSize: 22),
              decoration: const InputDecoration(
                labelText: 'Perímetro torácico',
                suffixText: 'cm',
                helperText: 'Justo detrás de la paleta, animal en posición cuadrada',
                helperMaxLines: 2,
                prefixIcon: Icon(Icons.straighten),
              ),
              validator: (v) => _validarMedida(v, Rangos.perimetroToracico),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _largo,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]')),
              ],
              style: const TextStyle(fontSize: 22),
              decoration: const InputDecoration(
                labelText: 'Largo corporal',
                suffixText: 'cm',
                helperText: 'Del encuentro a la punta de la nalga',
                prefixIcon: Icon(Icons.height),
              ),
              validator: (v) => _validarMedida(v, Rangos.largoCorporal),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 18),
            InkWell(
              onTap: _elegirFecha,
              borderRadius: BorderRadius.circular(12),
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Fecha de la medición',
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
              onPressed: _guardando || peso == null ? null : _guardar,
              icon: _guardando
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.save_outlined),
              label: Text(_guardando ? 'Guardando…' : 'Registrar pesaje'),
            ),
            const SizedBox(height: 16),
            Text(
              'El peso se estima con la fórmula de Schaeffer a partir de las dos '
              'medidas. No reemplaza una pesada en báscula: es una aproximación '
              'con un margen de error declarado.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12.5,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Peso estimado, en grande, visible mientras se toman las medidas.
class _TarjetaPeso extends StatelessWidget {
  const _TarjetaPeso({this.peso});

  final PesoEstimado? peso;

  @override
  Widget build(BuildContext context) {
    final esquema = Theme.of(context).colorScheme;
    final hay = peso != null;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 26),
      decoration: BoxDecoration(
        color: hay
            ? esquema.primary.withValues(alpha: 0.10)
            : esquema.surfaceContainerHighest.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hay
              ? esquema.primary.withValues(alpha: 0.3)
              : Colors.transparent,
        ),
      ),
      child: Column(
        children: [
          Text(
            'PESO ESTIMADO',
            style: TextStyle(
              fontSize: 12,
              letterSpacing: 1.2,
              fontWeight: FontWeight.w600,
              color: esquema.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 10),
          if (hay)
            Text.rich(
              TextSpan(
                children: [
                  TextSpan(
                    text: peso!.kilogramos.toStringAsFixed(1),
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: esquema.primary,
                      height: 1,
                    ),
                  ),
                  TextSpan(
                    text: '  kg',
                    style: TextStyle(fontSize: 22, color: esquema.primary),
                  ),
                ],
              ),
            )
          else
            Text(
              '— — —',
              style: TextStyle(
                fontSize: 42,
                color: esquema.outline,
                height: 1,
              ),
            ),
          const SizedBox(height: 8),
          Text(
            hay ? 'Ingresá la fecha y guardá' : 'Ingresá las dos medidas',
            style: TextStyle(fontSize: 13, color: esquema.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}
