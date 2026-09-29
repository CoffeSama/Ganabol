import 'package:flutter/material.dart';

/// Etiqueta compacta de estado, categoría o fase.
///
/// El color es siempre acompañado de texto: en campo la pantalla se lee con
/// sol directo y la distinción por color solo no es confiable.
class EtiquetaEstado extends StatelessWidget {
  const EtiquetaEstado({
    required this.texto,
    required this.color,
    super.key,
  });

  final String texto;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.13),
          borderRadius: BorderRadius.circular(7),
          border: Border.all(color: color.withValues(alpha: 0.35)),
        ),
        child: Text(
          texto,
          style: TextStyle(
            fontSize: 12.5,
            color: color,
            fontWeight: FontWeight.w600,
          ),
        ),
      );
}
