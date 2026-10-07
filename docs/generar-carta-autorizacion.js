/**
 * Carta de autorización del propietario del establecimiento.
 *
 * La sección 3.9.3 del proyecto de grado afirma que el uso de los datos del
 * establecimiento «cuenta con autorización escrita de su propietario, que se
 * incorpora como anexo». Mientras el Anexo A esté vacío, esa afirmación no
 * tiene respaldo: este documento es el que lo da.
 *
 * Los datos del propietario, la fecha y la firma quedan en blanco. Son hechos
 * y los completa quien firma.
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
} = require('docx');
const U = require('./univalle');

const VACIO = '______________________________';

/** Párrafo del cuerpo de la carta, justificado y sin sangría de primera línea. */
function parrafo(texto) {
  return U.p(texto, { sinSangria: true, after: 200 });
}

/** Línea para completar a mano, con su rótulo debajo. */
function lineaFirma(rotulo, { ancho = 44 } = {}) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 60 },
      children: [new TextRun({ text: '_'.repeat(ancho), font: U.FUENTE, size: U.CUERPO })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: rotulo, font: U.FUENTE, size: U.MENOR })],
    }),
  ];
}

function construir() {
  const c = [];

  c.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({
      text: 'CARTA DE AUTORIZACIÓN PARA EL USO DE INFORMACIÓN',
      font: U.FUENTE, size: U.NIVEL1, bold: true,
    })],
  }));

  c.push(U.p(`Santa Cruz de la Sierra, ${VACIO} de 2026`,
    { sinSangria: true, alignment: AlignmentType.RIGHT, after: 400 }));

  c.push(U.p('Señores', { sinSangria: true, after: 0 }));
  c.push(U.p('UNIVERSIDAD PRIVADA DEL VALLE', { sinSangria: true, after: 0, bold: true }));
  c.push(U.p('Facultad de Informática y Electrónica', { sinSangria: true, after: 0 }));
  c.push(U.p('Carrera de Ingeniería de Sistemas Informáticos', { sinSangria: true, after: 0 }));
  c.push(U.p('Presente.—', { sinSangria: true, after: 400 }));

  c.push(U.p('De mi mayor consideración:', { sinSangria: true, after: 240 }));

  c.push(parrafo(`Yo, ${VACIO}, con cédula de identidad N.º ${VACIO}, en mi calidad de propietario del establecimiento ganadero ${VACIO}, ubicado en ${VACIO} del departamento de Santa Cruz, por medio de la presente autorizo al estudiante Carlos Mateo Ibáñez Rodríguez, de la carrera de Ingeniería de Sistemas Informáticos de esta casa de estudios, a emplear información de mi establecimiento como caso de aplicación de su proyecto de grado titulado «GanaBol: sistema móvil de gestión ganadera con funcionamiento sin conexión para explotaciones bovinas tradicionales del departamento de Santa Cruz, Bolivia».`));

  c.push(parrafo('La autorización comprende el uso de la siguiente información, con fines exclusivamente académicos:'));

  [
    'Los procesos de manejo del hato tal como se realizan en el establecimiento, incluidos el registro de animales, el control sanitario y el seguimiento de las fases de crianza, destete y engorde.',
    'Las condiciones de trabajo observadas en el predio: su extensión, la organización de los potreros, la disponibilidad de señal de telefonía móvil y el equipamiento que el personal utiliza.',
    'Los datos del hato necesarios para verificar el funcionamiento del sistema construido, entendiendo que se emplean como caso de prueba y no se publican en el documento.',
    'Fotografías de las instalaciones y de las actividades de manejo, sin que en ellas se identifique a persona alguna sin su consentimiento.',
  ].forEach((t) => c.push(U.vinheta(t)));

  c.push(parrafo('Dejo constancia de que esta autorización se otorga en el entendido de que la información productiva y comercial del establecimiento —el tamaño del hato, el estado sanitario de los animales y los precios de venta— tiene carácter sensible, no se publica en el documento del proyecto ni en ninguna presentación derivada de él, y se emplea únicamente para verificar el funcionamiento del sistema. Asimismo, autorizo a que el nombre del establecimiento sea mencionado en el documento en su carácter de caso de aplicación.'));

  c.push(parrafo('La presente autorización se otorga de forma voluntaria y sin que medie contraprestación económica alguna, y tiene vigencia hasta la conclusión y defensa del proyecto de grado.'));

  c.push(parrafo('Sin otro particular, saludo a ustedes atentamente.'));

  c.push(...lineaFirma('Firma del propietario'));
  c.push(U.p(`Nombre: ${VACIO}`, { sinSangria: true, alignment: AlignmentType.CENTER, after: 60 }));
  c.push(U.p(`Cédula de identidad: ${VACIO}`, { sinSangria: true, alignment: AlignmentType.CENTER, after: 60 }));
  c.push(U.p(`Teléfono de contacto: ${VACIO}`, { sinSangria: true, alignment: AlignmentType.CENTER, after: 0 }));

  return c;
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: U.FUENTE, size: U.CUERPO } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: {
          top: 1417, right: 1417, bottom: 1417, left: 1701,
        },
      },
    },
    children: construir(),
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const salida = path.join(__dirname, 'Carta_Autorizacion_Propietario.docx');
  fs.writeFileSync(salida, buffer);
  console.log(`Carta generada: ${path.basename(salida)} (${(buffer.length / 1024).toFixed(0)} KB)`);
});
