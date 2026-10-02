/// Generación de los identificadores de registro.
///
/// El sistema identifica cada registro con un ULID generado en el dispositivo.
/// Eso es lo que permite dar de alta un animal, un pesaje o un evento sin
/// conexión y consolidarlo después sin coordinar con el servidor ni arriesgar
/// colisiones.
///
/// El ULID se escribe en base32 de Crockford, cuyo alfabeto canónico es en
/// mayúsculas. La biblioteca que lo genera devuelve la forma en minúsculas, de
/// modo que normalizarla no es una cuestión estética: el identificador viaja
/// como clave primaria de longitud fija y el servidor valida el alfabeto
/// canónico. Sin esta normalización, todo registro creado en el dispositivo se
/// rechaza al sincronizar, que es justamente el escenario para el que el
/// sistema existe.
library;

import 'package:ulid/ulid.dart';

/// Identificador nuevo, en la forma canónica del alfabeto de Crockford.
String nuevoIdentificador() => Ulid().toString().toUpperCase();

/// Alfabeto de base32 de Crockford: dígitos y letras salvo I, L, O y U, que se
/// excluyen por confundirse con 1 y 0 al leerlas o dictarlas.
final RegExp patronUlid = RegExp(r'^[0-9A-HJKMNP-TV-Z]{26}$');

/// Indica si un texto tiene la forma de un ULID canónico.
///
/// Es la misma expresión con que el servidor valida lo que recibe, replicada
/// aquí para poder comprobar en las pruebas que lo que el dispositivo genera
/// es aceptable del otro lado.
bool esUlidValido(String texto) => patronUlid.hasMatch(texto);
