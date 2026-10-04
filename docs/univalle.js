/**
 * Formato institucional UNIVALLE y conversión de contenido Markdown a
 * elementos de documento Word.
 *
 * El formato replica el de los documentos técnicos del proyecto: tamaño
 * carta, Arial 11 pt, interlineado 1,5, texto justificado, cuadros con
 * rótulo arriba y fuente abajo, y numeración de página centrada al pie.
 */
const fs = require('fs');
const path = require('path');
const {
  Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun,
  Table, TableRow, TableCell, WidthType, ShadingType, PageBreak,
} = require('docx');

const FUENTE = 'Arial';
const CUERPO = 22;        // 11 pt, en medios puntos
const NIVEL1 = 26;
const NIVEL2 = 24;
const NIVEL3 = 22;
const MENOR = 20;
const INTERLINEADO = 360; // 1,5 líneas
const SANGRIA = 709;
const ANCHO_TABLA = 9360; // dentro de los márgenes de la caja de texto

const MEDIA = path.join(__dirname, 'media');

// --- Bloques básicos ---------------------------------------------------------

function p(texto, opc = {}) {
  return new Paragraph({
    alignment: opc.alignment ?? AlignmentType.JUSTIFIED,
    spacing: { line: INTERLINEADO, after: opc.after ?? 120, before: opc.before ?? 0 },
    indent: opc.sinSangria ? undefined : { firstLine: SANGRIA },
    children: [new TextRun({
      text: texto, font: FUENTE, size: opc.size ?? CUERPO,
      bold: opc.bold, italics: opc.italics,
    })],
  });
}

/** Párrafo con tramos de formato mixto: [['texto', {bold:true}], …] */
function pMixto(tramos, opc = {}) {
  return new Paragraph({
    alignment: opc.alignment ?? AlignmentType.JUSTIFIED,
    spacing: { line: INTERLINEADO, after: opc.after ?? 120, before: opc.before ?? 0 },
    indent: opc.sinSangria ? undefined : { firstLine: SANGRIA },
    children: tramos.map(([t, f = {}]) => new TextRun({
      text: t, font: FUENTE, size: opc.size ?? CUERPO, ...f,
    })),
  });
}

function h1(numero, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 240, line: INTERLINEADO },
    children: [new TextRun({
      text: `${numero}\t${texto.toUpperCase()}`,
      font: FUENTE, size: NIVEL1, bold: true,
    })],
  });
}

function h2(numero, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 180, line: INTERLINEADO },
    children: [new TextRun({
      text: `${numero}\t${texto.toUpperCase()}`,
      font: FUENTE, size: NIVEL2, bold: true, italics: true,
    })],
  });
}

function h3(numero, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 160, line: INTERLINEADO },
    children: [new TextRun({ text: `${numero}\t${texto}`, font: FUENTE, size: NIVEL3, italics: true })],
  });
}

function portadaCapitulo(linea1, linea2) {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 2600, after: 240 },
      children: [new TextRun({ text: linea1, font: FUENTE, size: NIVEL1, bold: true })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER, spacing: { after: 480 },
      children: [new TextRun({ text: linea2, font: FUENTE, size: NIVEL1, bold: true })],
    }),
  ];
}

function saltoPagina() {
  return new Paragraph({ children: [new PageBreak()] });
}

/**
 * Título centrado sin numerar.
 *
 * Con `enIndice` se le asigna el estilo de encabezado de primer nivel, de modo
 * que el índice lo recoja. Sin esa marca, secciones como las conclusiones, las
 * referencias o los apéndices quedan fuera del índice, que es un defecto de
 * forma visible: el lector no encuentra en el índice una sección que existe.
 * La apariencia no cambia, porque la alineación y la tipografía se declaran de
 * forma explícita y prevalecen sobre las del estilo.
 */
function tituloSimple(texto, opc = {}) {
  return new Paragraph({
    heading: opc.enIndice ? HeadingLevel.HEADING_1 : undefined,
    alignment: opc.alignment ?? AlignmentType.CENTER,
    spacing: { before: opc.before ?? 240, after: opc.after ?? 240, line: INTERLINEADO },
    children: [new TextRun({ text: texto, font: FUENTE, size: opc.size ?? NIVEL1, bold: true })],
  });
}

// --- Cuadros -----------------------------------------------------------------

function celda(texto, ancho, { negrita = false, sombreado = false } = {}) {
  return new TableCell({
    width: { size: ancho, type: WidthType.DXA },
    shading: sombreado ? { type: ShadingType.CLEAR, fill: 'D9D9D9' } : undefined,
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    // Un salto de línea en el texto de la celda produce un párrafo propio: en
    // un cuadro de enumeraciones, como la matriz estratégica, correrlas
    // seguidas vuelve la celda ilegible.
    children: texto.split('\n').map((linea, i, todas) => new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 240, after: i === todas.length - 1 ? 0 : 60 },
      children: partirNegritas(linea).map(([t, f]) => new TextRun({
        text: t, font: FUENTE, size: 18, bold: negrita || f.bold,
      })),
    })),
  });
}

/**
 * Cuadro con rótulo arriba y fuente abajo, según la norma institucional.
 * `pesos` distribuye el ancho entre columnas; por omisión, reparto uniforme.
 */
function cuadro(numero, titulo, encabezados, filas, fuente, pesos) {
  // Un reparto que no coincide con el número de columnas se descarta en favor
  // del uniforme, para que un cambio en el cuadro de origen no rompa la
  // composición del documento.
  const reparto = pesos && pesos.length === encabezados.length
    ? pesos
    : encabezados.map(() => 1 / encabezados.length);
  const suma = reparto.reduce((a, b) => a + b, 0);
  const anchos = reparto.map((x) => Math.round((ANCHO_TABLA * x) / suma));

  return [
    new Paragraph({
      spacing: { before: 240, after: 100 }, keepNext: true,
      children: [
        new TextRun({ text: `Cuadro ${numero}. `, font: FUENTE, size: CUERPO, bold: true }),
        new TextRun({ text: titulo, font: FUENTE, size: CUERPO }),
      ],
    }),
    new Table({
      columnWidths: anchos,
      width: { size: ANCHO_TABLA, type: WidthType.DXA },
      rows: [
        new TableRow({
          tableHeader: true,
          children: encabezados.map((e, i) => celda(e, anchos[i], { negrita: true, sombreado: true })),
        }),
        ...filas.map((f) => new TableRow({
          // Se normaliza cada fila al número de columnas del encabezado: el
          // origen puede traer filas con celdas de más o de menos.
          children: anchos.map((ancho, i) => celda(String(f[i] ?? ''), ancho)),
        })),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 240 },
      children: [
        new TextRun({ text: 'Fuente: ', font: FUENTE, size: MENOR, bold: true }),
        new TextRun({ text: fuente, font: FUENTE, size: MENOR }),
      ],
    }),
  ];
}

// --- Figuras -----------------------------------------------------------------

/**
 * Figura con su rótulo y su fuente. La imagen se escala para no exceder ni el
 * ancho de la caja de texto ni el alto útil de la página.
 */
function figura(archivo, numero, titulo, fuente, { anchoMax = 430, altoMax = 560 } = {}) {
  const ruta = path.join(MEDIA, archivo);
  if (!fs.existsSync(ruta)) {
    return [p(`[Figura ${numero} no disponible: ${archivo}]`, { italics: true })];
  }

  const dim = dimensionesPng(ruta);
  let ancho = anchoMax;
  let alto = Math.round((dim.alto / dim.ancho) * ancho);
  if (alto > altoMax) {
    alto = altoMax;
    ancho = Math.round((dim.ancho / dim.alto) * alto);
  }

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 },
      children: [new ImageRun({
        type: 'png',
        data: fs.readFileSync(ruta),
        transformation: { width: ancho, height: alto },
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT, spacing: { after: 80 },
      children: [
        new TextRun({ text: `Figura ${numero}. `, font: FUENTE, size: CUERPO, bold: true }),
        new TextRun({ text: titulo, font: FUENTE, size: CUERPO }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT, spacing: { after: 240 },
      children: [
        new TextRun({ text: 'Fuente: ', font: FUENTE, size: MENOR, bold: true }),
        new TextRun({ text: fuente, font: FUENTE, size: MENOR }),
      ],
    }),
  ];
}

/** Lee ancho y alto de la cabecera IHDR de un PNG. */
function dimensionesPng(ruta) {
  const b = fs.readFileSync(ruta);
  return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
}

// --- Utilidades --------------------------------------------------------------

/** Separa los tramos en negrita de un texto con marcas Markdown. */
function partirNegritas(texto) {
  const partes = [];
  const re = /\*\*(.+?)\*\*/g;
  let ultimo = 0, m;
  while ((m = re.exec(texto)) !== null) {
    if (m.index > ultimo) partes.push([texto.slice(ultimo, m.index), {}]);
    partes.push([m[1], { bold: true }]);
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) partes.push([texto.slice(ultimo), {}]);
  return partes.length ? partes : [[texto, {}]];
}

/** Lista con viñeta manual, para enumeraciones breves dentro del cuerpo. */
function vinheta(texto) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: INTERLINEADO, after: 80 },
    indent: { left: 709, hanging: 283 },
    children: [
      new TextRun({ text: '— ', font: FUENTE, size: CUERPO }),
      ...partirNegritas(texto).map(([t, f]) => new TextRun({ text: t, font: FUENTE, size: CUERPO, ...f })),
    ],
  });
}


/**
 * Línea de código fuente o de salida de consola.
 *
 * Va en tipografía monoespaciada y con interlineado sencillo: el código se lee
 * por columnas tanto como por líneas, y el interlineado del cuerpo lo separa
 * hasta volverlo irreconocible como bloque.
 */
function lineaCodigo(texto) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 200, after: 0 },
    indent: { left: 283 },
    children: [new TextRun({
      text: texto.replace(/\t/g, '    ') || ' ',
      font: 'Courier New',
      size: 16,
    })],
  });
}

/** Bloque de código a partir de un arreglo de líneas. */
function bloqueCodigo(lineas) {
  return lineas.map(lineaCodigo);
}

/** Entrada de referencia bibliográfica con sangría francesa. */
function referencia(texto) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: INTERLINEADO, after: 100 },
    indent: { left: 567, hanging: 567 },
    children: [new TextRun({ text: texto, font: FUENTE, size: MENOR })],
  });
}

/** Entrada de glosario: término en negrita seguido de su definición. */
function glosa(termino, definicion) {
  return pMixto([[`${termino}. `, { bold: true }], [definicion]], { sinSangria: true, after: 120 });
}

module.exports = {
  FUENTE, CUERPO, NIVEL1, NIVEL2, NIVEL3, MENOR, INTERLINEADO, ANCHO_TABLA,
  p, pMixto, h1, h2, h3, portadaCapitulo, saltoPagina, tituloSimple,
  cuadro, figura, vinheta, referencia, glosa, partirNegritas,
  lineaCodigo, bloqueCodigo,
};
