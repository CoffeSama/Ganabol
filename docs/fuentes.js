/**
 * Lectura de los documentos técnicos del proyecto.
 *
 * Los siete entregables técnicos ya contienen el contenido en su forma
 * definitiva. Este módulo los lee desde su conversión a Markdown y extrae
 * párrafos y cuadros, de modo que el documento final los incorpore sin
 * transcribirlos a mano y sin riesgo de que diverjan de su origen.
 */
const fs = require('fs');
const path = require('path');

const ORIGEN = '/tmp/md';

const DOCS = {
  srs: '01_-_Documento_URS_y_SRS',
  procesos: '02_-_Diagrama_de_procesos',
  casosUso: '03_-_Casos_de_uso',
  uml: '04_-_Diagramas_UML',
  baseDatos: '05_-_Diagrama_de_base_de_datos',
  entidadRelacion: '06_-_Diagrama_entidad-relacion',
  decisiones: '07_-_Decisiones_tecnicas_y_despliegue',
};

const cache = {};

function leer(clave) {
  if (!cache[clave]) {
    cache[clave] = fs.readFileSync(path.join(ORIGEN, `${DOCS[clave]}.md`), 'utf8');
  }
  return cache[clave];
}

/** Devuelve el texto comprendido entre dos encabezados del documento. */
function seccion(clave, desde, hasta) {
  const texto = leer(clave);
  const i = texto.indexOf(desde);
  if (i < 0) throw new Error(`No se encontró «${desde}» en ${DOCS[clave]}`);
  const j = hasta ? texto.indexOf(hasta, i + desde.length) : -1;
  return texto.slice(i + desde.length, j < 0 ? undefined : j);
}

/**
 * Párrafos de prosa de un fragmento, descartando cuadros, figuras, rótulos,
 * encabezados y líneas de fuente.
 */
function parrafos(fragmento, { max } = {}) {
  // Se descartan primero las líneas estructurales en su forma original —que
  // conserva las marcas de Markdown— y recién después se limpia el texto,
  // porque un encabezado como «*3.1. Descripción*» no empieza por dígito
  // hasta que se le quitan los asteriscos.
  // Se descartan primero las líneas estructurales en su forma original —que
  // conserva las marcas de Markdown— y recién después se limpia el texto,
  // porque un encabezado como «*3.1. Descripción*» no empieza por dígito
  // hasta que se le quitan los asteriscos.
  const estructural = (l) =>
    l.startsWith('|') || l.startsWith('<') || l.startsWith('#') ||
    l.startsWith('-   ') || l.startsWith('- ');

  const rotulo = (l) =>
    l.startsWith('Cuadro ') || l.startsWith('Figura ') ||
    l.startsWith('Fuente:') || l.startsWith('Referencias');

  // Encabezado numerado del documento de origen: «3.1. Descripción».
  const encabezado = (l) => /^[0-9]+(\.[0-9]+)*\.?\s+\S/.test(l);

  const salida = fragmento
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !estructural(l))
    .map(limpiar)
    .filter((l) => l.length > 20 && !rotulo(l) && !encabezado(l));

  return max ? salida.slice(0, max) : salida;
}

/** Elementos de lista de un fragmento. */
function items(fragmento) {
  return fragmento
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-   ') || l.startsWith('- '))
    .map((l) => limpiar(l.replace(/^-\s+/, '')));
}

/**
 * Cuadro identificado por su rótulo. Devuelve { encabezados, filas }.
 *
 * pandoc antepone una fila vacía a los cuadros cuyo encabezado original estaba
 * sombreado, de modo que se descartan las filas sin contenido.
 */
function tabla(clave, rotulo) {
  const texto = leer(clave);
  // pandoc marca el rótulo en negrita: «**Cuadro 3.** Necesidades…»
  const marcado = rotulo.replace(/^(Cuadro [0-9]+\.)/, '**$1**');
  let i = texto.indexOf(marcado);
  if (i < 0) i = texto.indexOf(rotulo);
  if (i < 0) throw new Error(`No se encontró el cuadro «${rotulo}»`);

  const lineas = texto.slice(i).split('\n');
  const filas = [];
  let dentro = false;

  for (const linea of lineas) {
    const l = linea.trim();
    if (l.startsWith('|')) {
      dentro = true;
      if (/^\|[\s|:-]+\|$/.test(l)) continue; // separador
      const celdas = l.split('|').slice(1, -1).map((c) => limpiar(c.trim()));
      if (celdas.some((c) => c.length > 0)) filas.push(celdas);
    } else if (dentro && l.length > 0) {
      break;
    }
  }

  if (!filas.length) throw new Error(`El cuadro «${rotulo}» no tiene filas`);
  return { encabezados: filas[0], filas: filas.slice(1) };
}

/**
 * Primer cuadro que aparece después del marcador indicado. Sirve para las
 * fichas de requisito y de caso de uso, que no llevan rótulo de cuadro.
 */
function tablaDespuesDe(clave, marcador) {
  const texto = leer(clave);
  const i = texto.indexOf(marcador);
  if (i < 0) throw new Error(`No se encontró «${marcador}»`);

  const lineas = texto.slice(i + marcador.length).split('\n');
  const filas = [];
  let dentro = false;

  for (const linea of lineas) {
    const l = linea.trim();
    if (l.startsWith('|')) {
      dentro = true;
      if (/^\|[\s|:-]+\|$/.test(l)) continue;
      const celdas = l.split('|').slice(1, -1).map((c) => limpiar(c.trim()));
      if (celdas.some((c) => c.length > 0)) filas.push(celdas);
    } else if (dentro && l.length > 0) {
      break;
    }
  }
  if (!filas.length) throw new Error(`Sin filas tras «${marcador}»`);
  return filas;
}

/**
 * Primer cuadro HTML después del marcador. pandoc recurre a HTML cuando una
 * celda contiene varios párrafos, como ocurre en las fichas de caso de uso.
 */
function tablaHtmlDespuesDe(clave, marcador) {
  const texto = leer(clave);
  const i = texto.indexOf(marcador);
  if (i < 0) return null;

  const resto = texto.slice(i + marcador.length);
  const ini = resto.indexOf('<table>');
  if (ini < 0 || ini > 400) return null;
  const fin = resto.indexOf('</table>', ini);
  const bloque = resto.slice(ini, fin);

  return [...bloque.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((tr) =>
    [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((td) =>
      limpiar(td[1]
        .replace(/<\/p>\s*<p>/g, ' · ')
        .replace(/<br\s*\/?>/g, ' · '))),
  ).filter((f) => f.some((c) => c.length > 0));
}

/**
 * Ficha de requisito o de caso de uso como pares campo/valor, descartando la
 * fila de encabezado genérica que antepone el documento de origen.
 */
function ficha(clave, marcador) {
  const filas = tablaHtmlDespuesDe(clave, marcador) ?? tablaDespuesDe(clave, marcador);
  return filas
    .filter((f) => f.length >= 2 && !/^campo$/i.test(f[0]))
    .map((f) => [f[0], f.slice(1).filter(Boolean).join(' ')]);
}

/** Quita marcas de Markdown que no se trasladan al documento. */
function limpiar(texto) {
  return texto
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/\\([_*])/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Nombre del archivo de imagen que aparece en una sección del documento. */
function imagenes(clave) {
  const texto = leer(clave);
  return [...texto.matchAll(/media\/([a-f0-9]+\.(?:png|jpeg|jpg))/g)].map((m) => m[1]);
}

module.exports = { seccion, parrafos, items, tabla, tablaDespuesDe, tablaHtmlDespuesDe, ficha, imagenes, limpiar, leer };
