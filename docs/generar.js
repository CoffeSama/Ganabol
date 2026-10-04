/**
 * Generador del documento de proyecto de grado.
 *
 * Compone un único documento en formato institucional UNIVALLE a partir de
 * las partes que lo integran. El contenido de los capítulos de análisis y
 * diseño se toma de los entregables técnicos del proyecto, de modo que el
 * documento final y esos entregables no puedan divergir.
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Footer, PageNumber, AlignmentType,
  TableOfContents, StyleLevel,
} = require('docx');
const U = require('./univalle');

const PARTES = [
  'p1_preliminares',
  'p2_intro_cap1',
  'p3_cap2',
  'p4_cap3',
  'p5_cap4',
  'p6_cap5',
  'p7_cap6_7',
  'p8_cierre',
  'p9_apendices',
];

function indiceDeContenido() {
  return [
    U.saltoPagina(),
    U.tituloSimple('ÍNDICE DE CONTENIDO', { before: 400, after: 360 }),
    new TableOfContents('Haga clic con el botón derecho y seleccione «Actualizar campos» para generar el índice.', {
      hyperlink: true,
      headingStyleRange: '1-3',
      stylesWithLevels: [
        new StyleLevel('Heading1', 1),
        new StyleLevel('Heading2', 2),
        new StyleLevel('Heading3', 3),
      ],
    }),
  ];
}

function construir() {
  const cuerpo = [];

  for (const nombre of PARTES) {
    const ruta = path.join(__dirname, 'partes', `${nombre}.js`);
    if (!fs.existsSync(ruta)) {
      console.warn(`  · parte pendiente: ${nombre}`);
      continue;
    }
    const parte = require(ruta)();
    cuerpo.push(...parte);
    console.log(`  · ${nombre}: ${parte.length} elementos`);

    // El índice se inserta después de las páginas preliminares.
    if (nombre === 'p1_preliminares') cuerpo.push(...indiceDeContenido());
  }

  return new Document({
    features: { updateFields: true },
    styles: {
      default: {
        document: { run: { font: U.FUENTE, size: U.CUERPO } },
        heading1: { run: { font: U.FUENTE, size: U.NIVEL1, bold: true, color: '000000' } },
        heading2: { run: { font: U.FUENTE, size: U.NIVEL2, bold: true, italics: true, color: '000000' } },
        heading3: { run: { font: U.FUENTE, size: U.NIVEL3, italics: true, color: '000000' } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },           // carta
          margin: { left: 1701, right: 1134, top: 1417, bottom: 1417 },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], font: U.FUENTE, size: U.CUERPO })],
          })],
        }),
      },
      children: cuerpo,
    }],
  });
}

const salida = path.join(__dirname, 'GanaBol_Proyecto_de_Grado.docx');
console.log('Componiendo el documento…');
Packer.toBuffer(construir()).then((b) => {
  fs.writeFileSync(salida, b);
  console.log(`Documento generado: ${path.basename(salida)} (${(b.length / 1024 / 1024).toFixed(1)} MB)`);
});
