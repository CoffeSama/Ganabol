/// Manejo de las fechas que son días del almanaque y no instantes.
///
/// El sistema distingue dos clases de marca temporal. `actualizado_en` es un
/// instante: el momento exacto en que el servidor consolidó un cambio, y su
/// zona importa porque de él depende el orden de los cambios. En cambio la
/// fecha de un pesaje, la de un evento sanitario, la de nacimiento y la de
/// vencimiento de una tarea son días: un protocolo vence «el 17 de octubre»,
/// no «el 17 de octubre a las cero horas de un huso determinado».
///
/// El servidor las transmite como medianoche UTC. Interpretarlas como
/// instantes en un dispositivo situado al oeste de Greenwich —Bolivia está en
/// UTC−4— las desplaza al día anterior, y una tarea programada para hoy
/// aparece vencida ayer. Estas funciones conservan el día tal como se emitió.
library;

/// Convierte una fecha recibida del servidor en el día que representa.
///
/// Devuelve la medianoche local del mismo día del almanaque, de modo que las
/// funciones de presentación, que leen los componentes en hora local, muestren
/// la fecha correcta.
DateTime diaDesdeJson(String texto) {
  final instante = DateTime.parse(texto);
  final utc = instante.toUtc();
  return DateTime(utc.year, utc.month, utc.day);
}

/// Variante tolerante para los campos opcionales.
DateTime? diaDesdeJsonONulo(Object? valor) =>
    valor is String ? diaDesdeJson(valor) : null;

/// Expresa un día en la forma que espera el servidor: solo la parte de fecha.
///
/// Se toman los componentes locales y no los UTC, por la razón simétrica: la
/// fecha que el usuario eligió en el selector es la de su calendario.
String diaAJson(DateTime fecha) =>
    '${fecha.year.toString().padLeft(4, '0')}-'
    '${fecha.month.toString().padLeft(2, '0')}-'
    '${fecha.day.toString().padLeft(2, '0')}';

/// Días completos del almanaque entre dos fechas.
///
/// Compara solo los componentes de fecha, de modo que la hora a que se tomó
/// cada medición no altera el resultado.
int diasEntre(DateTime desde, DateTime hasta) =>
    DateTime(hasta.year, hasta.month, hasta.day)
        .difference(DateTime(desde.year, desde.month, desde.day))
        .inDays;
