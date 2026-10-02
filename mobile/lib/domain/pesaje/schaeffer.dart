/// Estimación morfométrica del peso vivo bovino (RF4).
///
/// El peso se estima con la fórmula de Schaeffer, que relaciona el perímetro
/// torácico y el largo corporal con el peso vivo:
///
///     PV = (PT² × LC) / k
///
/// donde PT es el perímetro torácico en centímetros, LC el largo corporal en
/// centímetros, PV el peso vivo en kilogramos y k la constante de ajuste.
///
/// El cálculo vive en el dispositivo porque el pesaje ocurre en el campo, sin
/// conexión: el personal necesita ver el peso en el momento de tomar la medida,
/// no cuando vuelva a tener señal. El servidor aplica la misma fórmula al
/// consolidar, de modo que es él quien custodia la constante en vigor; ambas
/// implementaciones se comprueban con los mismos casos.
library;

/// Constante de la fórmula para medidas en centímetros y peso en kilogramos,
/// según la formulación clásica recogida por Wangchuk et al. (2018).
///
/// Es el punto de partida y no el valor definitivo: las fórmulas clásicas se
/// derivaron en razas europeas, de conformación distinta a la del ganado cebú
/// predominante en el Chaco cruceño, y el diseño prevé calibrar la constante
/// contra una muestra de referencia pesada. Por eso es un parámetro de la
/// función y se guarda con cada pesaje, en lugar de estar fijada en el cálculo.
const double constanteBibliografica = 10838;

/// Rango de medida considerado plausible.
class RangoMedida {
  const RangoMedida(this.min, this.max, this.etiqueta, this.unidad);

  final double min;
  final double max;
  final String etiqueta;
  final String unidad;

  bool contiene(double valor) =>
      valor.isFinite && valor >= min && valor <= max;

  String get descripcion => '$min a $max $unidad';
}

/// Rangos de medida del ganado bovino.
///
/// El flujo del caso de uso CU-04 rechaza las medidas fuera de rango y pide
/// repetir la medición, porque un error de transcripción en el campo —una cinta
/// mal leída, un dígito de más— produce un peso absurdo que luego contamina el
/// historial de crecimiento del animal. Los límites cubren desde un ternero
/// recién nacido hasta un toro adulto de la zona, con holgura.
class Rangos {
  static const perimetroToracico =
      RangoMedida(60, 250, 'perímetro torácico', 'cm');
  static const largoCorporal = RangoMedida(50, 200, 'largo corporal', 'cm');
  static const pesoEstimado = RangoMedida(20, 1200, 'peso estimado', 'kg');
}

/// Medida fuera del rango plausible.
class MedidaFueraDeRango implements Exception {
  const MedidaFueraDeRango(this.rango, this.valor);

  final RangoMedida rango;
  final double valor;

  String get mensaje =>
      'El valor $valor de ${rango.etiqueta} está fuera del rango plausible '
      '(${rango.descripcion}). Repita la medición.';

  @override
  String toString() => mensaje;
}

/// Resultado de una estimación de peso.
class PesoEstimado {
  const PesoEstimado({required this.kilogramos, required this.constante});

  final double kilogramos;
  final double constante;
}

/// Estima el peso vivo a partir de las medidas corporales.
///
/// Valida los rangos antes de calcular y también el resultado: una combinación
/// de medidas individualmente plausibles puede arrojar un peso que no lo es.
///
/// Lanza [MedidaFueraDeRango] si una medida o el resultado salen de rango.
PesoEstimado estimarPeso({
  required double perimetroToracico,
  required double largoCorporal,
  double constante = constanteBibliografica,
}) {
  if (constante <= 0) {
    throw ArgumentError.value(
      constante,
      'constante',
      'La constante de la fórmula debe ser positiva',
    );
  }

  _verificar(Rangos.perimetroToracico, perimetroToracico);
  _verificar(Rangos.largoCorporal, largoCorporal);

  final bruto =
      (perimetroToracico * perimetroToracico * largoCorporal) / constante;
  final kilogramos = _redondear(bruto);

  _verificar(Rangos.pesoEstimado, kilogramos);

  return PesoEstimado(kilogramos: kilogramos, constante: constante);
}

/// Estima el peso devolviendo null en lugar de lanzar cuando las medidas aún no
/// son válidas.
///
/// Es la variante que usa el formulario de campo: mientras el usuario escribe,
/// una medida incompleta no es un error que haya que anunciar, simplemente no
/// permite calcular todavía.
PesoEstimado? estimarPesoONulo({
  required double? perimetroToracico,
  required double? largoCorporal,
  double constante = constanteBibliografica,
}) {
  if (perimetroToracico == null || largoCorporal == null) return null;
  try {
    return estimarPeso(
      perimetroToracico: perimetroToracico,
      largoCorporal: largoCorporal,
      constante: constante,
    );
  } on MedidaFueraDeRango {
    return null;
  }
}

/// Ganancia media diaria entre dos pesajes, en kilogramos por día.
///
/// Es el indicador que permite seguir la curva de crecimiento durante el
/// engorde. Devuelve null cuando las dos mediciones son del mismo día, porque
/// entonces el dato no existe en lugar de valer cero.
double? gananciaMediaDiaria({
  required DateTime fechaAnterior,
  required double pesoAnterior,
  required DateTime fechaActual,
  required double pesoActual,
}) {
  final dias =
      actualEnDias(fechaActual) - actualEnDias(fechaAnterior);
  if (dias <= 0) return null;

  return _redondear((pesoActual - pesoAnterior) / dias);
}

/// Días transcurridos desde la época, para comparar fechas como días del
/// almanaque y no como instantes.
double actualEnDias(DateTime fecha) =>
    DateTime.utc(fecha.year, fecha.month, fecha.day).millisecondsSinceEpoch /
    Duration.millisecondsPerDay;

void _verificar(RangoMedida rango, double valor) {
  if (!rango.contiene(valor)) throw MedidaFueraDeRango(rango, valor);
}

/// Redondeo a dos decimales, la precisión con que la base almacena el valor.
double _redondear(double valor) => (valor * 100).round() / 100;
